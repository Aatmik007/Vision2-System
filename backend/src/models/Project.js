import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  currentVersion: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
