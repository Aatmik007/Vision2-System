import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Shield, Users, Layers, Zap, Check, ArrowRight, Play, Database, Server, Compass } from 'lucide-react';
import AIOrb from '../components/AIOrb.jsx';

export default function Landing({ setPage }) {
  const [activeTab, setActiveTab] = useState('uber');

  const ideasToShowcase = {
    uber: {
      input: "Build a ride sharing application like Uber with real-time location mapping.",
      outputs: [
        { label: "PRD", text: "FR-1: Passenger requests ride. FR-2: System queries nearest driver within 5km radius." },
        { label: "Database Schema", text: "Drivers: { id, location: [Lng, Lat], rating: Number, active: Boolean }" },
        { label: "API Design", text: "POST /rides/request (passengerId, startLoc, endLoc) -> returns rideToken" }
      ]
    },
    airbnb: {
      input: "Build an Airbnb clone for booking local properties and listings.",
      outputs: [
        { label: "PRD", text: "FR-1: Hosts upload listing images. FR-2: Guests search bookings by date and rating." },
        { label: "Database Schema", text: "Listings: { id, hostId, price, reviews: [{ authorId, comment, score }] }" },
        { label: "API Design", text: "GET /listings/search (city, startDate, endDate) -> returns listings[]" }
      ]
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden grid-bg">
      {/* Aurora Blurs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] aurora-glow-purple -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] aurora-glow-blue pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] aurora-glow-cyan pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center shadow-glow-purple">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-accent-cyan bg-clip-text text-transparent">
            Vision2System <span className="text-accent-purple">AI</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPage('login')} 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setPage('register')} 
            className="px-4 py-2 rounded-xl bg-accent-purple text-white text-sm font-semibold hover:bg-opacity-80 transition-all shadow-glow-purple"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-12 relative z-10">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/5 text-xs text-accent-cyan mb-6">
              <Zap className="w-3.5 h-3.5 fill-accent-cyan animate-pulse" />
              <span>Next-Gen System Architecture Engine</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
              Convert Startup Ideas <br />
              <span className="bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple bg-clip-text text-transparent animate-pulse-slow">
                Into System Designs
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Skip weeks of specification writing. Feed in your product concept and watch the AI build schemas, PRDs, API layouts, and database designs in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => setPage('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-glow-purple"
              >
                Start Generating Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                See How It Works
              </a>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 w-full relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <AIOrb />
          </motion.div>
        </div>
      </section>

      {/* Interactive Architecture Preview */}
      <section className="py-20 bg-black/40 border-y border-white/5 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Interactive Architecture Visualizer</h2>
          <p className="text-slate-400 mb-12 max-w-xl mx-auto">Click nodes to inspect service responsibilities. Connect your components visually.</p>
          
          <div className="max-w-4xl mx-auto glass p-6 md:p-8 rounded-2xl relative border border-white/10">
            {/* Visual connections between nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
              <div className="glass p-6 rounded-xl text-left border-l-4 border-accent-cyan">
                <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="text-white font-semibold mb-2">API Gateway</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Routes client requests, enforces authorization tokens, and provides rate limiting.</p>
              </div>

              <div className="glass p-6 rounded-xl text-left border-l-4 border-accent-purple">
                <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center text-accent-purple mb-4">
                  <Server className="w-5 h-5" />
                </div>
                <h4 className="text-white font-semibold mb-2">Auth Service</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Manages JWT generation, password encryption algorithms, and permission checking.</p>
              </div>

              <div className="glass p-6 rounded-xl text-left border-l-4 border-accent-pink">
                <div className="w-10 h-10 rounded-lg bg-accent-pink/10 flex items-center justify-center text-accent-pink mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-white font-semibold mb-2">Cluster DB</h4>
                <p className="text-slate-400 text-xs leading-relaxed">MongoDB replicaset storing transactional project trees and collaboration histories.</p>
              </div>
            </div>
            {/* Decorative connection background lines */}
            <div className="absolute inset-x-12 top-1/2 h-0.5 border-t border-dashed border-white/10 hidden md:block pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* AI Showcase Tabbed View */}
      <section id="demo" className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Witness the AI Generator Pipeline</h2>
            <p className="text-slate-400">Select an idea below to witness the output structure generated instantly by IdeaToSystem AI.</p>
          </div>

          <div className="max-w-4xl mx-auto glass p-1 rounded-2xl flex border border-white/15 mb-8">
            <button
              onClick={() => setActiveTab('uber')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'uber' ? 'bg-accent-purple text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Ride Sharing (Uber)
            </button>
            <button
              onClick={() => setActiveTab('airbnb')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === 'airbnb' ? 'bg-accent-purple text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Short-term Booking (Airbnb)
            </button>
          </div>

          <div className="max-w-4xl mx-auto glass p-6 md:p-8 rounded-2xl border border-white/5">
            <h4 className="text-xs font-semibold uppercase text-accent-cyan tracking-wider mb-2">Input Startup Idea</h4>
            <div className="p-4 rounded-xl bg-black/30 text-white font-mono text-sm border border-white/5 mb-6">
              "{ideasToShowcase[activeTab].input}"
            </div>

            <h4 className="text-xs font-semibold uppercase text-accent-purple tracking-wider mb-4">Auto-Generated Output Sections</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ideasToShowcase[activeTab].outputs.map((out, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs font-semibold text-accent-cyan block mb-2">{out.label}</span>
                  <p className="text-slate-400 text-xs leading-relaxed">{out.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10 bg-black/25">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Core Offerings</h2>
            <p className="text-slate-400">Everything a product manager, developer, or founder needs to align technical teams instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl border border-white/5 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Idea Analyzer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatically outlines database entities, operational risks, payment workflows, and hosting requirements from natural language.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/5 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Visual React Flow Canvas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Drag-and-drop custom gateways, microservices, caches, and database nodes. Automatically translates your visual canvas to API docs.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/5 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-pink/10 flex items-center justify-center text-accent-pink mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Collaboration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Built-in socket layers for concurrent editors, shared cursor movements, comments pins, workspace invitations, and change histories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Start for free with standard AI analysis. Upgrade anytime for full collaboration power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Free Starter</h4>
                <div className="text-3xl font-extrabold text-white mb-6">$0<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-cyan" /> 50 AI Credits on setup</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-cyan" /> Standard System Designs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-cyan" /> Single Workspace</li>
                </ul>
              </div>
              <button onClick={() => setPage('register')} className="w-full py-3 rounded-xl glass border border-white/10 text-white font-medium hover:bg-white/5 transition-all">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="glass p-8 rounded-2xl border-2 border-accent-purple flex flex-col justify-between relative shadow-glow-purple">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent-purple text-white text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Professional</h4>
                <div className="text-3xl font-extrabold text-white mb-6">$29<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-purple" /> Unlimited AI Credits</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-purple" /> Real-time Team Collaboration</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-purple" /> Export PDF, Markdown & JSON</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-purple" /> Dynamic Version Snapshots</li>
                </ul>
              </div>
              <button onClick={() => setPage('register')} className="w-full py-3 rounded-xl bg-accent-purple text-white font-medium hover:opacity-90 transition-all shadow-glow-purple">
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise */}
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Enterprise</h4>
                <div className="text-3xl font-extrabold text-white mb-6">Custom</div>
                <ul className="space-y-4 mb-8 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-cyan" /> Dedicated Private GPU models</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-cyan" /> SSO, SAML integrations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-cyan" /> SLA Uptime Guarantees</li>
                </ul>
              </div>
              <a href="mailto:sales@vision2system.com" className="w-full py-3 rounded-xl glass border border-white/10 text-white font-medium text-center hover:bg-white/5 transition-all">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-black/20 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-xl border border-white/5">
              <h4 className="text-white font-semibold mb-2">What AI model powers the generators?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                We default to the Gemini 1.5 model series (utilizing the official SDK) due to its 1-million-token context window which allows parsing massive system code structures and PRDs in a single pass.
              </p>
            </div>

            <div className="glass p-6 rounded-xl border border-white/5">
              <h4 className="text-white font-semibold mb-2">Can we connect visual layouts back to markdown specs?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Yes. Modifying nodes in the React Flow Canvas allows the system to auto-document updates across related PRDs and APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/60 relative z-10 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white">Vision2System AI</span>
          </div>
          <p>© {new Date().getFullYear()} Vision2System AI Inc. Built for scale.</p>
        </div>
      </footer>
    </div>
  );
}
