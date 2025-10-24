import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  room: string; // e.g. 'global' or 'snippet:<id>'
  userId?: mongoose.Types.ObjectId | null;
  username: string;
  text: string;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  room: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date(), index: true },
});

chatMessageSchema.index({ room: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
