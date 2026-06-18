import express from 'express';
import { createVersion, restoreVersion, getVersions, compareVersions } from '../controllers/versionController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/create', createVersion);
router.post('/restore', restoreVersion);
router.get('/list/:projectId', getVersions);
router.get('/compare', compareVersions);

export default router;
