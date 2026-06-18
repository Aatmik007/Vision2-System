import express from 'express';
import { 
  inviteCollaborator, 
  addComment, 
  getComments, 
  getUsage, 
  getActivities, 
  getNotifications 
} from '../controllers/extraController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/invite', inviteCollaborator);
router.post('/comment', addComment);
router.get('/comments/:projectId', getComments);
router.get('/usage', getUsage);
router.get('/activity', getActivities);
router.get('/notifications', getNotifications);

export default router;
