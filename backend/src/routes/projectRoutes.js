import express from 'express';
import { createProject, getProjects, getProjectById, updateProjectCanvas, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id/canvas', updateProjectCanvas);
router.delete('/:id', deleteProject);

export default router;
