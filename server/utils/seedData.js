import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Followup from '../models/Followup.js';
import Activity from '../models/Activity.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already contains users. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Seeding realistic EduLead admissions data...');

    // 1. Create Default Users (Admin, Manager, Counsellors)
    const adminUser = await User.create({
      name: 'Dr. Suresh Sharma',
      email: 'admin@edulead.edu',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '+91 98201 11223',
      department: 'Dean of Admissions',
      specialization: ['Strategy', 'Institutional Policy'],
    });

    const managerUser = await User.create({
      name: 'Ananya Deshmukh',
      email: 'manager@edulead.edu',
      password: 'Manager@123',
      role: 'MANAGER',
      phone: '+91 98202 22334',
      department: 'Admissions Operations',
      specialization: ['Lead Operations', 'Conversion Analytics'],
    });

    const counsellorPriya = await User.create({
      name: 'Priya Nair',
      email: 'priya@edulead.edu',
      password: 'Priya@123',
      role: 'COUNSELLOR',
      phone: '+91 98203 33445',
      department: 'UG Admissions',
      specialization: ['BCA', 'BBA', 'B.Com'],
    });

    const counsellorRohan = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@edulead.edu',
      password: 'Rohan@123',
      role: 'COUNSELLOR',
      phone: '+91 98204 44556',
      department: 'Engineering Admissions',
      specialization: ['B.Tech CSE', 'B.Tech AI', 'MCA'],
    });

    const counsellorNeha = await User.create({
      name: 'Neha Kulkarni',
      email: 'neha@edulead.edu',
      password: 'Neha@123',
      role: 'COUNSELLOR',
      phone: '+91 98205 55667',
      department: 'PG & Management Admissions',
      specialization: ['MBA', 'MCA'],
    });

    const counsellors = [counsellorPriya, counsellorRohan, counsellorNeha];

    // Helper for date offsets
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const daysAhead = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    // 2. Realistic Leads
    const rawLeads = [
      {
        leadId: 'LED-2026-1001',
        studentName: 'Rahul Kumar',
        phone: '+91 98450 12345',
        email: 'rahul.kumar@gmail.com',
        coursePreference: 'BCA',
        source: 'WhatsApp',
        status: 'INTERESTED',
        priority: 'HIGH',
        counsellor: counsellorPriya,
        city: 'Bangalore',
        previousEducation: '12th Science (State Board)',
        percentage: '84.5%',
        createdDaysAgo: 4,
        notes: 'Interested in BCA with Cloud Specialization. Asked about hostel and installment facility.',
      },
      {
        leadId: 'LED-2026-1002',
        studentName: 'Anita Rao',
        phone: '+91 98450 23456',
        email: 'anita.rao@outlook.com',
        coursePreference: 'B.Tech CSE',
        source: 'Website',
        status: 'APPLICATION',
        priority: 'URGENT',
        counsellor: counsellorRohan,
        city: 'Hyderabad',
        previousEducation: '12th CBSE',
        percentage: '91.2%',
        createdDaysAgo: 8,
        notes: 'Application form submitted online. Verification of 12th marksheet in progress.',
      },
      {
        leadId: 'LED-2026-1003',
        studentName: 'Vikram Malhotra',
        phone: '+91 98450 34567',
        email: 'vikram.m@gmail.com',
        coursePreference: 'MBA',
        source: 'Walk-in',
        status: 'CONVERTED',
        priority: 'HIGH',
        counsellor: counsellorNeha,
        city: 'Mumbai',
        previousEducation: 'B.Com (Hons)',
        percentage: '78.0%',
        createdDaysAgo: 14,
        notes: 'Admitted into MBA Finance. Scholarship fee waiver approved.',
        conversionDetails: {
          admissionId: 'ADM-2026-MBA-089',
          feePaid: 75000,
          receiptNumber: 'REC-2026-4491',
          enrolledAt: daysAgo(2),
          remarks: 'First installment paid online via NEFT. ID card issued.',
        },
      },
      {
        leadId: 'LED-2026-1004',
        studentName: 'Sneha Patel',
        phone: '+91 98450 45678',
        email: 'sneha.patel@yahoo.com',
        coursePreference: 'B.Tech AI',
        source: 'Fair',
        status: 'FOLLOW_UP',
        priority: 'MEDIUM',
        counsellor: counsellorRohan,
        city: 'Ahmedabad',
        previousEducation: '12th GSEB',
        percentage: '86.4%',
        createdDaysAgo: 6,
        notes: 'Met at Education Expo. Requested syllabus comparison with traditional CSE.',
      },
      {
        leadId: 'LED-2026-1005',
        studentName: 'Kiran Joshi',
        phone: '+91 98450 56789',
        email: 'kiran.joshi@gmail.com',
        coursePreference: 'BBA',
        source: 'Phone',
        status: 'NEW',
        priority: 'MEDIUM',
        counsellor: null, // Unassigned edge case demonstration
        city: 'Pune',
        previousEducation: '12th Commerce',
        percentage: '76.2%',
        createdDaysAgo: 1,
        notes: 'Inquired about fee structure and sports quota eligibility.',
      },
      {
        leadId: 'LED-2026-1006',
        studentName: 'Amit Verma',
        phone: '+91 98450 67890',
        email: 'amit.verma@hotmail.com',
        coursePreference: 'MCA',
        source: 'Campaign',
        status: 'CONTACTED',
        priority: 'LOW',
        counsellor: counsellorPriya,
        city: 'Delhi NCR',
        previousEducation: 'B.Sc Computer Science',
        percentage: '72.0%',
        createdDaysAgo: 3,
        notes: 'Working professional looking for evening/weekend options. Clarified regular attendance criteria.',
      },
      {
        leadId: 'LED-2026-1007',
        studentName: 'Pooja Gupta',
        phone: '+91 98450 78901',
        email: 'pooja.gupta@gmail.com',
        coursePreference: 'BCA',
        source: 'Website',
        status: 'LOST',
        priority: 'LOW',
        counsellor: counsellorPriya,
        city: 'Jaipur',
        previousEducation: '12th Science',
        percentage: '68.5%',
        createdDaysAgo: 18,
        notes: 'Student selected local government college due to zero hostel expenses.',
        lostReason: 'Budget / High Fee Structure',
        lostNotes: 'Parents opted for local state college to avoid hostel charges.',
      },
      {
        leadId: 'LED-2026-1008',
        studentName: 'Arjun Singh',
        phone: '+91 98450 89012',
        email: 'arjun.singh@gmail.com',
        coursePreference: 'B.Tech CSE',
        source: 'WhatsApp',
        status: 'FOLLOW_UP',
        priority: 'HIGH',
        counsellor: counsellorRohan,
        city: 'Chandigarh',
        previousEducation: '12th CBSE',
        percentage: '89.5%',
        createdDaysAgo: 16, // Stagnant lead for ageing analysis (15+ days)
        notes: 'Awaiting JEE Main Round 2 results before confirming admission.',
      },
      {
        leadId: 'LED-2026-1009',
        studentName: 'Deepa Mehta',
        phone: '+91 98450 90123',
        email: 'deepa.mehta@gmail.com',
        coursePreference: 'MBA',
        source: 'Fair',
        status: 'CONVERTED',
        priority: 'URGENT',
        counsellor: counsellorNeha,
        city: 'Indore',
        previousEducation: 'BBA Marketing',
        percentage: '82.3%',
        createdDaysAgo: 10,
        notes: 'Executive MBA candidate. Documents validated.',
        conversionDetails: {
          admissionId: 'ADM-2026-MBA-094',
          feePaid: 100000,
          receiptNumber: 'REC-2026-4512',
          enrolledAt: daysAgo(3),
          remarks: 'Direct corporate sponsored seat.',
        },
      },
      {
        leadId: 'LED-2026-1010',
        studentName: 'Sandeep Reddy',
        phone: '+91 98450 01234',
        email: 'sandeep.reddy@gmail.com',
        coursePreference: 'BCA',
        source: 'Walk-in',
        status: 'INTERESTED',
        priority: 'HIGH',
        counsellor: counsellorPriya,
        city: 'Bangalore',
        previousEducation: '12th Karnataka State',
        percentage: '81.0%',
        createdDaysAgo: 2,
        notes: 'Came for campus visit with uncle. Very impressed with lab infrastructure.',
      },
      {
        leadId: 'LED-2026-1011',
        studentName: 'Ritu Sen',
        phone: '+91 98450 11223',
        email: 'ritu.sen@gmail.com',
        coursePreference: 'B.Tech CSE',
        source: 'Website',
        status: 'NEW',
        priority: 'MEDIUM',
        counsellor: counsellorRohan,
        city: 'Kolkata',
        previousEducation: '12th WB Board',
        percentage: '88.0%',
        createdDaysAgo: 0,
        notes: 'Downloaded brochure from website 2 hours ago.',
      },
      {
        leadId: 'LED-2026-1012',
        studentName: 'Manisha Das',
        phone: '+91 98450 22334',
        email: 'manisha.das@gmail.com',
        coursePreference: 'B.Com',
        source: 'Other',
        status: 'FOLLOW_UP',
        priority: 'MEDIUM',
        counsellor: counsellorPriya,
        city: 'Bhubaneswar',
        previousEducation: '12th Commerce',
        percentage: '79.4%',
        createdDaysAgo: 11,
        notes: 'Alumni referral. Inquiring about CA integrated coaching.',
      },
      {
        leadId: 'LED-2026-1013',
        studentName: 'Rajesh Kannan',
        phone: '+91 98450 33445',
        email: 'rajesh.k@gmail.com',
        coursePreference: 'B.Tech AI',
        source: 'Phone',
        status: 'LOST',
        priority: 'LOW',
        counsellor: counsellorRohan,
        city: 'Chennai',
        previousEducation: '12th Tamil Nadu Board',
        percentage: '94.0%',
        createdDaysAgo: 20,
        notes: 'Secured seat in NIT Trichy.',
        lostReason: 'Enrolled in Competitor',
        lostNotes: 'Student got admission in National Institute of Technology Trichy.',
      },
      {
        leadId: 'LED-2026-1014',
        studentName: 'Tanvi Shah',
        phone: '+91 98450 44556',
        email: 'tanvi.shah@gmail.com',
        coursePreference: 'BBA',
        source: 'Campaign',
        status: 'INTERESTED',
        priority: 'HIGH',
        counsellor: counsellorPriya,
        city: 'Surat',
        previousEducation: '12th CBSE Commerce',
        percentage: '85.2%',
        createdDaysAgo: 5,
        notes: 'Instagram Ad lead. Interested in International Business specialization.',
      },
      {
        leadId: 'LED-2026-1015',
        studentName: 'Gaurav Tiwari',
        phone: '+91 98450 55667',
        email: 'gaurav.t@gmail.com',
        coursePreference: 'MCA',
        source: 'Website',
        status: 'CONVERTED',
        priority: 'HIGH',
        counsellor: counsellorNeha,
        city: 'Lucknow',
        previousEducation: 'BCA (Grade A)',
        percentage: '80.5%',
        createdDaysAgo: 12,
        notes: 'Admitted with merit scholarship.',
        conversionDetails: {
          admissionId: 'ADM-2026-MCA-042',
          feePaid: 60000,
          receiptNumber: 'REC-2026-4430',
          enrolledAt: daysAgo(1),
          remarks: 'Verified degree certificates and migration certificate.',
        },
      },
    ];

    for (const item of rawLeads) {
      const createdDate = daysAgo(item.createdDaysAgo);
      const lead = await Lead.create({
        leadId: item.leadId,
        studentName: item.studentName,
        phone: item.phone,
        email: item.email,
        coursePreference: item.coursePreference,
        source: item.source,
        status: item.status,
        priority: item.priority,
        assignedCounsellor: item.counsellor ? item.counsellor._id : null,
        city: item.city,
        previousEducation: item.previousEducation,
        percentage: item.percentage,
        notes: item.notes,
        conversionDetails: item.conversionDetails || undefined,
        lostReason: item.lostReason || undefined,
        lostNotes: item.lostNotes || undefined,
        lostAt: item.status === 'LOST' ? daysAgo(item.createdDaysAgo - 2) : undefined,
        createdAt: createdDate,
        updatedAt: daysAgo(Math.max(0, item.createdDaysAgo - 1)),
        lastContactDate: daysAgo(Math.max(0, item.createdDaysAgo - 2)),
      });

      // Activity 1: Lead Created
      await Activity.create({
        leadId: lead._id,
        userId: adminUser._id,
        action: 'LEAD_CREATED',
        description: `Lead created from source '${item.source}'`,
        createdAt: createdDate,
      });

      // Activity 2: Counsellor Assigned
      if (item.counsellor) {
        await Activity.create({
          leadId: lead._id,
          userId: managerUser._id,
          action: 'COUNSELLOR_ASSIGNED',
          description: `Assigned to counsellor ${item.counsellor.name}`,
          createdAt: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000),
        });
      }

      // Create Follow-up for active/interested leads
      if (item.status === 'FOLLOW_UP' || item.status === 'INTERESTED' || item.leadId === 'LED-2026-1001') {
        // Completed past follow-up
        await Followup.create({
          leadId: lead._id,
          counsellorId: item.counsellor ? item.counsellor._id : counsellorPriya._id,
          scheduledDate: daysAgo(1),
          scheduledTime: '11:30 AM',
          type: 'Phone Call',
          status: 'COMPLETED',
          notes: 'Explained course curriculum and fee structure.',
          nextAction: 'Send brochure and hostel fee sheet via WhatsApp.',
          completedAt: daysAgo(1),
          completionOutcome: 'Positive - Likely to Apply',
        });

        // Pending or Overdue follow-up
        const isOverdue = item.leadId === 'LED-2026-1008';
        const followDate = isOverdue ? daysAgo(2) : daysAhead(1);

        await Followup.create({
          leadId: lead._id,
          counsellorId: item.counsellor ? item.counsellor._id : counsellorPriya._id,
          scheduledDate: followDate,
          scheduledTime: '02:30 PM',
          type: isOverdue ? 'Phone Call' : 'WhatsApp',
          status: 'PENDING',
          notes: isOverdue
            ? 'Follow-up on JEE rank status.'
            : 'Confirm parents visit time for campus tour on Saturday.',
          nextAction: isOverdue ? 'Call student and check counseling round' : 'Coordinate with campus hospitality desk',
        });

        lead.nextFollowupDate = followDate;
        await lead.save();
      }

      // If converted, log activity
      if (item.status === 'CONVERTED') {
        await Activity.create({
          leadId: lead._id,
          userId: item.counsellor ? item.counsellor._id : adminUser._id,
          action: 'LEAD_CONVERTED',
          description: `Student officially enrolled! Admission ID: ${item.conversionDetails.admissionId}, Fee Paid: ₹${item.conversionDetails.feePaid}`,
          createdAt: daysAgo(2),
        });
      }
    }

    console.log('[Seed] Demo data seeding completed successfully! Total leads:', rawLeads.length);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
  }
};
