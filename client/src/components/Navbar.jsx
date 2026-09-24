import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Shield, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, demoAccounts, switchDemoUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-indigo-200">
            E
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">EduLead</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              Admissions CRM
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Reviewer 1-Click Role Switcher */}
        {demoAccounts && demoAccounts.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Switch Role:
            </span>
            {demoAccounts.map((acc) => {
              const isSelected = user?.email === acc.email;
              return (
                <button
                  key={acc.id}
                  onClick={() => switchDemoUser(acc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`Switch active user to ${acc.name} (${acc.role})`}
                >
                  {acc.role === 'ADMIN'
                    ? 'Admin'
                    : acc.role === 'MANAGER'
                    ? 'Manager'
                    : acc.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}

        {/* Current User Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
              <div className="flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
              {user.name.charAt(0)}
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
