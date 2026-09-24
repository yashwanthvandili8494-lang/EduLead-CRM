import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Followup from '../models/Followup.js';
import { generateLeadId } from '../utils/idGenerator.js';

// @desc    Get all leads with filters, search, ageing, and pagination
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res, next) => {
  try {
    const {
      status,
      source,
      course,
      counsellor,
      priority,
      search,
      ageing,
      unassigned,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Role-based visibility: Counsellors only see their own assigned leads
    if (req.user.role === 'COUNSELLOR') {
      query.assignedCounsellor = req.user._id;
    } else if (counsellor) {
      if (counsellor === 'unassigned') {
        query.assignedCounsellor = null;
      } else {
        query.assignedCounsellor = counsellor;
      }
    }

    if (unassigned === 'true') {
      query.assignedCounsellor = null;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (source && source !== 'ALL') {
      query.source = source;
    }

    if (course && course !== 'ALL') {
      query.coursePreference = course;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    // Search filter across student name, phone, email, leadId
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { studentName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { leadId: searchRegex },
      ];
    }

    // Ageing filter (days since created)
    const now = new Date();
    if (ageing) {
      if (ageing === '0-2') {
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: twoDaysAgo };
      } else if (ageing === '3-7') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: sevenDaysAgo, $lt: twoDaysAgo };
      } else if (ageing === '8-15') {
        const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: fifteenDaysAgo, $lt: sevenDaysAgo };
      } else if (ageing === '15+') {
        const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        query.createdAt = { $lt: fifteenDaysAgo };
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const totalLeads = await Lead.countDocuments(query);

    const leads = await Lead.find(query)
      .populate('assignedCounsellor', 'name email role department')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: leads.length,
      totalLeads,
      totalPages: Math.ceil(totalLeads / Number(limit)),
      currentPage: Number(page),
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead by ID with follow-ups & activities
// @route   GET /api/leads/:id
// @access  Private
export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedCounsellor', 'name email role phone department')
      .populate('recoveryHistory.recoveredBy', 'name email role');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Role check: Counsellor can only access their assigned leads
    if (req.user.role === 'COUNSELLOR') {
      if (!lead.assignedCounsellor || lead.assignedCounsellor._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to view your assigned admission leads.',
        });
      }
    }

    // Fetch related follow-ups
    const followups = await Followup.find({ leadId: lead._id })
      .populate('counsellorId', 'name email')
      .sort({ scheduledDate: -1, createdAt: -1 });

    // Fetch activity audit trail
    const activities = await Activity.find({ leadId: lead._id })
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...lead.toObject(),
        followups,
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check duplicate phone/email in real time before creating
// @route   POST /api/leads/check-duplicate
// @access  Private
export const checkDuplicate = async (req, res, next) => {
  try {
    const { phone, email } = req.body;
    const matches = [];

    if (phone) {
      const phoneMatch = await Lead.find({ phone: phone.trim() }).select('leadId studentName phone email source status createdAt assignedCounsellor').populate('assignedCounsellor', 'name');
      if (phoneMatch.length > 0) {
        phoneMatch.forEach((m) => matches.push({ matchType: 'PHONE', lead: m }));
      }
    }

    if (email) {
      const emailMatch = await Lead.find({ email: email.trim().toLowerCase() }).select('leadId studentName phone email source status createdAt assignedCounsellor').populate('assignedCounsellor', 'name');
      if (emailMatch.length > 0) {
        emailMatch.forEach((m) => {
          if (!matches.some((existing) => existing.lead._id.toString() === m._id.toString())) {
            matches.push({ matchType: 'EMAIL', lead: m });
          }
        });
      }
    }

    res.json({
      success: true,
      hasDuplicates: matches.length > 0,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new admission lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req, res, next) => {
  try {
    const {
      studentName,
      phone,
      email,
      coursePreference,
      source,
      priority,
      assignedCounsellor,
      notes,
      city,
      previousEducation,
      percentage,
      expectedAdmissionDate,
      allowDuplicate,
    } = req.body;

    // Check duplicate phone or email
    const duplicateMatches = [];
    const existingByPhone = await Lead.find({ phone: phone.trim() });
    const existingByEmail = await Lead.find({ email: email.trim().toLowerCase() });

    existingByPhone.forEach((m) => duplicateMatches.push({ leadId: m.leadId, matchType: 'PHONE', source: m.source }));
    existingByEmail.forEach((m) => {
      if (!duplicateMatches.some((item) => item.leadId === m.leadId)) {
        duplicateMatches.push({ leadId: m.leadId, matchType: 'EMAIL', source: m.source });
      }
    });

    if (duplicateMatches.length > 0 && !allowDuplicate) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: `Potential duplicate lead detected! A lead with this phone/email already exists (${duplicateMatches.map((d) => `${d.leadId} via ${d.source}`).join(', ')}).`,
        duplicateMatches,
      });
    }

    const leadId = await generateLeadId();

    // If counsellor is not assigned and user is Counsellor, assign to self
    let assigned = assignedCounsellor || null;
    if (!assigned && req.user.role === 'COUNSELLOR') {
      assigned = req.user._id;
    }

    const newLead = new Lead({
      leadId,
      studentName,
      phone,
      email,
      coursePreference: coursePreference || 'BCA',
      source: source || 'Website',
      status: 'NEW',
      priority: priority || 'MEDIUM',
      assignedCounsellor: assigned,
      notes: notes || '',
      city: city || '',
      previousEducation: previousEducation || '',
      percentage: percentage || '',
      expectedAdmissionDate: expectedAdmissionDate || null,
      duplicateFlag: duplicateMatches.length > 0,
      duplicateMatches,
    });

    const savedLead = await newLead.save();

    // Create Audit Activity
    await Activity.create({
      leadId: savedLead._id,
      userId: req.user._id,
      action: 'LEAD_CREATED',
      description: `Lead created from source '${savedLead.source}' by ${req.user.name}`,
      metadata: {
        source: savedLead.source,
        course: savedLead.coursePreference,
        priority: savedLead.priority,
      },
    });

    if (assigned) {
      const counsellorUser = await User.findById(assigned);
      await Activity.create({
        leadId: savedLead._id,
        userId: req.user._id,
        action: 'COUNSELLOR_ASSIGNED',
        description: `Assigned to counsellor ${counsellorUser ? counsellorUser.name : 'Staff'}`,
        metadata: { counsellorId: assigned },
      });
    }

    const populatedLead = await Lead.findById(savedLead._id).populate('assignedCounsellor', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead details
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Role check
    if (req.user.role === 'COUNSELLOR' && lead.assignedCounsellor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this lead' });
    }

    const updatableFields = [
      'studentName',
      'phone',
      'email',
      'coursePreference',
      'priority',
      'notes',
      'city',
      'previousEducation',
      'percentage',
      'expectedAdmissionDate',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    lead.lastContactDate = Date.now();
    const updatedLead = await lead.save();

    await Activity.create({
      leadId: updatedLead._id,
      userId: req.user._id,
      action: 'LEAD_UPDATED',
      description: `Lead details updated by ${req.user.name}`,
    });

    const populated = await Lead.findById(updatedLead._id).populate('assignedCounsellor', 'name email role');
    res.json({ success: true, message: 'Lead updated', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status (Lifecycle transitions)
// @route   PATCH /api/leads/:id/status
// @access  Private
export const updateStatus = async (req, res, next) => {
  try {
    const { status, conversionDetails, lostReason, lostNotes } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Role check
    if (req.user.role === 'COUNSELLOR' && lead.assignedCounsellor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this lead status' });
    }

    const previousStatus = lead.status;

    // Edge Case: Transitioning to CONVERTED requires mandatory admission data
    if (status === 'CONVERTED') {
      if (!conversionDetails || !conversionDetails.admissionId || !conversionDetails.feePaid) {
        return res.status(400).json({
          success: false,
          message: 'Conversion validation failed: Admission ID and initial Fee Paid amount are required to mark a lead as CONVERTED.',
        });
      }
      lead.conversionDetails = {
        admissionId: conversionDetails.admissionId,
        feePaid: Number(conversionDetails.feePaid),
        receiptNumber: conversionDetails.receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
        enrolledAt: conversionDetails.enrolledAt || new Date(),
        remarks: conversionDetails.remarks || 'Successfully admitted',
      };
      // Clear lost info if previously lost
      lead.lostReason = undefined;
    }

    // Edge Case: Transitioning to LOST requires mandatory reason
    if (status === 'LOST') {
      if (!lostReason) {
        return res.status(400).json({
          success: false,
          message: 'Lost validation failed: A valid reason is required to mark a lead as LOST.',
        });
      }
      lead.lostReason = lostReason;
      lead.lostNotes = lostNotes || '';
      lead.lostAt = new Date();
    }

    lead.status = status;
    lead.lastContactDate = Date.now();
    await lead.save();

    // Log Activity
    let action = 'STATUS_CHANGED';
    let description = `Status changed from ${previousStatus} to ${status} by ${req.user.name}`;

    if (status === 'CONVERTED') {
      action = 'LEAD_CONVERTED';
      description = `Student enrolled! Admission ID: ${lead.conversionDetails.admissionId}, Fee Paid: ₹${lead.conversionDetails.feePaid}`;
    } else if (status === 'LOST') {
      action = 'LEAD_LOST';
      description = `Lead marked LOST by ${req.user.name}. Reason: ${lostReason}`;
    }

    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action,
      description,
      metadata: { previousStatus, newStatus: status, lostReason },
    });

    const populated = await Lead.findById(lead._id).populate('assignedCounsellor', 'name email role');
    res.json({ success: true, message: `Status updated to ${status}`, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Recover an accidentally lost lead (Edge case requirement)
// @route   POST /api/leads/:id/recover
// @access  Private
export const recoverLead = async (req, res, next) => {
  try {
    const { recoveryReason, targetStatus = 'FOLLOW_UP' } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (lead.status !== 'LOST') {
      return res.status(400).json({ success: false, message: 'Lead is not marked as lost' });
    }

    lead.recoveryHistory.push({
      recoveredAt: new Date(),
      recoveredBy: req.user._id,
      reason: recoveryReason || 'Accidentally marked as lost or student re-engaged',
    });

    const previousLostReason = lead.lostReason;
    lead.status = targetStatus;
    lead.lostReason = undefined;
    lead.lostAt = undefined;
    lead.lastContactDate = Date.now();

    await lead.save();

    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: 'LEAD_RECOVERED',
      description: `Lead recovered from LOST state to ${targetStatus} by ${req.user.name}. Note: ${recoveryReason || 'Student re-engaged'}`,
      metadata: { previousLostReason, targetStatus },
    });

    const populated = await Lead.findById(lead._id).populate('assignedCounsellor', 'name email role');
    res.json({ success: true, message: 'Lead successfully recovered and re-opened', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign single lead to counsellor
// @route   PATCH /api/leads/:id/assign
// @access  Private (Admin, Manager)
export const assignCounsellor = async (req, res, next) => {
  try {
    const { counsellorId } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const previousCounsellor = lead.assignedCounsellor;
    const newCounsellor = counsellorId ? await User.findById(counsellorId) : null;

    lead.assignedCounsellor = counsellorId || null;
    await lead.save();

    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: previousCounsellor ? 'COUNSELLOR_REASSIGNED' : 'COUNSELLOR_ASSIGNED',
      description: newCounsellor
        ? `Lead assigned to counsellor ${newCounsellor.name} by ${req.user.name}`
        : `Lead unassigned by ${req.user.name}`,
      metadata: { previousCounsellor, newCounsellorId: counsellorId },
    });

    const populated = await Lead.findById(lead._id).populate('assignedCounsellor', 'name email role');
    res.json({ success: true, message: 'Counsellor assigned successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk reassign leads (e.g. when counsellor is sick/leaves or rebalancing load)
// @route   POST /api/leads/bulk-reassign
// @access  Private (Admin, Manager)
export const bulkReassign = async (req, res, next) => {
  try {
    const { leadIds, fromCounsellorId, toCounsellorId } = req.body;

    if (!toCounsellorId) {
      return res.status(400).json({ success: false, message: 'Target counsellor ID is required' });
    }

    const targetUser = await User.findById(toCounsellorId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target counsellor not found' });
    }

    let filter = {};
    if (leadIds && leadIds.length > 0) {
      filter._id = { $in: leadIds };
    } else if (fromCounsellorId) {
      filter.assignedCounsellor = fromCounsellorId;
      filter.status = { $nin: ['CONVERTED', 'LOST'] }; // Only reassign active pipeline
    } else {
      return res.status(400).json({ success: false, message: 'Provide either leadIds or fromCounsellorId' });
    }

    const result = await Lead.updateMany(filter, {
      $set: { assignedCounsellor: toCounsellorId, lastContactDate: Date.now() },
    });

    // Create activity records for bulk leads
    const updatedLeads = await Lead.find(filter).select('_id');
    const activities = updatedLeads.map((l) => ({
      leadId: l._id,
      userId: req.user._id,
      action: 'COUNSELLOR_REASSIGNED',
      description: `Bulk reassigned to counsellor ${targetUser.name} by ${req.user.name}`,
      metadata: { toCounsellorId },
    }));

    if (activities.length > 0) {
      await Activity.insertMany(activities);
    }

    res.json({
      success: true,
      message: `Successfully reassigned ${result.modifiedCount} leads to ${targetUser.name}`,
      count: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
