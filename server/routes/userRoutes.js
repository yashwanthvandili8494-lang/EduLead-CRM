import express from 'express';
import { getCounsellors, toggleUserStatus, createUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/counsellors', getCounsellors);
router.patch('/:id/toggle-status', authorize('ADMIN', 'MANAGER'), toggleUserStatus);
router.post('/', authorize('ADMIN'), createUser);

export default router;
