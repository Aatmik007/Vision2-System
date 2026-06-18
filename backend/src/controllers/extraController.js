import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { Activity } from '../models/Activity.js';
import { AIRequest } from '../models/AIRequest.js';

export const inviteCollaborator = async (req, res) => {
  try {
    const { projectId, email } = req.body;
    const senderId = req.user._id;

    if (!projectId || !email) {
      return res.status(400).json({ success: false, message: 'Project ID and collaborator email are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Verify ownership or membership
    if (project.owner.toString() !== senderId.toString() && !project.collaborators.includes(senderId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to invite users' });
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    if (project.owner.toString() === invitee._id.toString() || project.collaborators.includes(invitee._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    project.collaborators.push(invitee._id);
    await project.save();

    // Notify invitee
    await Notification.create({
      recipient: invitee._id,
      sender: senderId,
      type: 'invite',
      projectId,
      message: `${req.user.name} invited you to collaborate on the project "${project.name}"`
    });

    // Log activity
    await Activity.create({
      projectId,
      userId: senderId,
      action: 'collaborator_invite',
      description: `Invited ${invitee.name} (${email}) to the project`
    });

    return res.status(200).json({ success: true, message: `Successfully invited ${invitee.name}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Invite failed', error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { projectId, documentId, nodeId, text, position } = req.body;
    const authorId = req.user._id;

    if (!projectId || !text) {
      return res.status(400).json({ success: false, message: 'Project ID and comment text are required' });
    }

    const comment = await Comment.create({
      projectId,
      documentId: documentId || null,
      nodeId: nodeId || null,
      author: authorId,
      text,
      position: position || { x: 0, y: 0 }
    });

    // Notify project owner and collaborators (except author)
    const project = await Project.findById(projectId);
    const recipients = [project.owner, ...project.collaborators].filter(
      id => id.toString() !== authorId.toString()
    );

    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      sender: authorId,
      type: 'comment',
      projectId,
      message: `${req.user.name} added a comment in workspace "${project.name}"`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({
      success: true,
      comment: await Comment.findById(comment._id).populate('author', 'name email')
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to post comment', error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const comments = await Comment.find({ projectId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
  }
};

export const getUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('credits plan');
    const aiQueries = await AIRequest.countDocuments({ userId });
    
    return res.status(200).json({
      success: true,
      usage: {
        credits: user.credits,
        plan: user.plan,
        queriesCount: aiQueries
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find projects the user is involved in
    const projects = await Project.find({
      $or: [{ owner: userId }, { collaborators: userId }]
    }).select('_id');
    const projectIds = projects.map(p => p._id);

    const activities = await Activity.find({ projectId: { $in: projectIds } })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ success: true, activities });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ recipient: userId, read: false })
      .populate('sender', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
