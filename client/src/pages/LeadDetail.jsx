import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ActivityTimeline from '../components/ActivityTimeline';
import FollowupModal from '../components/FollowupModal';
import ConvertLeadModal from '../components/ConvertLeadModal';
import LostLeadModal from '../components/LostLeadModal';
import RecoverLeadModal from '../components/RecoverLeadModal';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Plus,
  Edit,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

const stages = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'APPLICATION', 'CONVERTED'];

import { defaultLeads, defaultUsers } from '../api/mockData';

export const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();

  const [lead, setLead] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('followups'); // 'overview', 'followups', 'timeline'

  // Modals
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${id}`);
      if (res.data?.success && res.data?.data) {
        setLead(res.data.data);
      } else {
        const found = defaultLeads.find((l) => String(l._id) === String(id) || String(l.id) === String(id) || l.leadId === id) || defaultLeads[0];
        setLead(found);
      }

      if (isManager) {
        try {
          const cRes = await api.get('/users/counsellors');
          if (cRes.data?.success && cRes.data?.data) {
            setCounsellors(cRes.data.data);
          } else {
            setCounsellors(defaultUsers.filter((u) => u.role === 'COUNSELLOR'));
          }
        } catch {
          setCounsellors(defaultUsers.filter((u) => u.role === 'COUNSELLOR'));
        }
      }
    } catch (err) {
      console.warn('Backend offline, using cloud demo lead detail:', err);
      const found = defaultLeads.find((l) => String(l._id) === String(id) || String(l.id) === String(id) || l.leadId === id) || defaultLeads[0];
      setLead(found);
      setCounsellors(defaultUsers.filter((u) => u.role === 'COUNSELLOR'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id, user]);

  const handleStageClick = async (targetStage) => {
    if (targetStage === lead.status) return;

    if (targetStage === 'CONVERTED') {
      setIsConvertOpen(true);
      return;
    }

    try {
      const res = await api.patch(`/leads/${lead._id}/status`, { status: targetStage });
      if (res.data.success) {
        fetchLead();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCounsellorChange = async (e) => {
    const counsellorId = e.target.value;
    try {
      const res = await api.patch(`/leads/${lead._id}/assign`, { counsellorId });
      if (res.data.success) {
        fetchLead();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign counsellor');
    }
  };

  const handleCompleteFollowup = async (followupId) => {
    const outcome = prompt('Enter completion outcome / notes:', 'Positive discussion - likely to apply');
    if (!outcome) return;

    const nextAction = prompt('Enter next action (if any):', 'Send admission form link');

    try {
      const res = await api.patch(`/followups/${followupId}/complete`, {
        completionOutcome: 'Positive - Likely to Apply',
        notes: outcome,
        nextAction,
      });

      if (res.data.success) {
        fetchLead();
      }
    } catch (err) {
      alert('Failed to complete follow-up');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted or Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to display this lead.'}</p>
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
      </div>
    );
  }

  const ageDays = lead.ageInDays ?? 0;
  const isLost = lead.status === 'LOST';
  const isConverted = lead.status === 'CONVERTED';

  return (
    <div className="space-y-6">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Leads
        </Link>

        <div className="flex items-center gap-2">
          {isLost ? (
            <button
              onClick={() => setIsRecoverOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reopen / Recover Lead
            </button>
          ) : isConverted ? (
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Student Successfully Enrolled
            </span>
          ) : (
            <>
              <button
                onClick={() => setIsFollowupOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule Follow-up
              </button>
              <button
                onClick={() => setIsConvertOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Award className="w-3.5 h-3.5" /> Convert to Student
              </button>
              <button
                onClick={() => setIsLostOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
              >
                Mark Lost
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-100 shrink-0">
              {lead.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {lead.studentName}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  {lead.leadId}
                </span>
                <StatusBadge status={lead.status} />
                <PriorityBadge priority={lead.priority} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="font-semibold text-slate-700">Course: {lead.coursePreference}</span>
                <span>•</span>
                <span>Source: <strong className="text-slate-700">{lead.source}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Age: <strong className={ageDays >= 15 ? 'text-rose-600' : 'text-slate-700'}>{ageDays} days</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Counsellor Allocation Badge / Reassign dropdown */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Assigned Counsellor</p>
              {isManager ? (
                <select
                  value={lead.assignedCounsellor?._id || ''}
                  onChange={handleCounsellorChange}
                  className="text-xs font-bold text-slate-800 bg-transparent border-0 border-b border-indigo-400 focus:outline-hidden p-0 mt-0.5 cursor-pointer"
                >
                  <option value="">Unassigned (Pool)</option>
                  {counsellors.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs font-bold text-slate-800">
                  {lead.assignedCounsellor?.name || 'Unassigned Pool'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lead Lifecycle Stepper */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Admissions Stage Progression
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {stages.map((st, index) => {
              const currentIdx = stages.indexOf(lead.status);
              const isPassed = currentIdx >= index && !isLost;
              const isCurrent = lead.status === st;

              return (
                <button
                  key={st}
                  disabled={isLost}
                  onClick={() => handleStageClick(st)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : isPassed
                      ? 'bg-indigo-50/70 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  } disabled:opacity-50`}
                >
                  <span className="block text-[9px] uppercase tracking-wider opacity-75">
                    Step {index + 1}
                  </span>
                  <span className="truncate block mt-0.5">{st.replace(/_/g, ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Edge Case Banner: Lost state info */}
        {isLost && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs">
            <div>
              <p className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                This lead was closed as LOST
              </p>
              <p className="mt-1">
                <strong>Reason:</strong> {lead.lostReason}
              </p>
              {lead.lostNotes && <p className="mt-0.5 text-rose-700">{lead.lostNotes}</p>}
            </div>
            <button
              onClick={() => setIsRecoverOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shrink-0 shadow-xs"
            >
              Recover Lead
            </button>
          </div>
        )}

        {/* Converted Student Details Card */}
        {isConverted && lead.conversionDetails && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-700">Admission ID</p>
              <p className="font-mono font-bold text-sm text-emerald-900 mt-0.5">
                {lead.conversionDetails.admissionId}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-700">Fee Paid</p>
              <p className="font-bold text-sm text-emerald-900 mt-0.5">
                ₹{lead.conversionDetails.feePaid?.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-700">Receipt Number</p>
              <p className="font-mono text-xs text-emerald-900 mt-0.5">
                {lead.conversionDetails.receiptNumber}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-700">Enrolled On</p>
              <p className="font-medium text-xs text-emerald-900 mt-0.5">
                {new Date(lead.conversionDetails.enrolledAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('followups')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'followups'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Follow-ups ({lead.followups?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Activity Audit Timeline ({lead.activities?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Academic Profile
          </button>
        </div>

        {/* Tab 1: Follow-ups */}
        {activeTab === 'followups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Follow-up Log & Agenda</h3>
              <button
                onClick={() => setIsFollowupOpen(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule New Follow-up
              </button>
            </div>

            {(!lead.followups || lead.followups.length === 0) ? (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No follow-ups recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Schedule a call, WhatsApp, or campus visit.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.followups.map((f) => {
                  const isPending = f.status === 'PENDING';
                  const dateStr = new Date(f.scheduledDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={f._id}
                      className={`bg-white rounded-xl p-4 border transition-all ${
                        isPending ? 'border-indigo-200 shadow-xs' : 'border-slate-200/80 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {f.type}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {dateStr} at {f.scheduledTime}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            f.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>

                      {f.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {f.notes}
                        </p>
                      )}

                      {f.nextAction && (
                        <div className="mt-2 text-xs text-indigo-700 font-medium">
                          <strong>Next Action:</strong> {f.nextAction}
                        </div>
                      )}

                      {isPending && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleCompleteFollowup(f._id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Activity Audit Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Complete Lead Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Institutional timeline recording every state change, follow-up, and counsellor assignment
              </p>
            </div>
            <ActivityTimeline activities={lead.activities} />
          </div>
        )}

        {/* Tab 3: Overview & Academic Details */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Student Contact Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Phone Number:</span>
                  <a href={`tel:${lead.phone}`} className="font-bold text-indigo-600 hover:underline">
                    {lead.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Email Address:</span>
                  <a href={`mailto:${lead.email}`} className="font-bold text-indigo-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Location / City:</span>
                  <span className="font-medium text-slate-700">{lead.city || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Lead Source:</span>
                  <span className="font-semibold text-slate-800">{lead.source}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Created At:</span>
                  <span className="text-slate-600">{new Date(lead.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Academic Background & Notes</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Course Preference:</span>
                  <span className="font-bold text-indigo-700">{lead.coursePreference}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Previous Education:</span>
                  <span className="font-medium text-slate-700">{lead.previousEducation || '12th Standard'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Score / Percentage:</span>
                  <span className="font-bold text-slate-800">{lead.percentage || '—'}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Counsellor Notes:</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 font-medium">
                    {lead.notes || 'No general notes entered.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FollowupModal
        isOpen={isFollowupOpen}
        onClose={() => setIsFollowupOpen(false)}
        lead={lead}
        onFollowupCreated={() => fetchLead()}
      />

      <ConvertLeadModal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        lead={lead}
        onConverted={() => fetchLead()}
      />

      <LostLeadModal
        isOpen={isLostOpen}
        onClose={() => setIsLostOpen(false)}
        lead={lead}
        onLost={() => fetchLead()}
      />

      <RecoverLeadModal
        isOpen={isRecoverOpen}
        onClose={() => setIsRecoverOpen(false)}
        lead={lead}
        onRecovered={() => fetchLead()}
      />
    </div>
  );
};

export default LeadDetail;
