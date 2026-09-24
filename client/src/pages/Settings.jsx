import React from 'react';
import { Sliders, BookOpen, Share2, Shield, Database, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const courses = [
    { code: 'BCA', name: 'Bachelor of Computer Applications', fee: '₹95,000 / yr', seats: 120 },
    { code: 'MCA', name: 'Master of Computer Applications', fee: '₹1,20,000 / yr', seats: 60 },
    { code: 'B.Tech CSE', name: 'B.Tech Computer Science & Engg', fee: '₹1,85,000 / yr', seats: 180 },
    { code: 'B.Tech AI', name: 'B.Tech Artificial Intelligence', fee: '₹1,95,000 / yr', seats: 60 },
    { code: 'MBA', name: 'Master of Business Administration', fee: '₹2,50,000 / yr', seats: 120 },
    { code: 'BBA', name: 'Bachelor of Business Administration', fee: '₹1,10,000 / yr', seats: 90 },
    { code: 'B.Com', name: 'Bachelor of Commerce & Finance', fee: '₹75,000 / yr', seats: 120 },
  ];

  const sources = [
    { name: 'Website', type: 'Digital Portal', icon: '🌐', autoAssign: true },
    { name: 'WhatsApp', type: 'Direct Messaging', icon: '💬', autoAssign: true },
    { name: 'Walk-in', type: 'Campus Reception', icon: '🚶', autoAssign: false },
    { name: 'Phone', type: 'Inbound Call Center', icon: '📞', autoAssign: true },
    { name: 'Fair', type: 'Education Expos', icon: '🎪', autoAssign: false },
    { name: 'Campaign', type: 'Paid Marketing (Google/Meta)', icon: '📣', autoAssign: true },
    { name: 'Other', type: 'Alumni / Referral', icon: '📌', autoAssign: false },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Institutional Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Admission rules, active courses, lead acquisition channels, and role settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Catalog */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">Configured Academic Programs</h3>
          </div>
          <div className="space-y-2">
            {courses.map((c) => (
              <div
                key={c.code}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{c.code}</span>
                  <p className="text-slate-500 text-[11px]">{c.name}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-indigo-600">{c.fee}</span>
                  <p className="text-slate-400 text-[10px]">{c.seats} Total Seats</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">Active Lead Sources (Brief Spec)</h3>
          </div>
          <div className="space-y-2">
            {sources.map((s) => (
              <div
                key={s.name}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{s.icon}</span>
                  <div>
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <p className="text-slate-500 text-[11px]">{s.type}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {s.autoAssign ? 'Auto Routing' : 'Manual Triage'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Integrity & Database Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">System Engine & Resilience</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-slate-400 text-[10px] font-bold uppercase">Database Adapter</p>
            <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dual-Mode Fallback Active
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-slate-400 text-[10px] font-bold uppercase">Audit Logging</p>
            <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Granular Activity Stream
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-slate-400 text-[10px] font-bold uppercase">Concurrency Protection</p>
            <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Optimistic Locking Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
