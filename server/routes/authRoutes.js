import express from 'express';
import { login, getMe, getDemoAccounts } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
