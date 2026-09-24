import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    coursePreference: {
      type: String,
      required: [true, 'Course preference is required'],
      enum: ['BCA', 'MCA', 'B.Tech CSE', 'B.Tech AI', 'MBA', 'BBA', 'B.Com', 'M.Tech', 'Diploma CS', 'Other'],
      default: 'BCA',
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: ['Website', 'Walk-in', 'Phone', 'WhatsApp', 'Fair', 'Campaign', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'APPLICATION', 'CONVERTED', 'LOST'],
      default: 'NEW',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    assignedCounsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    expectedAdmissionDate: {
      type: Date,
    },
    lastContactDate: {
      type: Date,
      default: Date.now,
    },
    nextFollowupDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    previousEducation: {
      type: String,
      default: '',
    },
    percentage: {
      type: String,
      default: '',
    },
    // Conversion details (Mandatory when status becomes CONVERTED)
    conversionDetails: {
      admissionId: { type: String, trim: true },
      feePaid: { type: Number, min: 0 },
      receiptNumber: { type: String, trim: true },
      enrolledAt: { type: Date },
      remarks: { type: String },
    },
    // Lost details (Mandatory when status becomes LOST)
    lostReason: {
      type: String,
      enum: [
        'Enrolled in Competitor',
        'Budget / High Fee Structure',
        'Course Unavailable',
        'Relocated / Distance',
        'Not Interested Anymore',
        'Unreachable / Disconnected',
        'Eligibility Criteria Unmet',
        'Other',
      ],
    },
    lostNotes: {
      type: String,
    },
    lostAt: {
      type: Date,
    },
    // Recovery history if marked lost accidentally
    recoveryHistory: [
      {
        recoveredAt: { type: Date, default: Date.now },
        recoveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
      },
    ],
    // Edge case flags
    duplicateFlag: {
      type: Boolean,
      default: false,
    },
    duplicateMatches: [
      {
        leadId: String,
        matchType: String, // 'PHONE' or 'EMAIL'
        source: String,
      },
    ],
    isStagnant: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true, // Prevents concurrent overwrite conflicts
  }
);

// Virtual for dynamic age in days
leadSchema.virtual('ageInDays').get(function () {
  const diffTime = Math.abs(Date.now() - new Date(this.createdAt).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days since last contact
leadSchema.virtual('daysSinceLastContact').get(function () {
  if (!this.lastContactDate) return 0;
  const diffTime = Math.abs(Date.now() - new Date(this.lastContactDate).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

export default mongoose.model('Lead', leadSchema);
