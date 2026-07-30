import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import axios from 'axios';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SocketContext } from '../contexts/SocketContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import ServiceNode from '../components/ServiceNode.jsx';
import { 
  ArrowLeft, Users, Download, Eye, Edit3, Save, Sparkles, 
  RotateCcw, History, Plus, X, UserPlus, Clipboard, Check,
  BookOpen, Loader2, MessageSquare
} from 'lucide-react';

const nodeTypes = {
  serviceNode: ServiceNode
};

export default function Workspace({ setPage, projectId }) {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Documents & Editor
  const [documents, setDocuments] = useState([]);

  // Collaboration comments state
  const [comments, setComments] = useState([]);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [showNewCommentModal, setShowNewCommentModal] = useState(false);
  const [newCommentCoords, setNewCommentCoords] = useState(null);
  const [commentText, setCommentText] = useState('');

  // AI Modifier state
  const [isAIModifierOpen, setIsAIModifierOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModifying, setAiModifying] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('prd');
  const [editorContent, setEditorContent] = useState('');
  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);

  // Collaboration state
  const [collaborators, setCollaborators] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Versioning state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionsList, setVersionsList] = useState([]);
  const [changelog, setChangelog] = useState('');

  // Floating AI rewrite popup
  const [selectedText, setSelectedText] = useState('');
  const [textSelectionCoords, setTextSelectionCoords] = useState({ x: 0, y: 0 });
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [aiRewriting, setAiRewriting] = useState(false);

  const canvasContainerRef = useRef(null);

  // Fetch project details on mount
  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchVersions();
      fetchComments();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${projectId}`);
      if (res.data.success) {
        setProject(res.data.project);
        setDocuments(res.data.documents);
        
        // Map stored nodes to React Flow format
        const formattedNodes = (res.data.nodes || []).map(n => ({
          id: n.nodeId,
          type: 'serviceNode',
          position: n.position,
          data: n.data
        }));
        
        const formattedEdges = (res.data.edges || []).map(e => ({
          id: e.edgeId,
          source: e.source,
          target: e.target,
          type: e.type || 'smoothstep',
          label: e.label || '',
          animated: e.animated || false
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);

        // Preload active doc content
        const activeDoc = res.data.documents.find(d => d.type === selectedDocType);
        if (activeDoc) setEditorContent(activeDoc.content);
      }
    } catch (error) {
      console.error("Workspace loading failed:", error);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await axios.get(`/api/version/list/${projectId}`);
      if (res.data.success) setVersionsList(res.data.versions);
    } catch (error) {
      console.error("Failed to load versions list", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/collaboration/comments/${projectId}`);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText || !newCommentCoords) return;

    try {
      const res = await axios.post('/api/collaboration/comment', {
        projectId,
        text: commentText,
        position: newCommentCoords
      });

      if (res.data.success) {
        const addedComment = res.data.comment;
        setComments(prev => [...prev, addedComment]);
        
        if (socket) {
          socket.emit('new-comment', addedComment);
        }

        setCommentText('');
        setShowNewCommentModal(false);
      }
    } catch (error) {
      alert("Failed to post comment");
    }
  };

  const handlePaneClick = (e) => {
    if (!isCommentMode || !canvasContainerRef.current) return;
    
    // Check if clicked element is part of overlay UI to prevent false comment pin placement
    if (e.target.closest('.react-flow__node') || e.target.closest('.comment-popover') || e.target.closest('.comment-marker') || e.target.closest('.glass') || e.target.closest('.react-flow__controls')) {
      return;
    }

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNewCommentCoords({ x, y });
    setShowNewCommentModal(true);
  };

  const handleAIModifyCanvas = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setAiModifying(true);
    try {
      const res = await axios.post('/api/ai/modify-design', {
        projectId,
        nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, type: e.type, label: e.label, animated: e.animated })),
        prompt: aiPrompt
      });

      if (res.data.success) {
        const updatedNodes = res.data.nodes.map(n => ({
          id: n.id,
          type: 'serviceNode',
          position: n.position,
          data: n.data
        }));
        const updatedEdges = res.data.edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || 'smoothstep',
          label: e.label || '',
          animated: e.animated || false
        }));

        setNodes(updatedNodes);
        setEdges(updatedEdges);

        if (socket) {
          socket.emit('node-change', { nodes: updatedNodes, edges: updatedEdges });
        }

        setAiPrompt('');
        setIsAIModifierOpen(false);
        alert("System design modified successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "AI design modification failed");
    } finally {
      setAiModifying(false);
    }
  };

  // Sync document content with doc type selection
  useEffect(() => {
    if (documents.length > 0) {
      const activeDoc = documents.find(d => d.type === selectedDocType);
      if (activeDoc) setEditorContent(activeDoc.content);
    }
  }, [selectedDocType, documents]);

  // Setup sockets
  useEffect(() => {
    if (!socket || !project || !user) return;

    // Join project channel
    socket.emit('join-project', {
      projectId,
      user: { id: user.id, name: user.name }
    });

    // Handle updates from peers
    socket.on('presence-update', (users) => {
      setCollaborators(users);
    });

    socket.on('cursor-update', ({ userId, name, color, x, y }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [userId]: { name, color, x, y, timestamp: Date.now() }
      }));
    });

    socket.on('node-update', ({ nodes: updatedNodes, edges: updatedEdges }) => {
      if (updatedNodes) setNodes(updatedNodes);
      if (updatedEdges) setEdges(updatedEdges);
    });

    socket.on('doc-update', ({ docId, content }) => {
      setDocuments(prev => prev.map(d => d._id === docId ? { ...d, content } : d));
      const activeDoc = documents.find(d => d.type === selectedDocType);
      if (activeDoc && activeDoc._id === docId) {
        setEditorContent(content);
      }
    });

    socket.on('comment-received', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    // Clear stale cursors periodically
    const interval = setInterval(() => {
      setRemoteCursors(prev => {
        const cleaned = {};
        const now = Date.now();
        Object.keys(prev).forEach(key => {
          if (now - prev[key].timestamp < 4000) {
            cleaned[key] = prev[key];
          }
        });
        return cleaned;
      });
    }, 2000);

    return () => {
      socket.off('presence-update');
      socket.off('cursor-update');
      socket.off('node-update');
      socket.off('doc-update');
      socket.off('comment-received');
      clearInterval(interval);
    };
  }, [socket, project, user, selectedDocType, documents]);

  // Broadcast node changes
  const onCanvasChange = () => {
    if (socket) {
      socket.emit('node-change', { nodes, edges });
    }
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds));
    setTimeout(onCanvasChange, 100);
  }, [setEdges, socket, nodes, edges]);

  // Mouse move: emit cursor offset
  const handleMouseMove = (e) => {
    if (!socket || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit('cursor-move', { x, y });
  };  // AI Modifier state


  // Custom Node Injector state
  const [customNodeName, setCustomNodeName] = useState('');
  const [customNodeTech, setCustomNodeTech] = useState('');
  const [customNodeDesc, setCustomNodeDesc] = useState('');

  // Drag and drop node creation
  const handleAddNode = (techName) => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      type: 'serviceNode',
      position: { x: 300 + Math.random() * 50, y: 150 + Math.random() * 50 },
      data: {
        label: techName || 'New Service',
        tech: techName ? `${techName} Module` : 'Node.js',
        description: 'Autogenerated microservice client node.'
      }
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    if (socket) socket.emit('node-change', { nodes: nextNodes, edges });
  };

  const handleAddCustomNode = (name, tech, desc) => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      type: 'serviceNode',
      position: { x: 300 + Math.random() * 50, y: 150 + Math.random() * 50 },
      data: {
        label: name || 'Custom Component',
        tech: tech || 'Custom Tech',
        description: desc || 'User-defined custom architecture service component.'
      }
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    if (socket) socket.emit('node-change', { nodes: nextNodes, edges });
    setTimeout(handleSaveCanvasLayout, 200);
  };

  // Document management
  const handleSaveDocument = async () => {
    const activeDoc = documents.find(d => d.type === selectedDocType);
    if (!activeDoc) return;

    setSavingDoc(true);
    try {
      const res = await axios.put(`/api/ai/document/${activeDoc._id}`, { content: editorContent });
      if (res.data.success) {
        setDocuments(prev => prev.map(d => d._id === activeDoc._id ? { ...d, content: editorContent } : d));
        setIsEditingDocs(false);

        // Broadcast to other collaborators
        if (socket) {
          socket.emit('doc-change', { docId: activeDoc._id, content: editorContent });
        }
      }
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setSavingDoc(false);
    }
  };

  // Drag-and-save manual canvas backup
  const handleSaveCanvasLayout = async () => {
    try {
      await axios.put(`/api/projects/${projectId}/canvas`, { nodes, edges });
    } catch (error) {
      console.error("Autosave layout failed", error);
    }
  };

  // Text selection handler for AI Rewrite
  const handleTextSelection = (e) => {
    const text = window.getSelection().toString().trim();
    if (text.length > 5) {
      setSelectedText(text);
      setTextSelectionCoords({ x: e.clientX, y: e.clientY - 45 });
      setShowAIPopup(true);
    } else {
      setShowAIPopup(false);
    }
  };

  const handleAIRewrite = async (action) => {
    if (!selectedText) return;
    setAiRewriting(true);
    try {
      const res = await axios.post('/api/ai/rewrite', { content: selectedText, action });
      if (res.data.success) {
        const newContent = editorContent.replace(selectedText, res.data.rewritten);
        setEditorContent(newContent);
        setShowAIPopup(false);
      }
    } catch (error) {
      alert("AI rewrite failed");
    } finally {
      setAiRewriting(false);
    }
  };

  // Invite user workflow
  const handleInviteCollaborator = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const res = await axios.post('/api/collaboration/invite', { projectId, email: inviteEmail });
      if (res.data.success) {
        alert("Collaborator added successfully!");
        setInviteEmail('');
        setShowInviteModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "User not found or invite failed");
    }
  };

  // Version Control snapshots
  const handleCreateVersion = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/version/create', { projectId, changelog });
      if (res.data.success) {
        alert("Version snapshot checkpoint saved!");
        setChangelog('');
        fetchVersions();
      }
    } catch (error) {
      alert("Snapshot generation failed");
    }
  };

  const handleRestoreVersion = async (vNum) => {
    if (!confirm(`Are you sure you want to rollback to v${vNum}? Current active nodes and document changes will be replaced.`)) return;

    try {
      const res = await axios.post('/api/version/restore', { projectId, versionNumber: vNum });
      if (res.data.success) {
        alert("Workspace rolled back successfully!");
        fetchProject();
        setShowVersionModal(false);
      }
    } catch (error) {
      alert("Rollback failed");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
        <span className="text-slate-400 text-xs mt-3">Spinning up workspace canvas...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-slate-200 overflow-hidden relative">
      {/* Workspace Header */}
      <header className="glass border-b border-white/5 h-16 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              handleSaveCanvasLayout();
              setPage('dashboard');
            }} 
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
              {project.name}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-mono">v{project.currentVersion}</span>
            </h1>
            <p className="text-[10px] text-slate-500 truncate max-w-sm">{project.description}</p>
          </div>
        </div>

        {/* Presence and Tools */}
        <div className="flex items-center gap-4">
          {/* Active Collaborators */}
          <div className="flex items-center -space-x-2 mr-2">
            {collaborators.map((c) => (
              <div 
                key={c.id} 
                className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm"
                style={{ backgroundColor: c.color }}
                title={`${c.name} (${c.id === user.id ? 'You' : 'Collaborating'})`}
              >
                {c.name.charAt(0)}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsCommentMode(!isCommentMode)} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCommentMode ? 'bg-accent-pink text-white shadow-glow-pink border border-accent-pink' : 'bg-accent-pink/15 border border-accent-pink/35 text-accent-pink hover:bg-accent-pink/25'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {isCommentMode ? 'Comment Mode Active' : 'Comment Mode'}
          </button>

          <button 
            onClick={() => setIsAIModifierOpen(!isAIModifierOpen)} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAIModifierOpen ? 'bg-accent-cyan text-black shadow-glow-cyan border border-accent-cyan' : 'bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan hover:bg-accent-cyan/25'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Modifier
          </button>

          <button 
            onClick={() => setShowInviteModal(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-purple/15 border border-accent-purple/35 text-xs text-accent-purple font-bold hover:bg-accent-purple/25 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </button>

          <button 
            onClick={() => setShowVersionModal(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-all"
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-all">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl glass border border-white/10 shadow-lg hidden group-hover:block z-50 text-left overflow-hidden">
              <a href={`/api/export/json/${projectId}`} className="block px-4 py-2.5 text-xs hover:bg-white/5 transition-colors">JSON State</a>
              <a href={`/api/export/markdown/${projectId}`} className="block px-4 py-2.5 text-xs hover:bg-white/5 transition-colors">Markdown Bundle</a>
              <a href={`/api/export/pdf/${projectId}`} className="block px-4 py-2.5 text-xs hover:bg-white/5 transition-colors">Styled PDF Document</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: React Flow Canvas */}
        <div 
          ref={canvasContainerRef}
          onMouseMove={handleMouseMove}
          onClick={handlePaneClick}
          className={`flex-1 relative h-full bg-[#030014] select-none ${isCommentMode ? 'cursor-cell' : ''}`}
        >
          {/* Overlay cursors */}
          {Object.keys(remoteCursors).map((id) => {
            const cursor = remoteCursors[id];
            if (id === user.id) return null;
            return (
              <div 
                key={id}
                className="absolute pointer-events-none z-50 transition-all duration-200"
                style={{ left: cursor.x, top: cursor.y }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5.65376 12.3963L16.2798 17.7093C17.1585 18.1487 18.1487 17.1585 17.7093 16.2798L12.3963 5.65376C11.9568 4.77484 10.7107 4.77484 10.2713 5.65376L8.13626 9.92376L3.86626 12.0588C2.98734 12.4983 2.98734 13.7444 3.86626 14.1838L5.65376 12.3963Z" fill={cursor.color} />
                </svg>
                <div 
                  className="px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase whitespace-nowrap shadow ml-4 mt-2"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.name}
                </div>
              </div>
            );
          })}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeDragStop={handleSaveCanvasLayout}
            fitView
          >
            <Controls />
            <MiniMap 
              nodeColor={() => 'rgba(139, 92, 246, 0.2)'} 
              maskColor="rgba(3, 0, 20, 0.7)"
              style={{ background: 'rgba(10, 5, 36, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
            />
            <Background color="rgba(255, 255, 255, 0.03)" gap={16} />
          </ReactFlow>

          {/* Spatial Comments Pins */}
          {comments.map((c) => (
            <div
              key={c._id}
              className="absolute z-30 comment-marker group cursor-pointer"
              style={{ left: c.position?.x, top: c.position?.y }}
            >
              <div className="w-6 h-6 rounded-full bg-accent-pink flex items-center justify-center border-2 border-white shadow-glow-pink text-white text-[9px] font-bold">
                💬
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 hidden group-hover:block glass p-2.5 rounded-xl border border-accent-pink/35 shadow-lg z-50 text-left pointer-events-none">
                <span className="block text-[10px] font-bold text-accent-pink uppercase">{c.author?.name || 'Teammate'}</span>
                <p className="text-[10px] text-slate-200 mt-0.5 leading-relaxed">{c.text}</p>
                <span className="block text-[8px] text-slate-500 mt-1">{new Date(c.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}

          {/* AI Canvas Modifier Panel */}
          {isAIModifierOpen && (
            <div className="absolute left-6 top-32 glass p-6 rounded-2xl border border-accent-cyan/30 shadow-glow-cyan z-20 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Architecture Modifier</span>
                </div>
                <button onClick={() => setIsAIModifierOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Describe the changes you want to make to the visual system design. The AI will add/remove nodes and connections.
              </p>
              
              <form onSubmit={handleAIModifyCanvas} className="flex flex-col gap-3">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan text-xs resize-none"
                  placeholder="e.g. Add a Redis cache service and connect it to the Gateway and Database"
                />
                <button
                  type="submit"
                  disabled={aiModifying}
                  className="w-full py-2 rounded-xl bg-accent-cyan text-black text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  {aiModifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Modifying Layout...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Modify Architecture
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Spatial Comment Popover for adding a comment */}
          {showNewCommentModal && newCommentCoords && (
            <div 
              className="absolute z-40 comment-popover glass p-4 rounded-xl border border-accent-pink/30 shadow-glow-pink w-64 text-left animate-in fade-in zoom-in-95 duration-150"
              style={{ left: newCommentCoords.x, top: newCommentCoords.y }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-accent-pink uppercase tracking-wider">Place Spatial Comment</span>
                <button onClick={() => setShowNewCommentModal(false)} className="text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                <input
                  type="text"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-pink text-xs"
                  placeholder="Write a comment..."
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-accent-pink text-white text-xs font-bold hover:opacity-95 transition-all shadow-glow-pink"
                >
                  Pin Comment
                </button>
              </form>
            </div>
          )}

          {/* Quick draggable components selector overlay */}
          <div className="absolute left-6 top-6 glass p-4 rounded-2xl border border-white/10 flex flex-col gap-2.5 z-20 w-44">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Inject Nodes</span>
            <button onClick={() => handleAddNode('API Gateway')} className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-left transition-all">
              <span className="w-2 h-2 rounded-full bg-accent-purple"></span>
              Gateway
            </button>
            <button onClick={() => handleAddNode('Microservice')} className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-left transition-all">
              <span className="w-2 h-2 rounded-full bg-accent-cyan"></span>
              API Service
            </button>
            <button onClick={() => handleAddNode('PostgreSQL')} className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-left transition-all">
              <span className="w-2 h-2 rounded-full bg-accent-pink"></span>
              Relational DB
            </button>
          </div>
        </div>

        {/* Right Side: Split Screen Document Editor */}
        <div className="w-[450px] md:w-[500px] border-l border-white/5 flex flex-col bg-[#05021a] shrink-0 h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-accent-purple" />
              <h3 className="text-sm font-bold text-white">System Documentation</h3>
            </div>
            
            <button
              onClick={() => {
                if (isEditingDocs) {
                  handleSaveDocument();
                } else {
                  setIsEditingDocs(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-accent-cyan text-xs font-semibold transition-all"
            >
              {isEditingDocs ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {savingDoc ? 'Saving...' : 'Save Draft'}
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Markdown
                </>
              )}
            </button>
          </div>

          {/* Doc Type tabs selector */}
          <div className="flex border-b border-white/5 px-2 py-1 bg-black/10 overflow-x-auto gap-1">
            {['prd', 'schema', 'api_design', 'roadmap', 'tech_docs'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  if (isEditingDocs && !confirm("Discard unsaved changes?")) return;
                  setSelectedDocType(type);
                  setIsEditingDocs(false);
                }}
                className={`px-3 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${selectedDocType === type ? 'bg-accent-purple/20 text-accent-purple' : 'text-slate-400 hover:text-white'}`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Editor/Viewer Pane */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            {isEditingDocs ? (
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                onMouseUp={handleTextSelection}
                className="w-full h-full bg-transparent text-slate-300 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                placeholder="Write system documentation in markdown..."
              />
            ) : (
              <div 
                className="prose prose-invert prose-xs text-slate-300 text-xs leading-relaxed max-w-none whitespace-pre-wrap font-sans"
              >
                {editorContent}
              </div>
            )}

            {/* Float AI rewrite popup overlay */}
            {showAIPopup && isEditingDocs && (
              <div 
                className="fixed glass border border-accent-purple/30 p-2 rounded-xl flex gap-1 z-[100] shadow-glow-purple"
                style={{ left: textSelectionCoords.x, top: textSelectionCoords.y }}
              >
                <button 
                  onClick={() => handleAIRewrite('longer')}
                  disabled={aiRewriting}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[9px] font-semibold text-white transition-all"
                >
                  <Sparkles className="w-3 h-3 text-accent-purple animate-pulse" />
                  {aiRewriting ? 'Expanding...' : 'Expand'}
                </button>
                <button 
                  onClick={() => handleAIRewrite('shorter')}
                  disabled={aiRewriting}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[9px] font-semibold text-white transition-all"
                >
                  Shorten
                </button>
                <button 
                  onClick={() => handleAIRewrite('formal')}
                  disabled={aiRewriting}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[9px] font-semibold text-white transition-all"
                >
                  Formal
                </button>
                <button 
                  onClick={() => setShowAIPopup(false)}
                  className="p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-6 relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleInviteCollaborator} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Add Teammate Workspace Access</h3>
                <p className="text-slate-400 text-xs">Enter their account registration email address to grant write permissions.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Collaborator Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple text-xs"
                  placeholder="teammate@company.com"
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-accent-purple text-white text-xs font-bold hover:opacity-90 transition-all shadow-glow-purple">
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History & Snapshots Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg glass rounded-2xl border border-white/10 p-6 relative flex flex-col max-h-[80vh]">
            <button onClick={() => setShowVersionModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">Version Snapshot Control</h3>
              <p className="text-slate-400 text-xs">Track change checkpoints, inspect commit hashes, or rollback coordinates.</p>
            </div>

            {/* Create Snapshot form */}
            <form onSubmit={handleCreateVersion} className="flex gap-2.5 mb-6 border-b border-white/5 pb-6">
              <input
                type="text"
                required
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple text-xs"
                placeholder="Commit snapshot description... (e.g. Added user auth model)"
              />
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-accent-purple text-white text-xs font-bold hover:opacity-90 transition-all shadow-glow-purple flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Snapshot
              </button>
            </form>

            {/* Version List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {versionsList.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No snapshots saved yet.</p>
              ) : (
                versionsList.map((ver) => (
                  <div key={ver._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-cyan/15 border border-accent-cyan/25 text-accent-cyan font-bold">v{ver.versionNumber}</span>
                      <span className="text-xs text-slate-200 ml-3">{ver.changelog}</span>
                      <span className="block text-[10px] text-slate-500 mt-1">Saved by: {ver.createdBy?.name || 'Teammate'} • {new Date(ver.createdAt).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => handleRestoreVersion(ver.versionNumber)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[10px] font-bold hover:bg-accent-purple/20 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
