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
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000', 
        'http://localhost',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://0.0.0.0:3000',
        'http://192.168.1.100:3000',
        'http://192.168.1.101:3000',
        'http://192.168.1.102:3000',
        'http://192.168.1.103:3000',
        'http://192.168.1.104:3000',
        'http://192.168.1.105:3000',
        'http://192.168.1.106:3000',
        'http://192.168.1.107:3000',
        'http://192.168.1.108:3000',
        'http://192.168.1.109:3000',
        'http://192.168.1.110:3000',
        'http://192.168.1.111:3000',
        'http://192.168.1.112:3000',
        'http://192.168.1.113:3000',
        'http://192.168.1.114:3000',
        'http://192.168.1.115:3000',
        'http://192.168.1.116:3000',
        'http://192.168.1.117:3000',
        'http://192.168.1.118:3000',
        'http://192.168.1.119:3000',
        'http://192.168.1.120:3000',
        'http://192.168.1.121:3000',
        'http://192.168.1.122:3000',
        'http://192.168.1.123:3000',
        'http://192.168.1.124:3000',
        'http://192.168.1.125:3000',
        'http://192.168.1.126:3000',
        'http://192.168.1.127:3000',
        'http://192.168.1.128:3000',
        'http://192.168.1.129:3000',
        'http://192.168.1.130:3000',
        'http://192.168.1.131:3000',
        'http://192.168.1.132:3000',
        'http://192.168.1.133:3000',
        'http://192.168.1.134:3000',
        'http://192.168.1.135:3000',
        'http://192.168.1.136:3000',
        'http://192.168.1.137:3000',
        'http://192.168.1.138:3000',
        'http://192.168.1.139:3000',
        'http://192.168.1.140:3000',
        'http://192.168.1.141:3000',
        'http://192.168.1.142:3000',
        'http://192.168.1.143:3000',
        'http://192.168.1.144:3000',
        'http://192.168.1.145:3000',
        'http://192.168.1.146:3000',
        'http://192.168.1.147:3000',
        'http://192.168.1.148:3000',
        'http://192.168.1.149:3000',
        'http://192.168.1.150:3000',
        'http://192.168.1.151:3000',
        'http://192.168.1.152:3000',
        'http://192.168.1.153:3000',
        'http://192.168.1.154:3000',
        'http://192.168.1.155:3000',
        'http://192.168.1.156:3000',
        'http://192.168.1.157:3000',
        'http://192.168.1.158:3000',
        'http://192.168.1.159:3000',
        'http://192.168.1.160:3000',
        'http://192.168.1.161:3000',
        'http://192.168.1.162:3000',
        'http://192.168.1.163:3000',
        'http://192.168.1.164:3000',
        'http://192.168.1.165:3000',
        'http://192.168.1.166:3000',
        'http://192.168.1.167:3000',
        'http://192.168.1.168:3000',
        'http://192.168.1.169:3000',
        'http://192.168.1.170:3000',
        'http://192.168.1.171:3000',
        'http://192.168.1.172:3000',
        'http://192.168.1.173:3000',
        'http://192.168.1.174:3000',
        'http://192.168.1.175:3000',
        'http://192.168.1.176:3000',
        'http://192.168.1.177:3000',
        'http://192.168.1.178:3000',
        'http://192.168.1.179:3000',
        'http://192.168.1.180:3000',
        'http://192.168.1.181:3000',
        'http://192.168.1.182:3000',
        'http://192.168.1.183:3000',
        'http://192.168.1.184:3000',
        'http://192.168.1.185:3000',
        'http://192.168.1.186:3000',
        'http://192.168.1.187:3000',
        'http://192.168.1.188:3000',
        'http://192.168.1.189:3000',
        'http://192.168.1.190:3000',
        'http://192.168.1.191:3000',
        'http://192.168.1.192:3000',
        'http://192.168.1.193:3000',
        'http://192.168.1.194:3000',
        'http://192.168.1.195:3000',
        'http://192.168.1.196:3000',
        'http://192.168.1.197:3000',
        'http://192.168.1.198:3000',
        'http://192.168.1.199:3000',
        'http://192.168.1.200:3000',
        'http://192.168.1.201:3000',
        'http://192.168.1.202:3000',
        'http://192.168.1.203:3000',
        'http://192.168.1.204:3000',
        'http://192.168.1.205:3000',
        'http://192.168.1.206:3000',
        'http://192.168.1.207:3000',
        'http://192.168.1.208:3000',
        'http://192.168.1.209:3000',
        'http://192.168.1.210:3000',
        'http://192.168.1.211:3000',
        'http://192.168.1.212:3000',
        'http://192.168.1.213:3000',
        'http://192.168.1.214:3000',
        'http://192.168.1.215:3000',
        'http://192.168.1.216:3000',
        'http://192.168.1.217:3000',
        'http://192.168.1.218:3000',
        'http://192.168.1.219:3000',
        'http://192.168.1.220:3000',
        'http://192.168.1.221:3000',
        'http://192.168.1.222:3000',
        'http://192.168.1.223:3000',
        'http://192.168.1.224:3000',
        'http://192.168.1.225:3000',
        'http://192.168.1.226:3000',
        'http://192.168.1.227:3000',
        'http://192.168.1.228:3000',
        'http://192.168.1.229:3000',
        'http://192.168.1.230:3000',
        'http://192.168.1.231:3000',
        'http://192.168.1.232:3000',
        'http://192.168.1.233:3000',
        'http://192.168.1.234:3000',
        'http://192.168.1.235:3000',
        'http://192.168.1.236:3000',
        'http://192.168.1.237:3000',
        'http://192.168.1.238:3000',
        'http://192.168.1.239:3000',
        'http://192.168.1.240:3000',
        'http://192.168.1.241:3000',
        'http://192.168.1.242:3000',
        'http://192.168.1.243:3000',
        'http://192.168.1.244:3000',
        'http://192.168.1.245:3000',
        'http://192.168.1.246:3000',
        'http://192.168.1.247:3000',
        'http://192.168.1.248:3000',
        'http://192.168.1.249:3000',
        'http://192.168.1.250:3000',
        'http://192.168.1.251:3000',
        'http://192.168.1.252:3000',
        'http://192.168.1.253:3000',
        'http://192.168.1.254:3000',
        'http://192.168.1.255:3000'
      ],
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

    console.log(`用户连接: socketId=${socket.id}, userId=${userId}, username=${username}, isGuest=${isGuest}, room=${roomName}`);

    if (!roomToUsers.has(roomName)) roomToUsers.set(roomName, new Map());
    const usersMap = roomToUsers.get(roomName)!;

    if (userId && username) {
      usersMap.set(socket.id, { userId, username });
    } else {
      usersMap.set(socket.id, { userId: 'guest', username: '访客' });
    }

    const authedCount = Array.from(usersMap.values()).filter(u => u.userId && u.userId !== 'guest').length;
    console.log(`房间 ${roomName} 在线人数: ${authedCount}, 总连接数: ${usersMap.size}`);
    io.to(roomName).emit('chat:presence', { onlineCount: authedCount });

    socket.on('chat:message', async (payload: { text: string }) => {
      if (isGuest || !userId) {
        socket.emit('chat:error', { error: '未登录用户不可发言' });
        return;
      }
      
      const text = (payload?.text || '').toString().trim().slice(0, 2000);
      if (!text) {
        socket.emit('chat:error', { error: '消息内容不能为空' });
        return;
      }
      
      const timestamp = Date.now();

      // 持久化到数据库
      try {
        // 将字符串userId转换为ObjectId
        const mongoose = await import('mongoose');
        const userIdObj = userId ? new mongoose.Types.ObjectId(userId) : null;
        
        await ChatMessage.create({
          room: roomName,
          userId: userIdObj,
          username: username || '用户',
          text,
          createdAt: new Date(timestamp),
        });
        console.log(`消息已保存到数据库: room=${roomName}, userId=${userId}, username=${username}`);
      } catch (e) {
        // 持久化失败不阻塞广播，但记录错误
        console.error('保存聊天消息失败:', e);
      }

      // 广播给房间内除发送者外的所有用户
      socket.to(roomName).emit('chat:message', {
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
