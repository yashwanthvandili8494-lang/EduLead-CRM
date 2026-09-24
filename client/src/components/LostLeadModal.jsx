import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const LostLeadModal = ({ isOpen, onClose, lead, onLost }) => {
  const [lostReason, setLostReason] = useState('Enrolled in Competitor');
  const [lostNotes, setLostNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!lostReason) {
      setError('Please select a reason for marking this lead as lost.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`/leads/${lead._id}/status`, {
        status: 'LOST',
        lostReason,
        lostNotes,
      });

      if (res.data.success) {
        onLost(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark lead as lost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-600 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Mark Lead as Lost</h3>
              <p className="text-xs text-rose-700">Student: {lead.studentName} ({lead.leadId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Reason for Dropping Out <span className="text-rose-500">*</span>
            </label>
            <select
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              <option value="Enrolled in Competitor">Enrolled in Competitor Institution</option>
              <option value="Budget / High Fee Structure">Budget / High Fee Structure</option>
              <option value="Course Unavailable">Desired Specialization / Course Unavailable</option>
              <option value="Relocated / Distance">Location / Travel Distance Too High</option>
              <option value="Not Interested Anymore">Student Decided to Take a Drop Year / Job</option>
              <option value="Unreachable / Disconnected">Unreachable / Invalid Contact Numbers</option>
              <option value="Eligibility Criteria Unmet">Did Not Meet 12th / Cut-off Percentage</option>
              <option value="Other">Other / Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Feedback / Notes
            </label>
            <textarea
              rows={3}
              value={lostNotes}
              onChange={(e) => setLostNotes(e.target.value)}
              placeholder="e.g. Student took admission in State University. Requested no further calls."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> If this was marked by mistake or the student re-contacts in the future, you can reopen this lead anytime using the <em>Recover Lead</em> option.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-semibold shadow-xs disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Mark as Lost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostLeadModal;
