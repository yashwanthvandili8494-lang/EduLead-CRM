import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertTriangle, CheckCircle, Phone, Mail, Sparkles } from 'lucide-react';
import api from '../api/client';

export const NewLeadModal = ({ isOpen, onClose, onLeadCreated, counsellors = [] }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    coursePreference: 'BCA',
    source: 'Website',
    priority: 'MEDIUM',
    assignedCounsellor: '',
    city: '',
    previousEducation: '',
    percentage: '',
    notes: '',
  });

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Live duplicate checking on phone or email change (debounced)
  useEffect(() => {
    const checkDup = async () => {
      if (formData.phone.length >= 10 || formData.email.includes('@')) {
        setIsCheckingDuplicate(true);
        try {
          const res = await api.post('/leads/check-duplicate', {
            phone: formData.phone,
            email: formData.email,
          });
          if (res.data.hasDuplicates) {
            setDuplicateWarning(res.data.matches);
          } else {
            setDuplicateWarning(null);
          }
        } catch (err) {
          console.warn('Duplicate check error:', err);
        } finally {
          setIsCheckingDuplicate(false);
        }
      } else {
        setDuplicateWarning(null);
      }
    };

    const timer = setTimeout(checkDup, 500);
    return () => clearTimeout(timer);
  }, [formData.phone, formData.email]);

  const handleSubmit = async (e, allowDuplicate = false) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/leads', {
        ...formData,
        allowDuplicate,
      });

      if (res.data.success) {
        onLeadCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      if (err.response?.data?.isDuplicate) {
        setDuplicateWarning(err.response.data.duplicateMatches);
        setError('Duplicate detected: A lead with this phone/email already exists.');
      } else {
        setError(err.response?.data?.message || 'Failed to create lead');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Add New Admission Lead</h3>
              <p className="text-xs text-slate-500">Capture inquiries from Website, WhatsApp, Walk-ins, etc.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 overflow-y-auto grow">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Duplicate Warning Callout */}
          {duplicateWarning && duplicateWarning.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Edge Case Alert: Duplicate Contact Detected!</span>
              </div>
              <p>
                A lead with matching details is already in the system:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                {duplicateWarning.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.lead?.studentName || item.leadId}</strong> ({item.matchType} match) via{' '}
                    <span className="underline">{item.lead?.source || item.source}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold text-[11px] transition-colors"
                >
                  Create Anyway as Linked Secondary Lead
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98450 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Preference <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.coursePreference}
                onChange={(e) => setFormData({ ...formData, coursePreference: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="B.Tech CSE">B.Tech (Computer Science & Engg)</option>
                <option value="B.Tech AI">B.Tech (Artificial Intelligence)</option>
                <option value="MBA">MBA (Master of Business Admin)</option>
                <option value="BBA">BBA (Bachelor of Business Admin)</option>
                <option value="B.Com">B.Com (Commerce & Finance)</option>
                <option value="Other">Other Specialty Course</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Source <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="Website">🌐 Website</option>
                <option value="WhatsApp">💬 WhatsApp</option>
                <option value="Walk-in">🚶 Walk-in</option>
                <option value="Phone">📞 Phone Call</option>
                <option value="Fair">🎪 Education Fair</option>
                <option value="Campaign">📣 Ad Campaign</option>
                <option value="Other">📌 Other Referral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Counsellor
              </label>
              <select
                value={formData.assignedCounsellor}
                onChange={(e) => setFormData({ ...formData, assignedCounsellor: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="">Leave Unassigned (Pool)</option>
                {counsellors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Qualification</label>
              <input
                type="text"
                placeholder="e.g. 12th CBSE / PUC"
                value={formData.previousEducation}
                onChange={(e) => setFormData({ ...formData, previousEducation: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score / Percentage</label>
              <input
                type="text"
                placeholder="e.g. 85%"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Inquiry Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Student inquired about hostel, scholarship eligibility..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
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
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
