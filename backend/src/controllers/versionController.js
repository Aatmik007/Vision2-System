import { Version } from '../models/Version.js';
import { Project } from '../models/Project.js';
import { Document } from '../models/Document.js';
import { NodeModel } from '../models/Node.js';
import { EdgeModel } from '../models/Edge.js';

export const createVersion = async (req, res) => {
  try {
    const { projectId, changelog } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Fetch active resources to back up
    const activeNodes = await NodeModel.find({ projectId });
    const activeEdges = await EdgeModel.find({ projectId });
    const activeDocs = await Document.find({ projectId });

    const newVersionNumber = project.currentVersion + 1;

    const snapshot = {
      nodes: activeNodes,
      edges: activeEdges,
      documents: activeDocs.map(d => ({
        type: d.type,
        title: d.title,
        content: d.content
      }))
    };

    const version = await Version.create({
      projectId,
      versionNumber: newVersionNumber,
      snapshot,
      createdBy: userId,
      changelog: changelog || `Snapshot v${newVersionNumber}`
    });

    project.currentVersion = newVersionNumber;
    await project.save();

    return res.status(201).json({ success: true, version });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create version snapshot', error: error.message });
  }
};

export const restoreVersion = async (req, res) => {
  try {
    const { projectId, versionNumber } = req.body;

    const version = await Version.findOne({ projectId, versionNumber });
    if (!version) return res.status(404).json({ success: false, message: 'Version snapshot not found' });

    // Clear active layout and docs
    await NodeModel.deleteMany({ projectId });
    await EdgeModel.deleteMany({ projectId });
    await Document.deleteMany({ projectId });

    // Restore nodes
    const nodesToRestore = version.snapshot.nodes.map(n => ({
      projectId,
      nodeId: n.nodeId || n.id,
      type: n.type,
      position: n.position,
      data: n.data
    }));
    if (nodesToRestore.length > 0) await NodeModel.insertMany(nodesToRestore);

    // Restore edges
    const edgesToRestore = version.snapshot.edges.map(e => ({
      projectId,
      edgeId: e.edgeId || e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      label: e.label,
      animated: e.animated
    }));
    if (edgesToRestore.length > 0) await EdgeModel.insertMany(edgesToRestore);

    // Restore documents
    const docsToRestore = version.snapshot.documents.map(d => ({
      projectId,
      type: d.type,
      title: d.title,
      content: d.content
    }));
    if (docsToRestore.length > 0) await Document.insertMany(docsToRestore);

    // Update active project metadata
    await Project.findByIdAndUpdate(projectId, { currentVersion: versionNumber });

    return res.status(200).json({ success: true, message: `Successfully restored workspace to v${versionNumber}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to restore version snapshot', error: error.message });
  }
};

export const getVersions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const versions = await Version.find({ projectId })
      .select('-snapshot') // exclude heavy snapshot payloads for lists
      .populate('createdBy', 'name')
      .sort({ versionNumber: -1 });

    return res.status(200).json({ success: true, versions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load versions list', error: error.message });
  }
};

export const compareVersions = async (req, res) => {
  try {
    const { projectId, v1, v2 } = req.query;
    if (!v1 || !v2) return res.status(400).json({ success: false, message: 'Provide v1 and v2 version numbers' });

    const version1 = await Version.findOne({ projectId, versionNumber: v1 });
    const version2 = await Version.findOne({ projectId, versionNumber: v2 });

    if (!version1 || !version2) {
      return res.status(404).json({ success: false, message: 'One or both version snapshots not found' });
    }

    return res.status(200).json({ success: true, version1, version2 });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to run comparison', error: error.message });
  }
};
