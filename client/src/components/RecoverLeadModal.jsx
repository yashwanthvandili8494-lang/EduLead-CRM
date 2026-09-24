import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const RecoverLeadModal = ({ isOpen, onClose, lead, onRecovered }) => {
  const [recoveryReason, setRecoveryReason] = useState('Student contacted again showing revived interest in the program');
  const [targetStatus, setTargetStatus] = useState('FOLLOW_UP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const res = await api.post(`/leads/${lead._id}/recover`, {
        recoveryReason,
        targetStatus,
      });

      if (res.data.success) {
        onRecovered(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to recover lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Reopen & Recover Lead</h3>
              <p className="text-xs text-amber-900">Student: {lead.studentName} ({lead.leadId})</p>
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
              Reinstate to Stage
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
            >
              <option value="FOLLOW_UP">Follow-up Stage</option>
              <option value="INTERESTED">Interested Stage</option>
              <option value="CONTACTED">Contacted Stage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Recovery / New Context <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={recoveryReason}
              onChange={(e) => setRecoveryReason(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
              className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-semibold shadow-xs disabled:opacity-50"
            >
              {loading ? 'Recovering...' : 'Reopen Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecoverLeadModal;
