import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // in production, constrain to client url
    methods: ['GET', 'POST']
  }
});

// Presence management: maps projectId -> Array of user objects
const workspacePresence = {};

io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // User joins a project workspace
  socket.on('join-project', ({ projectId, user }) => {
    if (!projectId || !user) return;
    
    socket.join(projectId);
    socket.projectId = projectId;
    socket.user = user;

    if (!workspacePresence[projectId]) {
      workspacePresence[projectId] = [];
    }

    // Add user if not already present
    const exists = workspacePresence[projectId].find(u => u.id === user.id);
    if (!exists) {
      workspacePresence[projectId].push({
        id: user.id,
        name: user.name,
        socketId: socket.id,
        color: getRandomColor()
      });
    }

    console.log(`User ${user.name} joined project room: ${projectId}`);
    
    // Broadcast updated presence list to everyone in the room
    io.to(projectId).emit('presence-update', workspacePresence[projectId]);
  });

  // Track live mouse cursor coordinates
  socket.on('cursor-move', ({ x, y }) => {
    if (!socket.projectId || !socket.user) return;
    
    // Find client's assigned color
    const roomUsers = workspacePresence[socket.projectId] || [];
    const activeUser = roomUsers.find(u => u.socketId === socket.id);
    const color = activeUser ? activeUser.color : '#8b5cf6';

    // Broadcast coordinate shift to other peers
    socket.to(socket.projectId).emit('cursor-update', {
      userId: socket.user.id,
      name: socket.user.name,
      color,
      x,
      y
    });
  });

  // React Flow workspace nodes/edges updates
  socket.on('node-change', ({ nodes, edges }) => {
    if (!socket.projectId) return;
    // Broadcast state updates to other editors
    socket.to(socket.projectId).emit('node-update', { nodes, edges });
  });

  // Document editor live markdown updates
  socket.on('doc-change', ({ docId, content }) => {
    if (!socket.projectId) return;
    socket.to(socket.projectId).emit('doc-update', { docId, content });
  });

  // Spatial comments creation alert
  socket.on('new-comment', (comment) => {
    if (!socket.projectId) return;
    socket.to(socket.projectId).emit('comment-received', comment);
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const { projectId, user } = socket;
    
    if (projectId && workspacePresence[projectId]) {
      // Remove connection record
      workspacePresence[projectId] = workspacePresence[projectId].filter(
        u => u.socketId !== socket.id
      );

      // Broadcast updated member list
      io.to(projectId).emit('presence-update', workspacePresence[projectId]);
    }
  });
});

// Helper for live cursors color variations
function getRandomColor() {
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
  return colors[Math.floor(Math.random() * colors.length)];
}

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
