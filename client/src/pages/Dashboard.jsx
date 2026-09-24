import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import NewLeadModal from '../components/NewLeadModal';
import { defaultDashboard, defaultUsers } from '../api/mockData';
import {
  Users,
  UserPlus,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setData(defaultDashboard);
      }

      const cRes = await api.get('/users/counsellors');
      if (cRes.data?.success) {
        setCounsellors(cRes.data.data);
      } else {
        setCounsellors(defaultUsers);
      }
    } catch (err) {
      console.warn('[Dashboard] Using cloud demo dataset fallback:', err.message);
      setData(defaultDashboard);
      setCounsellors(defaultUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const rawData = data || defaultDashboard;
  const metrics = rawData.metrics || {};
  const pipeline = Array.isArray(rawData.pipeline) ? rawData.pipeline : [];
  const sources = Array.isArray(rawData.sources) ? rawData.sources : [];
  const ageing = Array.isArray(rawData.ageing) ? rawData.ageing : [];
  const recentLeads = Array.isArray(rawData.recentLeads) ? rawData.recentLeads : [];

  const pipelineColors = {
    NEW: '#3b82f6',
    CONTACTED: '#6366f1',
    FOLLOW_UP: '#8b5cf6',
    INTERESTED: '#f59e0b',
    APPLICATION: '#10b981',
    CONVERTED: '#059669',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role} View
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Institutional Admission Funnel & Real-time Operations Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
          <Link
            to="/leads"
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all"
          >
            View All Leads
          </Link>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Leads"
          value={metrics?.totalLeads}
          icon={Users}
          color="brand"
          onClick={() => navigate('/leads')}
        />
        <MetricCard
          title="New Leads"
          value={metrics?.newLeads}
          icon={UserPlus}
          color="blue"
          onClick={() => navigate('/leads?status=NEW')}
        />
        <MetricCard
          title="Follow-ups"
          value={metrics?.followups}
          icon={CalendarCheck}
          color="purple"
          onClick={() => navigate('/followups')}
        />
        <MetricCard
          title="Converted"
          value={metrics?.converted}
          subtitle={`${metrics?.conversionRate}% rate`}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/leads?status=CONVERTED')}
        />
        <MetricCard
          title="Lost"
          value={metrics?.lost}
          icon={XCircle}
          color="rose"
          onClick={() => navigate('/leads?status=LOST')}
        />
        <MetricCard
          title="Overdue"
          value={metrics?.overdue}
          subtitle="Action needed"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/followups?filter=overdue')}
        />
      </div>

      {/* Main Grid: Pipeline Funnel + Ageing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline Funnel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Admission Pipeline Funnel</h3>
              <p className="text-xs text-slate-500">Stage-by-stage student journey progression</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {pipeline.map((item, idx) => {
              const prevCount = idx === 0 ? item.count : pipeline[idx - 1].count;
              const conversion = prevCount > 0 ? Math.round((item.count / prevCount) * 100) : 100;
              return (
                <div
                  key={item.stage}
                  onClick={() => navigate(`/leads?status=${item.stage}`)}
                  className="bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-200/70 hover:border-indigo-300 rounded-xl p-3.5 transition-all cursor-pointer group text-center"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    {item.stage.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{item.count}</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, (item.count / (metrics?.totalLeads || 1)) * 100))}%`,
                        backgroundColor: pipelineColors[item.stage] || '#4f46e5',
                      }}
                    ></div>
                  </div>
                  {idx > 0 && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {conversion}% step-thru
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Graphical representation */}
          <div className="h-44 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} Leads`, 'Volume']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pipeline.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pipelineColors[entry.stage] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ageing Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Lead Ageing Breakdown</h3>
              <p className="text-xs text-slate-500">Days unresolved in active pipeline</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {ageing.map((item) => (
              <div
                key={item.range}
                onClick={() => {
                  const queryParam = item.range.includes('0–2')
                    ? '0-2'
                    : item.range.includes('3–7')
                    ? '3-7'
                    : item.range.includes('8–15')
                    ? '8-15'
                    : '15+';
                  navigate(`/leads?ageing=${queryParam}`);
                }}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{item.range}</span>
                    <span className="text-xs text-slate-400 ml-2">({item.label})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{item.count} leads</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Manager Insight:</strong> Leads in the 15+ days category require urgent contact or should be reassigned to prevent lead decay.
            </span>
          </div>
        </div>
      </div>

      {/* Second Row: Lead Sources + Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Inquiry Sources</h3>
              <p className="text-xs text-slate-500">Distribution across channels</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {sources.map((src) => (
              <div
                key={src.source}
                onClick={() => navigate(`/leads?source=${src.source}`)}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {src.source}
                  </span>
                  <span className="text-slate-500">
                    {src.total} leads ({src.converted} converted • {src.conversionRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full group-hover:bg-indigo-600 transition-all"
                    style={{
                      width: `${Math.min(100, (src.total / (metrics?.totalLeads || 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Recent Leads & Inquiries</h3>
              <p className="text-xs text-slate-500">Latest students entering the admissions pipeline</p>
            </div>
            <Link
              to="/leads"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Full Table <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Course</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Counsellor</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="font-bold text-slate-800 hover:text-indigo-600"
                      >
                        {lead.studentName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono">{lead.leadId}</p>
                    </td>
                    <td className="py-3 text-xs font-semibold text-slate-700">
                      {lead.coursePreference}
                    </td>
                    <td className="py-3 text-xs text-slate-600">{lead.source}</td>
                    <td className="py-3 text-xs text-slate-600">
                      {lead.assignedCounsellor ? (
                        lead.assignedCounsellor.name
                      ) : (
                        <span className="text-rose-500 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        counsellors={Array.isArray(counsellors) ? counsellors : []}
        onLeadCreated={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default Dashboard;
