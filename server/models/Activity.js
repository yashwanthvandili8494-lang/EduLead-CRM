import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LEAD_CREATED',
        'COUNSELLOR_ASSIGNED',
        'COUNSELLOR_REASSIGNED',
        'STATUS_CHANGED',
        'FOLLOWUP_SCHEDULED',
        'FOLLOWUP_COMPLETED',
        'FOLLOWUP_CANCELLED',
        'NOTE_ADDED',
        'LEAD_CONVERTED',
        'LEAD_LOST',
        'LEAD_RECOVERED',
        'DUPLICATE_FLAGGED',
        'LEAD_UPDATED',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model('Activity', activitySchema);
