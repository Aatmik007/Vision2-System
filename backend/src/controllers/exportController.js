import { Project } from '../models/Project.js';
import { Document } from '../models/Document.js';
import { NodeModel } from '../models/Node.js';
import { EdgeModel } from '../models/Edge.js';
import PDFDocument from 'pdfkit';

export const exportJSON = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const documents = await Document.find({ projectId });
    const nodes = await NodeModel.find({ projectId });
    const edges = await EdgeModel.find({ projectId });

    const exportData = {
      project,
      architecture: { nodes, edges },
      documents
    };

    res.setHeader('Content-disposition', `attachment; filename=${project.name.replace(/\s+/g, '_')}_system_design.json`);
    res.setHeader('Content-type', 'application/json');
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    return res.status(500).json({ success: false, message: 'JSON export failed', error: error.message });
  }
};

export const exportMarkdown = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const documents = await Document.find({ projectId });

    let markdown = `# ${project.name} - System Design Portfolio\n\n`;
    markdown += `> Generated on IdeaToSystem AI\n> Idea: ${project.description}\n\n---\n\n`;

    documents.forEach(doc => {
      markdown += `## ${doc.title}\n\n`;
      markdown += `${doc.content}\n\n---\n\n`;
    });

    res.setHeader('Content-disposition', `attachment; filename=${project.name.replace(/\s+/g, '_')}_design_docs.md`);
    res.setHeader('Content-type', 'text/markdown');
    return res.send(markdown);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Markdown export failed', error: error.message });
  }
};

export const exportPDF = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const documents = await Document.find({ projectId });

    const doc = new PDFDocument({ margin: 50 });
    let filename = `${project.name.replace(/\s+/g, '_')}_design.pdf`;

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Title Page
    doc.fontSize(28).fillColor('#1e1b4b').text(project.name, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(14).fillColor('#6b7280').text('System Design & Requirements Documentation', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#9ca3af').text(`Generated on IdeaToSystem AI\nOriginal Idea: ${project.description}`, { align: 'center' });
    
    doc.moveDown(3);
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);

    // Document contents
    documents.forEach(document => {
      doc.addPage();
      doc.fontSize(20).fillColor('#4f46e5').text(document.title);
      doc.moveDown(1);

      // Simple markdown cleanups for PDF printing (stripping header hashes)
      const cleanContent = document.content
        .replace(/#+\s/g, '')
        .replace(/`{3,}/g, '')
        .replace(/\*\*/g, '');

      doc.fontSize(11).fillColor('#1f2937').text(cleanContent, {
        lineGap: 4,
        align: 'left'
      });
    });

    doc.end();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'PDF export failed', error: error.message });
  }
};
