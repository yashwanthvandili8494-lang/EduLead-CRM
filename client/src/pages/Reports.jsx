import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Download,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

import { defaultReports } from '../api/mockData';

export const Reports = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeReport, setActiveReport] = useState('source'); // 'source', 'counsellor', 'funnel', 'ageing'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/analytics');
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        } else {
          setData(defaultReports);
        }
      } catch (err) {
        console.warn('Backend unavailable, using cloud demo reports:', err);
        setData(defaultReports);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const {
    sourcePerformance = [],
    counsellorPerformance = [],
    statusDistribution = [],
    ageingReport = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data-driven intelligence on marketing channels, team conversions, and lead ageing
          </p>
        </div>

        {/* 4 Report Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveReport('source')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'source' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Source Performance
          </button>
          <button
            onClick={() => setActiveReport('counsellor')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'counsellor' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Counsellor Performance
          </button>
          <button
            onClick={() => setActiveReport('funnel')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'funnel' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Conversion Funnel
          </button>
          <button
            onClick={() => setActiveReport('ageing')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'ageing' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Ageing Report
          </button>
        </div>
      </div>

      {/* Report 1: Source Performance */}
      {activeReport === 'source' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Channel Conversion Matrix</h3>
            <p className="text-xs text-slate-500">
              Evaluates total leads generated, enrolled admissions, and lost inquiries across each marketing channel
            </p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourcePerformance}>
                  <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="total" name="Total Inquiries" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" name="Converted Students" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lost" name="Lost / Dropped" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Lead Source</th>
                  <th className="py-3.5 px-4">Total Leads</th>
                  <th className="py-3.5 px-4">Converted</th>
                  <th className="py-3.5 px-4">Lost</th>
                  <th className="py-3.5 px-4">In Progress</th>
                  <th className="py-3.5 px-4 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sourcePerformance.map((src) => (
                  <tr key={src.source} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{src.source}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{src.total}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{src.converted}</td>
                    <td className="py-3 px-4 text-rose-500">{src.lost}</td>
                    <td className="py-3 px-4 text-slate-500">{src.inProgress}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-indigo-700">
                      {src.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Counsellor Performance */}
      {activeReport === 'counsellor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Counsellor Efficiency Benchmark</h3>
            <p className="text-xs text-slate-500">
              Assigned leads vs conversions and follow-up completion rates
            </p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counsellorPerformance}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="totalAssigned" name="Assigned Leads" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" name="Enrolled Admissions" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completedFollowups" name="Completed Calls" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Counsellor</th>
                  <th className="py-3.5 px-4">Assigned Leads</th>
                  <th className="py-3.5 px-4">Converted</th>
                  <th className="py-3.5 px-4">Lost</th>
                  <th className="py-3.5 px-4">Pending Follow-ups</th>
                  <th className="py-3.5 px-4 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {counsellorPerformance.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{c.totalAssigned}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{c.converted}</td>
                    <td className="py-3 px-4 text-rose-500">{c.lost}</td>
                    <td className="py-3 px-4 text-amber-600 font-semibold">{c.pendingFollowups}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-indigo-700">
                      {c.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Conversion Funnel */}
      {activeReport === 'funnel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Stage-by-Stage Conversion Funnel</h3>
            <p className="text-xs text-slate-500">
              Pinpoints drop-off points in the admission pipeline from first inquiry to paid enrollment
            </p>

            <div className="space-y-3 pt-4 max-w-2xl mx-auto">
              {statusDistribution.map((item, idx) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{item.status.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500">
                      {item.count} leads ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-7 rounded-xl overflow-hidden p-1 border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-end pr-2 text-[10px] text-white font-bold transition-all duration-500"
                      style={{
                        width: `${Math.max(12, item.percentage)}%`,
                      }}
                    >
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report 4: Ageing Report */}
      {activeReport === 'ageing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Unresolved Leads Ageing Report</h3>
                <p className="text-xs text-slate-500">
                  Critical audit view for managers to spot stagnant leads requiring intervention
                </p>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Leads categorized as <strong>Critical</strong> (Age ≥ 15 days or last contacted ≥ 7 days ago) risk falling out of the funnel completely.
              </span>
            </div>
          </div>

          {/* Ageing Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Student & ID</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Counsellor</th>
                  <th className="py-3.5 px-4">Age</th>
                  <th className="py-3.5 px-4">Last Contact</th>
                  <th className="py-3.5 px-4 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {ageingReport.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <Link to={`/leads/${lead._id}`} className="hover:text-indigo-600">
                        {lead.studentName}
                      </Link>
                      <p className="text-[10px] text-slate-400 font-mono">{lead.leadId}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{lead.coursePreference}</td>
                    <td className="py-3 px-4 text-slate-600">{lead.source}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{lead.counsellorName}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{lead.ageDays} days</td>
                    <td className="py-3 px-4 text-slate-500">{lead.lastContactDays}d ago</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          lead.riskCategory === 'Critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : lead.riskCategory === 'Warning'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lead.riskCategory}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
