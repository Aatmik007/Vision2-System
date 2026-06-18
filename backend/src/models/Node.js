import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  nodeId: {
    type: String,
    required: true,
  },
  type: {
    type: String, // 'serviceNode', 'dbNode', 'clientNode', etc.
    default: 'serviceNode',
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String, default: 'New Node' },
    tech: { type: String, default: '' },
    description: { type: String, default: '' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
}, { timestamps: true });

nodeSchema.index({ projectId: 1, nodeId: 1 }, { unique: true });

export const NodeModel = mongoose.model('ArchitectureNode', nodeSchema);
