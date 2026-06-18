import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Workspace from './pages/Workspace.jsx';

function AppContent() {
  const [page, setPage] = useState('landing');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center animate-spin">
          <div className="w-6 h-6 rounded-lg bg-background"></div>
        </div>
        <span className="text-slate-400 text-xs mt-3">Loading session...</span>
      </div>
    );
  }

  // Routing checks
  switch (page) {
    case 'landing':
      return <Landing setPage={setPage} />;
    case 'login':
      return <Login setPage={setPage} />;
    case 'register':
      return <Register setPage={setPage} />;
    case 'dashboard':
      if (!user) {
        setPage('login');
        return null;
      }
      return <Dashboard setPage={setPage} setSelectedProjectId={setSelectedProjectId} />;
    case 'workspace':
      if (!user) {
        setPage('login');
        return null;
      }
      if (!selectedProjectId) {
        setPage('dashboard');
        return null;
      }
      return <Workspace setPage={setPage} projectId={selectedProjectId} />;
    default:
      return <Landing setPage={setPage} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
