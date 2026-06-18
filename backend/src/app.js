import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import versionRoutes from './routes/versionRoutes.js';
import extraRoutes from './routes/extraRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // In production, replace with specific origins
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Bindings
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/version', versionRoutes);
app.use('/api/collaboration', extraRoutes); // binds comments/invites
app.use('/api/export', exportRoutes);

// Base Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'Healthy', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
