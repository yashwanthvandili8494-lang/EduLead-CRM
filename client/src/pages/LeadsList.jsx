import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import NewLeadModal from '../components/NewLeadModal';
import BulkReassignModal from '../components/BulkReassignModal';
import {
  Search,
  Filter,
  Download,
  Plus,
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export const LeadsList = () => {
  const { user, isManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);

  // Modals
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isBulkReassignOpen, setIsBulkReassignOpen] = useState(false);

  // Filters from URL searchParams
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'ALL';
  const source = searchParams.get('source') || 'ALL';
  const course = searchParams.get('course') || 'ALL';
  const priority = searchParams.get('priority') || 'ALL';
  const ageing = searchParams.get('ageing') || '';
  const counsellor = searchParams.get('counsellor') || 'ALL';

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'ALL') params.append('status', status);
      if (source !== 'ALL') params.append('source', source);
      if (course !== 'ALL') params.append('course', course);
      if (priority !== 'ALL') params.append('priority', priority);
      if (ageing) params.append('ageing', ageing);
      if (counsellor !== 'ALL') params.append('counsellor', counsellor);

      const res = await api.get(`/leads?${params.toString()}`);
      if (res.data.success) {
        setLeads(res.data.data);
        setTotalLeads(res.data.totalLeads);
      }

      const cRes = await api.get('/users/counsellors');
      if (cRes.data.success) {
        setCounsellors(cRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchParams, user]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const exportCSV = () => {
    if (!leads.length) return;
    const headers = ['Lead ID', 'Student Name', 'Phone', 'Email', 'Course', 'Source', 'Status', 'Priority', 'Counsellor', 'Created Date'];
    const rows = leads.map((l) => [
      l.leadId,
      `"${l.studentName}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.coursePreference}"`,
      `"${l.source}"`,
      l.status,
      l.priority,
      `"${l.assignedCounsellor?.name || 'Unassigned'}"`,
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edulead_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admission Leads</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {leads.length} of {totalLeads} total inquiries in system
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {isManager && (
            <button
              onClick={() => setIsBulkReassignOpen(true)}
              className="px-3.5 py-2 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bulk Reassign</span>
            </button>
          )}

          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-indigo-200 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative grow w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, phone, email, or Lead ID..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Quick Clear */}
          {(search || status !== 'ALL' || source !== 'ALL' || course !== 'ALL' || priority !== 'ALL' || ageing || counsellor !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div>
            <select
              value={status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="INTERESTED">Interested</option>
              <option value="APPLICATION">Application</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div>
            <select
              value={source}
              onChange={(e) => updateFilter('source', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Sources</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Phone">Phone</option>
              <option value="Fair">Education Fair</option>
              <option value="Campaign">Campaign</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <select
              value={course}
              onChange={(e) => updateFilter('course', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Courses</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="B.Tech CSE">B.Tech CSE</option>
              <option value="B.Tech AI">B.Tech AI</option>
              <option value="MBA">MBA</option>
              <option value="BBA">BBA</option>
              <option value="B.Com">B.Com</option>
            </select>
          </div>

          <div>
            <select
              value={priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <select
              value={ageing}
              onChange={(e) => updateFilter('ageing', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-slate-50 text-slate-700"
            >
              <option value="">All Ageing</option>
              <option value="0-2">0–2 days (Fresh)</option>
              <option value="3-7">3–7 days (Active)</option>
              <option value="8-15">8–15 days (At Risk)</option>
              <option value="15+">15+ days (Stagnant)</option>
            </select>
          </div>

          {isManager && (
            <div>
              <select
                value={counsellor}
                onChange={(e) => updateFilter('counsellor', e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 font-medium bg-slate-50 text-slate-700"
              >
                <option value="ALL">All Counsellors</option>
                <option value="unassigned">Unassigned Pool</option>
                {counsellors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-xs">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No leads match the selected criteria</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200/70 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Lead ID & Student</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold">Course & Source</th>
                  <th className="py-3.5 px-4 font-semibold">Counsellor</th>
                  <th className="py-3.5 px-4 font-semibold">Status & Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Ageing</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const ageDays = lead.ageInDays ?? 0;
                  const isStagnant = ageDays >= 15;

                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="font-bold text-slate-800 hover:text-indigo-600 block"
                        >
                          {lead.studentName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-400">{lead.leadId}</span>
                          {lead.duplicateFlag && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Duplicate Alert
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      </td>

                      {/* Course & Source */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {lead.coursePreference}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          via {lead.source}
                        </span>
                      </td>

                      {/* Counsellor */}
                      <td className="py-3.5 px-4 text-xs">
                        {lead.assignedCounsellor ? (
                          <span className="font-medium text-slate-700">
                            {lead.assignedCounsellor.name}
                          </span>
                        ) : (
                          <span className="text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status & Priority */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={lead.status} />
                          <PriorityBadge priority={lead.priority} />
                        </div>
                      </td>

                      {/* Ageing */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isStagnant ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${isStagnant ? 'text-rose-600 font-extrabold' : 'text-slate-700'}`}>
                            {ageDays} {ageDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {ageDays <= 2 ? 'Fresh' : ageDays <= 7 ? 'Active' : ageDays <= 15 ? 'At Risk' : 'Stagnant'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          View 360°
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        counsellors={counsellors}
        onLeadCreated={() => {
          fetchLeads();
        }}
      />

      {/* Bulk Reassign Modal */}
      <BulkReassignModal
        isOpen={isBulkReassignOpen}
        onClose={() => setIsBulkReassignOpen(false)}
        counsellors={counsellors}
        onReassigned={() => {
          fetchLeads();
        }}
      />
    </div>
  );
};

export default LeadsList;
