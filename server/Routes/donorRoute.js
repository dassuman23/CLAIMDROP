import express from 'express';
const router = express.Router();
import { createDrop, getDonorStats } from '../controllers/donorController.js';
import { checkAuth } from '../middleware/authMiddleware.js';
router.post('/drop', checkAuth, createDrop);


router.post('/get', checkAuth, getDonorStats);

export default router;