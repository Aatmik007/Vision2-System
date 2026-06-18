import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  snapshot: {
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    documents: [{
      type: { type: String },
      title: { type: String },
      content: { type: String }
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changelog: {
    type: String,
    default: 'Automatic Snapshot',
  }
}, { timestamps: true });

// Compound index to ensure version uniqueness within a project
versionSchema.index({ projectId: 1, versionNumber: 1 }, { unique: true });

export const Version = mongoose.model('Version', versionSchema);
