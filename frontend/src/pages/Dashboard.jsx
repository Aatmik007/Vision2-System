import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { 
  Layers, Plus, LogOut, Cpu, Compass, BookOpen, Clock, 
  Trash2, ChevronRight, Zap, Loader2, Sparkles, User, UserPlus
} from 'lucide-react';

export default function Dashboard({ setPage, setSelectedProjectId }) {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [usage, setUsage] = useState({ credits: 50, plan: 'free', queriesCount: 0 });
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Wizard state
  const [projectName, setProjectName] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const generationSteps = [
    "Analyzing Business Model & Entities...",
    "Drafting Product Requirements Document (PRD)...",
    "Synthesizing Canvas Architecture Layout...",
    "Compiling Database Schema & Mongoose Definitions...",
    "Defining Swagger REST API Endpoints...",
    "Creating Development Roadmap Phases...",
    "Wrapping snapshot documents into Workspace..."
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const projRes = await axios.get('/api/projects');
      if (projRes.data.success) setProjects(projRes.data.projects);

      const extraRes = await axios.get('/api/collaboration/activity');
      if (extraRes.data.success) setActivities(extraRes.data.activities);

      const usageRes = await axios.get('/api/collaboration/usage');
      if (usageRes.data.success) setUsage(usageRes.data.usage);
    } catch (error) {
      console.error("Dashboard initialization failed:", error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName || !projectIdea) return;

    setLoading(true);
    setStepIndex(0);

    // Animate loading steps sequentially
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < generationSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    try {
      const res = await axios.post('/api/projects', {
        name: projectName,
        idea: projectIdea
      });

      clearInterval(interval);

      if (res.data.success) {
        setSelectedProjectId(res.data.project._id);
        setPage('workspace');
      }
    } catch (err) {
      clearInterval(interval);
      alert(err.response?.data?.message || "Generation failed. Check API configuration.");
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await axios.delete(`/api/projects/${id}`);
      if (res.data.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
      }
    } catch (error) {
      alert("Only owner can delete project");
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200">
      {/* Top Header */}
      <header className="glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">IdeaToSystem AI</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-xs text-accent-purple">
            <Zap className="w-3.5 h-3.5 fill-accent-purple" />
            <span className="font-semibold">{usage.credits} Credits Left</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-300">{user?.name}</span>
          </div>

          <button onClick={logout} className="text-slate-400 hover:text-white transition-colors" title="Log Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Stats Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Account Analytics</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Active Plan</span>
                <span className="text-sm font-bold text-accent-cyan uppercase">{usage.plan} Plan</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">AI Invocations</span>
                <span className="text-sm font-bold text-white">{usage.queriesCount} total request cycles</span>
              </div>
              <div className="pt-2">
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-bold hover:opacity-95 shadow-glow-purple">
                  Refill Credits
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Recent Collaboration Activity</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No recent activity.</p>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="flex gap-3 text-xs leading-relaxed border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300">{act.userId?.name || 'Teammate'}</span>{' '}
                      <span className="text-slate-400">{act.description}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Projects Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Draggable System Designs</h2>
              <p className="text-slate-400 text-sm mt-1">Access your generated architecture flow sheets and PRD documents.</p>
            </div>
            <button 
              onClick={() => setShowWizard(true)} 
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-all shadow-glow-purple"
            >
              <Plus className="w-4 h-4" />
              New System
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="glass p-12 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
              <Compass className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-6">Create a new system design. Simply write a sentence about your startup idea.</p>
              <button 
                onClick={() => setShowWizard(true)}
                className="px-5 py-3 rounded-xl bg-accent-purple text-white font-semibold text-sm hover:opacity-90 shadow-glow-purple"
              >
                Create First System Design
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div 
                  key={project._id}
                  onClick={() => {
                    setSelectedProjectId(project._id);
                    setPage('workspace');
                  }}
                  className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between cursor-pointer hover:border-accent-purple/40 hover:shadow-glow-purple transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-accent-cyan/15 text-accent-cyan font-medium border border-accent-cyan/25">
                        v{project.currentVersion} Active
                      </span>
                      <button 
                        onClick={(e) => handleDeleteProject(project._id, e)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1.5"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-accent-purple transition-colors mb-2">{project.name}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6">{project.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {project.owner?.name === user?.name ? 'Owned by you' : `Shared by ${project.owner?.name}`}
                    </span>
                    <span className="flex items-center gap-1 text-accent-purple font-semibold group-hover:translate-x-1 transition-transform">
                      Open Canvas
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Creation Wizard Dialog */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-lg glass rounded-2xl border border-white/10 p-6 md:p-8 relative">
            
            {loading ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-purple animate-spin mb-6" />
                <Sparkles className="w-6 h-6 text-accent-cyan animate-bounce mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Generating System Blueprint</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">Our system pipeline is generating the requested documents and canvas nodes.</p>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-1000"
                    style={{ width: `${((stepIndex + 1) / generationSteps.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-mono text-accent-cyan animate-pulse">{generationSteps[stepIndex]}</span>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Initialize System Workspace</h3>
                  <p className="text-slate-400 text-xs">AI will outline files, API structures, databases, and drag nodes.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent text-sm transition-all"
                    placeholder="E.g., PetGrooming Uber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Describe your Product & Tech Stack</label>
                  <textarea
                    required
                    rows={4}
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent text-sm transition-all resize-none"
                    placeholder="E.g., Build an Airbnb for listing student housing. It needs a client app in React, an auth gateway, a booking service, and PostgreSQL DB."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="px-5 py-2.5 rounded-xl glass border border-white/10 text-white text-sm font-semibold hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-accent-purple text-white text-sm font-semibold hover:opacity-90 shadow-glow-purple flex items-center gap-2"
                  >
                    Generate System Design
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
