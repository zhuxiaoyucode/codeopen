import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { ChatMessage } from '../models/ChatMessage';

interface ConnectedUser {
  userId: string;
  username: string;
}

type AuthPayload = { userId: string };

export function setupSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost'],
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // 房间在线人数统计（简化实现，内存中维护）
  const roomToUsers = new Map<string, Map<string, ConnectedUser>>();

  io.use((socket, next) => {
    const token = (socket.handshake.auth?.token as string) || (socket.handshake.headers['authorization'] as string)?.replace('Bearer ', '') || '';
    if (!token) {
      // 未登录则标记为访客，仅允许加入房间但不允许发言
      (socket as any).guest = true;
      return next();
    }
    try {
      const secret = process.env.JWT_SECRET || 'dev-default-jwt-secret';
      const payload = jwt.verify(token, secret) as AuthPayload;
      (socket as any).userId = payload.userId;
      (socket as any).username = socket.handshake.auth?.username || '用户';
      return next();
    } catch (e) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    const { room } = socket.handshake.query as { room?: string };
    const roomName = room && typeof room === 'string' ? room : undefined;
    if (!roomName) return;

    socket.join(roomName);

    const userId = (socket as any).userId as string | undefined;
    const username = (socket as any).username as string | undefined;
    const isGuest = (socket as any).guest === true;

    if (!roomToUsers.has(roomName)) roomToUsers.set(roomName, new Map());
    const usersMap = roomToUsers.get(roomName)!;

    if (userId && username) {
      usersMap.set(socket.id, { userId, username });
    } else {
      usersMap.set(socket.id, { userId: 'guest', username: '访客' });
    }

    const authedCount = Array.from(usersMap.values()).filter(u => u.userId && u.userId !== 'guest').length;
    io.to(roomName).emit('chat:presence', { onlineCount: authedCount });

    socket.on('chat:message', async (payload: { text: string }) => {
      if (isGuest || !userId) {
        socket.emit('chat:error', { error: '未登录用户不可发言' });
        return;
      }
      const text = (payload?.text || '').toString().slice(0, 2000);
      const timestamp = Date.now();

      // 持久化到数据库
      try {
        await ChatMessage.create({
          room: roomName,
          userId,
          username: username || '用户',
          text,
          createdAt: new Date(timestamp),
        });
      } catch (e) {
        // 持久化失败不阻塞广播，但记录错误
        console.error('保存聊天消息失败:', e);
      }

      io.to(roomName).emit('chat:message', {
        userId,
        username,
        text,
        timestamp,
      });
    });

    socket.on('disconnect', () => {
      const users = roomToUsers.get(roomName);
      if (users) {
        users.delete(socket.id);
        const authedCount = Array.from(users.values()).filter(u => u.userId && u.userId !== 'guest').length;
        io.to(roomName).emit('chat:presence', { onlineCount: authedCount });
      }
    });
  });

  return io;
}
