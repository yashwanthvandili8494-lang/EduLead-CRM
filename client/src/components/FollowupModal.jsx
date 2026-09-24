import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const FollowupModal = ({ isOpen, onClose, lead, onFollowupCreated }) => {
  const [formData, setFormData] = useState({
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:00 AM',
    type: 'Phone Call',
    notes: '',
    nextAction: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !lead) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Past date check
    if (formData.scheduledDate < todayStr) {
      setError('Cannot schedule a follow-up in the past. Please choose today or a future date.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/followups', {
        leadId: lead._id,
        ...formData,
      });

      if (res.data.success) {
        onFollowupCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Schedule Follow-up</h3>
            <p className="text-xs text-slate-500">For {lead.studentName} ({lead.leadId})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option>09:30 AM</option>
                <option>10:30 AM</option>
                <option>11:00 AM</option>
                <option>12:00 PM</option>
                <option>02:00 PM</option>
                <option>03:30 PM</option>
                <option>04:30 PM</option>
                <option>06:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Channel / Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="Phone Call">📞 Phone Call</option>
              <option value="WhatsApp">💬 WhatsApp Message</option>
              <option value="Campus Visit">🏫 Campus Visit / In-Person</option>
              <option value="Email">✉️ Email</option>
              <option value="Video Call">🎥 Video Call Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discussion Notes / Talking Points
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Inquired about BCA Cloud specialization, fee concessions..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Action / Objective
            </label>
            <input
              type="text"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              placeholder="e.g. Send syllabus brochure & hostel fee table"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
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
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-xs disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowupModal;
