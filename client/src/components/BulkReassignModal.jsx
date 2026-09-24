import React, { useState } from 'react';
import { X, Users, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export const BulkReassignModal = ({ isOpen, onClose, counsellors = [], onReassigned }) => {
  const [fromCounsellorId, setFromCounsellorId] = useState('');
  const [toCounsellorId, setToCounsellorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!toCounsellorId) {
      setError('Please select a destination counsellor.');
      return;
    }

    if (fromCounsellorId && fromCounsellorId === toCounsellorId) {
      setError('Source and Destination counsellors cannot be the same.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/leads/bulk-reassign', {
        fromCounsellorId: fromCounsellorId || null,
        toCounsellorId,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setTimeout(() => {
          onReassigned();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between bg-indigo-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Bulk Reassign Leads</h3>
              <p className="text-xs text-indigo-700">Rebalance team or cover absent counsellors</p>
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

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Counsellor (Transfer From)
            </label>
            <select
              value={fromCounsellorId}
              onChange={(e) => setFromCounsellorId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="">All Unassigned Leads</option>
              {counsellors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.activeLeads || 0} active leads)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Counsellor (Assign To) <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={toCounsellorId}
              onChange={(e) => setToCounsellorId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="">Select Target Counsellor...</option>
              {counsellors
                .filter((c) => c.isActive && c._id !== fromCounsellorId)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.activeLeads || 0} active leads)
                  </option>
                ))}
            </select>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong>Audit Guarantee:</strong> Every reassigned lead will automatically log an activity audit record identifying who initiated the reassignment.
          </p>

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
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold shadow-xs disabled:opacity-50"
            >
              {loading ? 'Reassigning...' : 'Transfer Leads'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkReassignModal;
