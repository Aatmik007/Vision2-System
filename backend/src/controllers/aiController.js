import { Document } from '../models/Document.js';
import { Project } from '../models/Project.js';
import { rewriteDocumentSection, generateSystemDesign, modifySystemDesign } from '../services/aiService.js';
import { NodeModel } from '../models/Node.js';
import { EdgeModel } from '../models/Edge.js';
import { Activity } from '../models/Activity.js';

export const rewriteDoc = async (req, res) => {
  try {
    const { content, action } = req.body;
    if (!content || !action) {
      return res.status(400).json({ success: false, message: 'Content and action are required' });
    }

    const rewritten = await rewriteDocumentSection(content, action);
    return res.status(200).json({ success: true, rewritten });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI rewrite failed', error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { content } = req.body;

    const doc = await Document.findByIdAndUpdate(docId, { content }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    return res.status(200).json({ success: true, doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update document', error: error.message });
  }
};

export const runFullSystemDesign = async (req, res) => {
  try {
    const { projectId, idea } = req.body;
    if (!projectId || !idea) {
      return res.status(400).json({ success: false, message: 'Project ID and idea description are required' });
    }

    const design = await generateSystemDesign(idea);
    return res.status(200).json({ success: true, design });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI Design Pipeline failed', error: error.message });
  }
};

export const runModifySystemDesign = async (req, res) => {
  try {
    const { projectId, nodes, edges, prompt } = req.body;
    if (!projectId || !nodes || !edges || !prompt) {
      return res.status(400).json({ success: false, message: 'Project ID, nodes, edges, and modification prompt are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    console.log(`Running AI modify canvas workflow for project: ${projectId}`);
    const updatedDesign = await modifySystemDesign(project.description, nodes, edges, prompt);

    // Sync nodes to DB
    if (updatedDesign.nodes && Array.isArray(updatedDesign.nodes)) {
      await NodeModel.deleteMany({ projectId });
      const nodesToInsert = updatedDesign.nodes.map(n => ({
        projectId,
        nodeId: n.id || n.nodeId,
        type: n.type || 'serviceNode',
        position: n.position,
        data: n.data
      }));
      await NodeModel.insertMany(nodesToInsert);
    }

    // Sync edges to DB
    if (updatedDesign.edges && Array.isArray(updatedDesign.edges)) {
      await EdgeModel.deleteMany({ projectId });
      const edgesToInsert = updatedDesign.edges.map(e => ({
        projectId,
        edgeId: e.id || e.edgeId,
        source: e.source,
        target: e.target,
        type: e.type || 'smoothstep',
        label: e.label || '',
        animated: e.animated || false
      }));
      await EdgeModel.insertMany(edgesToInsert);
    }

    // Log Activity
    await Activity.create({
      projectId,
      userId: req.user._id,
      action: 'canvas_ai_modify',
      description: `AI modified system architecture canvas layout based on prompt: "${prompt}"`
    });

    return res.status(200).json({
      success: true,
      nodes: updatedDesign.nodes.map(n => ({
        id: n.id || n.nodeId,
        type: 'serviceNode',
        position: n.position,
        data: n.data
      })),
      edges: updatedDesign.edges.map(e => ({
        id: e.id || e.edgeId,
        source: e.source,
        target: e.target,
        type: e.type || 'smoothstep',
        label: e.label || '',
        animated: e.animated || false
      }))
    });
  } catch (error) {
    console.error("AI design modification error:", error);
    return res.status(500).json({ success: false, message: 'AI Design Modification failed', error: error.message });
  }
};
