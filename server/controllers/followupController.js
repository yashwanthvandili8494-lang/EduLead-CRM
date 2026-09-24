import Followup from '../models/Followup.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';

// @desc    Get follow-ups with filters (today, overdue, upcoming, status)
// @route   GET /api/followups
// @access  Private
export const getFollowups = async (req, res, next) => {
  try {
    const { filter, status, counsellor, page = 1, limit = 50 } = req.query;
    const query = {};

    // Role check: Counsellor only views their follow-ups
    if (req.user.role === 'COUNSELLOR') {
      query.counsellorId = req.user._id;
    } else if (counsellor && counsellor !== 'ALL') {
      query.counsellorId = counsellor;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (filter === 'today') {
      query.scheduledDate = { $gte: todayStart, $lte: todayEnd };
      query.status = { $ne: 'CANCELLED' };
    } else if (filter === 'overdue') {
      query.scheduledDate = { $lt: todayStart };
      query.status = 'PENDING';
    } else if (filter === 'upcoming') {
      query.scheduledDate = { $gt: todayEnd };
      query.status = 'PENDING';
    } else if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Followup.countDocuments(query);

    const followups = await Followup.find(query)
      .populate('leadId', 'leadId studentName phone email coursePreference status priority')
      .populate('counsellorId', 'name email')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Dynamic stats
    const statsQuery = req.user.role === 'COUNSELLOR' ? { counsellorId: req.user._id } : {};
    const overdueCount = await Followup.countDocuments({
      ...statsQuery,
      scheduledDate: { $lt: todayStart },
      status: 'PENDING',
    });
    const todayCount = await Followup.countDocuments({
      ...statsQuery,
      scheduledDate: { $gte: todayStart, $lte: todayEnd },
      status: 'PENDING',
    });
    const upcomingCount = await Followup.countDocuments({
      ...statsQuery,
      scheduledDate: { $gt: todayEnd },
      status: 'PENDING',
    });

    res.json({
      success: true,
      data: followups,
      total,
      stats: {
        overdue: overdueCount,
        today: todayCount,
        upcoming: upcomingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a new follow-up
// @route   POST /api/followups
// @access  Private
export const createFollowup = async (req, res, next) => {
  try {
    const { leadId, scheduledDate, scheduledTime, type, notes, nextAction } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Role check: Counsellor must be assigned
    if (req.user.role === 'COUNSELLOR' && lead.assignedCounsellor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You are not assigned to this lead' });
    }

    // Edge Case: Validate that scheduled date is not in the past
    const targetDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule date: Cannot schedule a follow-up in the past. Please select today or a future date.',
      });
    }

    const counsellorId = req.user.role === 'COUNSELLOR' ? req.user._id : (lead.assignedCounsellor || req.user._id);

    const followup = new Followup({
      leadId,
      counsellorId,
      scheduledDate: targetDate,
      scheduledTime: scheduledTime || '11:00 AM',
      type: type || 'Phone Call',
      status: 'PENDING',
      notes: notes || '',
      nextAction: nextAction || '',
    });

    const savedFollowup = await followup.save();

    // Update lead's next follow-up date and last contact date
    lead.nextFollowupDate = targetDate;
    if (lead.status === 'NEW' || lead.status === 'CONTACTED') {
      lead.status = 'FOLLOW_UP';
    }
    await lead.save();

    // Audit activity
    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: 'FOLLOWUP_SCHEDULED',
      description: `Follow-up (${type}) scheduled for ${targetDate.toLocaleDateString()} at ${scheduledTime || '11:00 AM'} by ${req.user.name}`,
      metadata: { followupId: savedFollowup._id, nextAction },
    });

    const populated = await Followup.findById(savedFollowup._id)
      .populate('leadId', 'leadId studentName phone coursePreference status')
      .populate('counsellorId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a follow-up action
// @route   PATCH /api/followups/:id/complete
// @access  Private
export const completeFollowup = async (req, res, next) => {
  try {
    const { completionOutcome, notes, nextAction } = req.body;
    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    followup.status = 'COMPLETED';
    followup.completedAt = new Date();
    followup.completionOutcome = completionOutcome || 'Information Shared - Will Review';
    if (notes) followup.notes = (followup.notes ? followup.notes + '\n' : '') + `[Completed]: ${notes}`;
    if (nextAction) followup.nextAction = nextAction;

    await followup.save();

    // Update Lead last contact date
    const lead = await Lead.findById(followup.leadId);
    if (lead) {
      lead.lastContactDate = Date.now();
      lead.nextFollowupDate = null;
      await lead.save();

      await Activity.create({
        leadId: lead._id,
        userId: req.user._id,
        action: 'FOLLOWUP_COMPLETED',
        description: `Follow-up completed by ${req.user.name}. Outcome: ${followup.completionOutcome}. Next: ${nextAction || 'None'}`,
        metadata: { outcome: followup.completionOutcome, nextAction },
      });
    }

    const populated = await Followup.findById(followup._id)
      .populate('leadId', 'leadId studentName phone status')
      .populate('counsellorId', 'name email');

    res.json({
      success: true,
      message: 'Follow-up marked as completed',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
