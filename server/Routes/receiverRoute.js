import express from 'express';
import { claimDrop, verifyPickup, getAvailableDrops, getImpactStats } from '../controllers/receiverController.js';
import { checkAuth } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/available', getAvailableDrops);
router.post('/claim', checkAuth, claimDrop);
router.post('/verify', checkAuth, verifyPickup);
router.get('/impact-stats', checkAuth, getImpactStats);
export default router;