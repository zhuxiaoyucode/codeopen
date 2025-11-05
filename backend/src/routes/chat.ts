import express from 'express';
import { ChatMessage } from '../models/ChatMessage';

const router = express.Router();

// 获取聊天历史
// GET /api/chat/history?room=global&limit=100
router.get('/history', async (req, res) => {
  try {
    const room = (req.query.room as string) || '';
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10) || 100, 500);

    if (!room || !(room === 'global' || room.startsWith('snippet:'))) {
      return res.status(400).json({ error: '非法房间参数' });
    }

    const messages = await ChatMessage.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .then(msgs => msgs.reverse().map(msg => ({
        ...msg,
        userId: msg.userId ? msg.userId.toString() : null,
        _id: msg._id.toString(),
        createdAt: msg.createdAt.toISOString()
      }))); // 反转顺序，让最新的消息在最后

    return res.json({ messages });
  } catch (error: any) {
    console.error('获取聊天历史失败:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
