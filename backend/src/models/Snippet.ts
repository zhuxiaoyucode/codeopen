import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ISnippet extends Document {
  _id: string;
  content: string;
  language: string;
  expiresAt: Date | null;
  isPrivate: boolean;
  creatorId: mongoose.Types.ObjectId | null;
  title?: string;
  createdAt: Date;
  isExpired(): boolean;
}

const snippetSchema = new Schema<ISnippet>({
  _id: {
    type: String,
    default: () => nanoid(10) // 生成10位短ID
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000 // 限制代码内容长度
  },
  language: {
    type: String,
    required: true,
    default: 'plaintext'
  },
  expiresAt: {
    type: Date,
    default: null // null表示永久有效
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // null表示匿名用户创建
  },
  title: {
    type: String,
    maxlength: 100
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// 检查片段是否过期的方法
snippetSchema.methods.isExpired = function(): boolean {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// 索引优化
snippetSchema.index({ creatorId: 1, createdAt: -1 });
snippetSchema.index({ expiresAt: 1 });

export const Snippet = mongoose.model<ISnippet>('Snippet', snippetSchema);