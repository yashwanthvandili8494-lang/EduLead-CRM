import User from '../models/User.js';
import Lead from '../models/Lead.js';

// @desc    Get all counsellors with workload metrics
// @route   GET /api/users/counsellors
// @access  Private
export const getCounsellors = async (req, res, next) => {
  try {
    const counsellors = await User.find({ role: { $in: ['COUNSELLOR', 'MANAGER'] } })
      .select('name email role phone department isActive specialization createdAt')
      .lean();

    // Attach real-time workload stats for each counsellor
    const enriched = await Promise.all(
      counsellors.map(async (c) => {
        const totalAssigned = await Lead.countDocuments({ assignedCounsellor: c._id });
        const activeLeads = await Lead.countDocuments({
          assignedCounsellor: c._id,
          status: { $nin: ['CONVERTED', 'LOST'] },
        });
        const convertedLeads = await Lead.countDocuments({
          assignedCounsellor: c._id,
          status: 'CONVERTED',
        });
        const lostLeads = await Lead.countDocuments({
          assignedCounsellor: c._id,
          status: 'LOST',
        });

        const conversionRate = totalAssigned > 0 ? Math.round((convertedLeads / totalAssigned) * 100) : 0;

        return {
          ...c,
          totalAssigned,
          activeLeads,
          convertedLeads,
          lostLeads,
          conversionRate,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle counsellor active status (Handle counsellor leaving or taking leave)
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin, Manager)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Count active leads assigned to this user
    const pendingLeadsCount = await Lead.countDocuments({
      assignedCounsellor: user._id,
      status: { $nin: ['CONVERTED', 'LOST'] },
    });

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      data: user,
      activeLeadsToReassign: !user.isActive ? pendingLeadsCount : 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user / counsellor
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department, specialization } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Welcome@123',
      role: role || 'COUNSELLOR',
      phone,
      department: department || 'Admissions',
      specialization: specialization ? specialization.split(',').map((s) => s.trim()) : ['General'],
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
