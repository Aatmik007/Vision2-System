import mongoose from 'mongoose';

const edgeSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  edgeId: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'smoothstep',
  },
  label: {
    type: String,
    default: '',
  },
  animated: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

edgeSchema.index({ projectId: 1, edgeId: 1 }, { unique: true });

export const EdgeModel = mongoose.model('ArchitectureEdge', edgeSchema);
