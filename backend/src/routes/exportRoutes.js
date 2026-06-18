import express from 'express';
import { exportJSON, exportMarkdown, exportPDF } from '../controllers/exportController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/json/:projectId', exportJSON);
router.get('/markdown/:projectId', exportMarkdown);
router.get('/pdf/:projectId', exportPDF);

export default router;
