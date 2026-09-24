import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  CalendarCheck,
  UserCheck,
  BarChart3,
  Sliders,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/followups?filter=overdue&limit=1');
        if (res.data.success && res.data.stats) {
          setOverdueCount(res.data.stats.overdue || 0);
        }
      } catch (err) {
        // Silently skip
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/leads',
      label: 'Admission Leads',
      icon: Users2,
    },
    {
      to: '/followups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      to: '/counsellors',
      label: 'Counsellor Team',
      icon: UserCheck,
    },
    {
      to: '/reports',
      label: 'Reports & Insights',
      icon: BarChart3,
    },
    {
      to: '/settings',
      label: 'Settings & Rules',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px] shadow-2xs">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50/50 border border-indigo-100 text-xs text-slate-600">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            EduLead v1.0 Production
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Active Mode: <span className="font-semibold text-indigo-700">{user?.role}</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Assignment 5 Walk-in Drive Brief
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
