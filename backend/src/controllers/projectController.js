import { Project } from '../models/Project.js';
import { Document } from '../models/Document.js';
import { NodeModel } from '../models/Node.js';
import { EdgeModel } from '../models/Edge.js';
import { Activity } from '../models/Activity.js';
import { AIRequest } from '../models/AIRequest.js';
import { User } from '../models/User.js';
import { generateSystemDesign } from '../services/aiService.js';

export const createProject = async (req, res) => {
  try {
    const { name, idea } = req.body;
    const userId = req.user._id;

    if (!name || !idea) {
      return res.status(400).json({ success: false, message: 'Please provide project name and startup idea' });
    }

    // Check credits
    const user = await User.findById(userId);
    if (user.credits < 5) {
      return res.status(400).json({ success: false, message: 'Insufficient AI credits. Please upgrade your plan.' });
    }

    // Deduct credits
    user.credits -= 5;
    await user.save();

    // Create project skeleton
    const project = await Project.create({
      name,
      description: idea,
      owner: userId
    });

    // Invoke AI system designer pipeline
    console.log(`Running AI workflow for project: ${project._id}`);
    const aiDesign = await generateSystemDesign(idea);

    // Create documents in DB
    const docs = [
      { type: 'prd', title: 'Product Requirements Document (PRD)', content: aiDesign.prd },
      { type: 'schema', title: 'Database & Schema Architecture', content: aiDesign.database },
      { type: 'api_design', title: 'REST API Documentation', content: aiDesign.apiDesign },
      { type: 'roadmap', title: 'Development Roadmap', content: aiDesign.roadmap },
      { type: 'tech_docs', title: 'Technical Documentation', content: aiDesign.technicalDocs }
    ];

    const savedDocs = await Document.insertMany(
      docs.map(doc => ({ ...doc, projectId: project._id }))
    );

    // Save nodes and edges
    const nodes = (aiDesign.architecture.nodes || []).map(node => ({
      projectId: project._id,
      nodeId: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }));

    const edges = (aiDesign.architecture.edges || []).map(edge => ({
      projectId: project._id,
      edgeId: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      label: edge.label || '',
      animated: edge.animated || false
    }));

    if (nodes.length > 0) await NodeModel.insertMany(nodes);
    if (edges.length > 0) await EdgeModel.insertMany(edges);

    // Log Activity
    await Activity.create({
      projectId: project._id,
      userId,
      action: 'project_creation',
      description: `Created project and generated system architecture for idea: "${idea}"`
    });

    // Log AI Request
    await AIRequest.create({
      userId,
      prompt: idea,
      apiType: process.env.GEMINI_API_KEY ? 'gemini' : 'gemini (mock)',
      creditsSpent: 5
    });

    return res.status(201).json({
      success: true,
      message: 'System architecture generated successfully',
      project,
      documents: savedDocs,
      nodes,
      edges
    });
  } catch (error) {
    console.error("Project generation failure:", error);
    return res.status(500).json({ success: false, message: 'Project creation and AI workflow failed', error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { collaborators: userId }
      ]
    }).populate('owner', 'name email');

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve projects', error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id).populate('owner', 'name email').populate('collaborators', 'name email');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify membership
    if (project.owner._id.toString() !== userId.toString() && !project.collaborators.some(c => c._id.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    const documents = await Document.find({ projectId: id });
    const nodes = await NodeModel.find({ projectId: id });
    const edges = await EdgeModel.find({ projectId: id });

    return res.status(200).json({
      success: true,
      project,
      documents,
      nodes,
      edges
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve project workspace', error: error.message });
  }
};

export const updateProjectCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    const { nodes, edges } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Sync nodes
    if (nodes && Array.isArray(nodes)) {
      await NodeModel.deleteMany({ projectId: id });
      const nodesToInsert = nodes.map(n => ({
        projectId: id,
        nodeId: n.id || n.nodeId,
        type: n.type,
        position: n.position,
        data: n.data
      }));
      await NodeModel.insertMany(nodesToInsert);
    }

    // Sync edges
    if (edges && Array.isArray(edges)) {
      await EdgeModel.deleteMany({ projectId: id });
      const edgesToInsert = edges.map(e => ({
        projectId: id,
        edgeId: e.id || e.edgeId,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label || '',
        animated: e.animated || false
      }));
      await EdgeModel.insertMany(edgesToInsert);
    }

    await Activity.create({
      projectId: id,
      userId,
      action: 'canvas_update',
      description: 'Updated architecture canvas nodes layout'
    });

    return res.status(200).json({ success: true, message: 'Canvas saved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save canvas state', error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owners can delete projects' });
    }

    await Project.findByIdAndDelete(id);
    await Document.deleteMany({ projectId: id });
    await NodeModel.deleteMany({ projectId: id });
    await EdgeModel.deleteMany({ projectId: id });

    return res.status(200).json({ success: true, message: 'Project and resources deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Deletion failed', error: error.message });
  }
};
