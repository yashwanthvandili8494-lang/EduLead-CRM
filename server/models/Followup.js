import mongoose from 'mongoose';

const followupSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
      index: true,
    },
    counsellorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Counsellor ID is required'],
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Follow-up date is required'],
      index: true,
    },
    scheduledTime: {
      type: String,
      default: '11:00 AM',
    },
    type: {
      type: String,
      enum: ['Phone Call', 'WhatsApp', 'Campus Visit', 'Email', 'Video Call', 'In-Person'],
      default: 'Phone Call',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    nextAction: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    completionOutcome: {
      type: String,
      enum: [
        'Positive - Likely to Apply',
        'Information Shared - Will Review',
        'Fee Structure Sent',
        'Campus Visit Scheduled',
        'Follow-up Rescheduled',
        'Did Not Answer / Busy',
        'Not Interested / Dropped',
        'Other',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to detect if pending follow-up is overdue
followupSchema.methods.isOverdue = function () {
  if (this.status !== 'PENDING') return false;
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);
  return scheduled < now && scheduled.toDateString() !== now.toDateString();
};

export default mongoose.model('Followup', followupSchema);
