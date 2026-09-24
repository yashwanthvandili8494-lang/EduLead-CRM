import express from 'express';
import { getDashboardMetrics, getAnalyticsReports } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardMetrics);
router.get('/analytics', getAnalyticsReports);

export default router;
