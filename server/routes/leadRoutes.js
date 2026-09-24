import express from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateStatus,
  recoverLead,
  assignCounsellor,
  bulkReassign,
  checkDuplicate,
} from '../controllers/leadController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.post('/', createLead);
router.post('/check-duplicate', checkDuplicate);
router.post('/bulk-reassign', authorize('ADMIN', 'MANAGER'), bulkReassign);

router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.patch('/:id/status', updateStatus);
router.post('/:id/recover', recoverLead);
router.patch('/:id/assign', authorize('ADMIN', 'MANAGER'), assignCounsellor);

export default router;
