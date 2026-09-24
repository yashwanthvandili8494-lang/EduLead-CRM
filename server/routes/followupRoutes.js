import express from 'express';
import { getFollowups, createFollowup, completeFollowup } from '../controllers/followupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getFollowups);
router.post('/', createFollowup);
router.patch('/:id/complete', completeFollowup);

export default router;
