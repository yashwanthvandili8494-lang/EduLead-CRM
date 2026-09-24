import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const Login = () => {
  // Pre-filled with working demo credentials out-of-the-box
  const [email, setEmail] = useState('admin@edulead.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoAccounts, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role, defaultEmail) => {
    setSelectedRole(role);
    setEmail(defaultEmail);
    setPassword('Admin@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Fallback if empty
    const submitEmail = email.trim() || 'admin@edulead.edu';
    const submitPassword = password.trim() || 'Admin@123';

    setLoading(true);
    try {
      await login(submitEmail, submitPassword);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid email or password. Please use Admin@123.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoDirectLogin = async (demoAccount) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoUser(demoAccount);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to switch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">EduLead CRM</h1>
          <p className="text-slate-400 text-sm">
            Admission Lead Lifecycle & Counsellor Management System
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-5">
          {/* Quick Role Switcher Pills */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Select User Role to Log In:
            </p>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN', 'admin@edulead.edu')}
                className={`py-1.5 px-2 rounded-lg transition-all ${
                  selectedRole === 'ADMIN'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('MANAGER', 'manager@edulead.edu')}
                className={`py-1.5 px-2 rounded-lg transition-all ${
                  selectedRole === 'MANAGER'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('COUNSELLOR', 'priya@edulead.edu')}
                className={`py-1.5 px-2 rounded-lg transition-all ${
                  selectedRole === 'COUNSELLOR'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Counsellor
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edulead.edu"
                className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all text-slate-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Default: Admin@123
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-medium border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant 1-Click Evaluator Logins */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              ⚡ Or 1-Click Instant Sign In
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              {demoAccounts && demoAccounts.length > 0 ? (
                demoAccounts.slice(0, 4).map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleDemoDirectLogin(acc)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                        {acc.role}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{acc.name}</p>
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit(null)}
                  className="col-span-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs text-center"
                >
                  Sign In with Default Admin
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Edumerge Pre-Drive Product Engineering Assignment • Edumerge Solutions
        </p>
      </div>
    </div>
  );
};

export default Login;
