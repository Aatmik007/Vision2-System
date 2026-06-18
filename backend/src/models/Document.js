import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['prd', 'tech_docs', 'api_design', 'schema', 'roadmap'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);
