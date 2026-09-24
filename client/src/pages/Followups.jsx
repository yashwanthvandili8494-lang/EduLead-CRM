import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  CalendarCheck,
  Clock,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  Calendar,
  User,
  Filter,
  ArrowRight,
} from 'lucide-react';

export const Followups = () => {
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [stats, setStats] = useState({ overdue: 0, today: 0, upcoming: 0 });
  const [filter, setFilter] = useState('all'); // 'all', 'overdue', 'today', 'upcoming', 'completed'
  const [loading, setLoading] = useState(true);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'completed') {
        params.append('status', 'COMPLETED');
      } else if (filter !== 'all') {
        params.append('filter', filter);
      }

      const res = await api.get(`/followups?${params.toString()}`);
      if (res.data.success) {
        setFollowups(res.data.data);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load followups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [filter, user]);

  const handleComplete = async (id) => {
    const outcome = prompt(
      'Enter completion outcome:',
      'Positive - Student requested application link'
    );
    if (!outcome) return;

    const nextAction = prompt('Enter next action (if any):', 'Follow-up after application review');

    try {
      const res = await api.patch(`/followups/${id}/complete`, {
        completionOutcome: 'Positive - Likely to Apply',
        notes: outcome,
        nextAction,
      });

      if (res.data.success) {
        fetchFollowups();
      }
    } catch (err) {
      alert('Failed to complete follow-up');
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'Campus Visit':
      case 'In-Person':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'Email':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Phone className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Follow-up Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student interactions, schedule reminders, and eliminate overdue calls
          </p>
        </div>

        {/* Overdue Badge */}
        {stats.overdue > 0 && (
          <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{stats.overdue} Stagnant / Overdue Follow-ups Require Action</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Scheduled
        </button>

        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Overdue ({stats.overdue})
        </button>

        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'today'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Today's Calls ({stats.today})
        </button>

        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming ({stats.upcoming})
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed History
        </button>
      </div>

      {/* Follow-up Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-xs">Loading follow-ups...</p>
        </div>
      ) : followups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center text-slate-400 space-y-2">
          <CalendarCheck className="w-12 h-12 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">No follow-ups found in this view</p>
          <p className="text-xs text-slate-400">All student inquiries in this section are up-to-date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followups.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const scheduledDate = new Date(item.scheduledDate);
            const isPast = scheduledDate < new Date() && !isCompleted;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isPast
                    ? 'border-rose-300 bg-rose-50/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                        {getChannelIcon(item.type)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{item.type}</span>
                        <p className="text-[11px] text-slate-400">
                          {scheduledDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          • {item.scheduledTime}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isPast
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {isPast ? 'Overdue' : item.status}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      to={`/leads/${item.leadId?._id}`}
                      className="font-bold text-slate-800 text-sm hover:text-indigo-600 block"
                    >
                      {item.leadId?.studentName || 'Student Lead'}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">
                        {item.leadId?.coursePreference}
                      </span>
                      <span>•</span>
                      <a href={`tel:${item.leadId?.phone}`} className="hover:text-indigo-600">
                        {item.leadId?.phone}
                      </a>
                    </div>
                  </div>

                  {/* Discussion Notes */}
                  {item.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <p className="line-clamp-2">{item.notes}</p>
                    </div>
                  )}

                  {/* Next Action */}
                  {item.nextAction && (
                    <div className="text-xs text-indigo-800 font-semibold bg-indigo-50/70 p-2 rounded-lg">
                      Next: {item.nextAction}
                    </div>
                  )}

                  {/* Counsellor */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Counsellor:</span>
                    <span className="font-semibold text-slate-700">
                      {item.counsellorId?.name || 'Assigned Staff'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/leads/${item.leadId?._id}`}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    View Lead <ArrowRight className="w-3 h-3" />
                  </Link>

                  {!isCompleted && (
                    <button
                      onClick={() => handleComplete(item._id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Followups;
