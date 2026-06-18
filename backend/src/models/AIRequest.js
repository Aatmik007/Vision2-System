import mongoose from 'mongoose';

const aiRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  apiType: {
    type: String,
    enum: ['gemini', 'openai', 'gemini (mock)'],
    default: 'gemini',
  },
  creditsSpent: {
    type: Number,
    default: 1,
  },
  success: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export const AIRequest = mongoose.model('AIRequest', aiRequestSchema);
