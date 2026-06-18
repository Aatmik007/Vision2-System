import express from 'express';
import { rewriteDoc, updateDocument, runFullSystemDesign, runModifySystemDesign } from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/rewrite', rewriteDoc);
router.put('/document/:docId', updateDocument);
router.post('/generate-system-design', runFullSystemDesign);
router.post('/modify-design', runModifySystemDesign);

export default router;
