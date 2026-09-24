import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const ConvertLeadModal = ({ isOpen, onClose, lead, onConverted }) => {
  const [formData, setFormData] = useState({
    admissionId: `ADM-2026-${lead?.coursePreference?.replace(/[^a-zA-Z]/g, '') || 'STU'}-${Math.floor(100 + Math.random() * 900)}`,
    feePaid: 50000,
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    enrolledAt: new Date().toISOString().split('T')[0],
    remarks: 'Document verification completed and seat booked.',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.admissionId.trim()) {
      setError('Official Admission ID / Roll Number is required for enrollment.');
      return;
    }

    if (!formData.feePaid || Number(formData.feePaid) <= 0) {
      setError('A valid initial fee payment amount is mandatory to confirm admission conversion.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`/leads/${lead._id}/status`, {
        status: 'CONVERTED',
        conversionDetails: {
          admissionId: formData.admissionId.trim(),
          feePaid: Number(formData.feePaid),
          receiptNumber: formData.receiptNumber.trim(),
          enrolledAt: formData.enrolledAt,
          remarks: formData.remarks,
        },
      });

      if (res.data.success) {
        onConverted(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete admission conversion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Convert Lead to Student</h3>
              <p className="text-xs text-emerald-800">Enroll {lead.studentName} into {lead.coursePreference}</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission ID / Roll # <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.admissionId}
                onChange={(e) => setFormData({ ...formData, admissionId: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Fee Paid (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                required
                value={formData.feePaid}
                onChange={(e) => setFormData({ ...formData, feePaid: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enrollment Date
              </label>
              <input
                type="date"
                required
                value={formData.enrolledAt}
                onChange={(e) => setFormData({ ...formData, enrolledAt: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
            <span>Course Enrolled:</span>
            <span className="font-bold text-slate-800">{lead.coursePreference}</span>
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
              className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Confirming...' : 'Confirm Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertLeadModal;
