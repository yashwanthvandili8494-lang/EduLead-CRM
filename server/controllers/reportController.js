import Lead from '../models/Lead.js';
import Followup from '../models/Followup.js';
import User from '../models/User.js';

// @desc    Get dashboard metrics & summary
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const isCounsellor = req.user.role === 'COUNSELLOR';
    const filter = isCounsellor ? { assignedCounsellor: req.user._id } : {};

    const totalLeads = await Lead.countDocuments(filter);
    const newLeads = await Lead.countDocuments({ ...filter, status: 'NEW' });
    const convertedLeads = await Lead.countDocuments({ ...filter, status: 'CONVERTED' });
    const lostLeads = await Lead.countDocuments({ ...filter, status: 'LOST' });

    // Follow-ups metrics
    const followupFilter = isCounsellor ? { counsellorId: req.user._id } : {};
    const totalFollowups = await Followup.countDocuments({ ...followupFilter, status: 'PENDING' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const overdueFollowups = await Followup.countDocuments({
      ...followupFilter,
      scheduledDate: { $lt: todayStart },
      status: 'PENDING',
    });

    // Pipeline funnel counts
    const pipelineStages = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'APPLICATION', 'CONVERTED'];
    const pipelineData = await Promise.all(
      pipelineStages.map(async (stage) => {
        const count = await Lead.countDocuments({ ...filter, status: stage });
        return { stage, count };
      })
    );

    // Lead Sources distribution
    const sources = ['Website', 'Walk-in', 'Phone', 'WhatsApp', 'Fair', 'Campaign', 'Other'];
    const sourceData = await Promise.all(
      sources.map(async (src) => {
        const total = await Lead.countDocuments({ ...filter, source: src });
        const converted = await Lead.countDocuments({ ...filter, source: src, status: 'CONVERTED' });
        return {
          source: src,
          total,
          converted,
          conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
        };
      })
    );

    // Ageing Breakdown (0-2d, 3-7d, 8-15d, 15+d)
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    const activeFilter = { ...filter, status: { $nin: ['CONVERTED', 'LOST'] } };

    const age0to2 = await Lead.countDocuments({ ...activeFilter, createdAt: { $gte: twoDaysAgo } });
    const age3to7 = await Lead.countDocuments({ ...activeFilter, createdAt: { $gte: sevenDaysAgo, $lt: twoDaysAgo } });
    const age8to15 = await Lead.countDocuments({ ...activeFilter, createdAt: { $gte: fifteenDaysAgo, $lt: sevenDaysAgo } });
    const age15Plus = await Lead.countDocuments({ ...activeFilter, createdAt: { $lt: fifteenDaysAgo } });

    // Recent leads
    const recentLeads = await Lead.find(filter)
      .populate('assignedCounsellor', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        metrics: {
          totalLeads,
          newLeads,
          followups: totalFollowups,
          converted: convertedLeads,
          lost: lostLeads,
          overdue: overdueFollowups,
          conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
        },
        pipeline: pipelineData,
        sources: sourceData,
        ageing: [
          { range: '0–2 days', label: 'Fresh', count: age0to2, color: '#10b981' },
          { range: '3–7 days', label: 'Active', count: age3to7, color: '#3b82f6' },
          { range: '8–15 days', label: 'At Risk', count: age8to15, color: '#f59e0b' },
          { range: '15+ days', label: 'Stagnant', count: age15Plus, color: '#ef4444' },
        ],
        recentLeads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the 4 comprehensive reports for management analysis
// @route   GET /api/reports/analytics
// @access  Private
export const getAnalyticsReports = async (req, res, next) => {
  try {
    // 1. Source Performance Report
    const sources = ['Website', 'Walk-in', 'Phone', 'WhatsApp', 'Fair', 'Campaign', 'Other'];
    const sourceReport = await Promise.all(
      sources.map(async (src) => {
        const total = await Lead.countDocuments({ source: src });
        const converted = await Lead.countDocuments({ source: src, status: 'CONVERTED' });
        const lost = await Lead.countDocuments({ source: src, status: 'LOST' });
        const inProgress = total - converted - lost;
        const rate = total > 0 ? Math.round((converted / total) * 100) : 0;
        return {
          source: src,
          total,
          converted,
          lost,
          inProgress,
          conversionRate: rate,
        };
      })
    );

    // 2. Counsellor Performance Report
    const counsellors = await User.find({ role: { $in: ['COUNSELLOR', 'MANAGER'] } }).select('name email department');
    const counsellorReport = await Promise.all(
      counsellors.map(async (c) => {
        const totalAssigned = await Lead.countDocuments({ assignedCounsellor: c._id });
        const converted = await Lead.countDocuments({ assignedCounsellor: c._id, status: 'CONVERTED' });
        const lost = await Lead.countDocuments({ assignedCounsellor: c._id, status: 'LOST' });
        const pendingFollowups = await Followup.countDocuments({ counsellorId: c._id, status: 'PENDING' });
        const completedFollowups = await Followup.countDocuments({ counsellorId: c._id, status: 'COMPLETED' });
        const conversionRate = totalAssigned > 0 ? Math.round((converted / totalAssigned) * 100) : 0;

        return {
          id: c._id,
          name: c.name,
          email: c.email,
          totalAssigned,
          converted,
          lost,
          pendingFollowups,
          completedFollowups,
          conversionRate,
        };
      })
    );

    // Unassigned leads
    const unassignedCount = await Lead.countDocuments({ assignedCounsellor: null });

    // 3. Status Distribution Funnel
    const allStatuses = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'APPLICATION', 'CONVERTED', 'LOST'];
    const totalAll = await Lead.countDocuments();
    const statusDistribution = await Promise.all(
      allStatuses.map(async (st) => {
        const count = await Lead.countDocuments({ status: st });
        const percentage = totalAll > 0 ? Math.round((count / totalAll) * 100) : 0;
        return { status: st, count, percentage };
      })
    );

    // 4. Ageing Report with high-risk stagnant leads
    const activeLeads = await Lead.find({ status: { $nin: ['CONVERTED', 'LOST'] } })
      .populate('assignedCounsellor', 'name')
      .sort({ createdAt: 1 })
      .limit(50);

    const now = new Date();
    const ageingLeads = activeLeads.map((lead) => {
      const ageDays = Math.floor(Math.abs(now - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
      const lastContactDays = lead.lastContactDate
        ? Math.floor(Math.abs(now - new Date(lead.lastContactDate)) / (1000 * 60 * 60 * 24))
        : ageDays;

      let riskCategory = 'Normal';
      if (ageDays >= 15 || lastContactDays >= 7) {
        riskCategory = 'Critical';
      } else if (ageDays >= 8 || lastContactDays >= 4) {
        riskCategory = 'Warning';
      }

      return {
        _id: lead._id,
        leadId: lead.leadId,
        studentName: lead.studentName,
        phone: lead.phone,
        coursePreference: lead.coursePreference,
        source: lead.source,
        status: lead.status,
        counsellorName: lead.assignedCounsellor ? lead.assignedCounsellor.name : 'Unassigned',
        ageDays,
        lastContactDays,
        riskCategory,
      };
    });

    res.json({
      success: true,
      data: {
        sourcePerformance: sourceReport,
        counsellorPerformance: counsellorReport,
        unassignedCount,
        statusDistribution,
        ageingReport: ageingLeads,
      },
    });
  } catch (error) {
    next(error);
  }
};
