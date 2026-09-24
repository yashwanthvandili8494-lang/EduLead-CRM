import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BulkReassignModal from '../components/BulkReassignModal';
import {
  Users,
  UserCheck,
  Award,
  Phone,
  Mail,
  Shield,
  UserPlus,
  AlertTriangle,
  RotateCw,
  Plus,
} from 'lucide-react';

import { defaultUsers } from '../api/mockData';

export const Counsellors = () => {
  const { user, isManager, isAdmin } = useAuth();
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBulkReassignOpen, setIsBulkReassignOpen] = useState(false);

  // New Counsellor Form Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'COUNSELLOR',
    department: 'UG Admissions',
    specialization: 'BCA, MCA',
  });

  const fetchCounsellors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/counsellors');
      if (res.data?.success && res.data?.data?.length > 0) {
        setCounsellors(res.data.data);
      } else {
        setCounsellors(defaultUsers.filter((u) => u.role === 'COUNSELLOR'));
      }
    } catch (err) {
      console.warn('Backend unavailable, using cloud demo counsellors:', err);
      setCounsellors(defaultUsers.filter((u) => u.role === 'COUNSELLOR'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, [user]);

  const handleToggleStatus = async (counsellor) => {
    const confirmMsg = counsellor.isActive
      ? `Are you sure you want to deactivate ${counsellor.name}? Their active leads can be transferred to another counsellor.`
      : `Reactivate ${counsellor.name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/users/${counsellor._id}/toggle-status`);
      if (res.data.success) {
        if (res.data.activeLeadsToReassign > 0) {
          alert(
            `Notice: ${counsellor.name} has ${res.data.activeLeadsToReassign} active leads. Please use 'Bulk Reassign' to transfer them to another counsellor.`
          );
        }
        fetchCounsellors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newUserData);
      if (res.data.success) {
        setIsAddUserOpen(false);
        setNewUserData({
          name: '',
          email: '',
          phone: '',
          role: 'COUNSELLOR',
          department: 'UG Admissions',
          specialization: 'BCA, MCA',
        });
        fetchCounsellors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Counsellor Team</h1>
          <p className="text-sm text-slate-500 mt-1">
            Workload distribution, conversion rates, and lead allocation management
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isManager && (
            <button
              onClick={() => setIsBulkReassignOpen(true)}
              className="px-4 py-2 border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Reassign Leads
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Counsellor Roster Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-xs">Loading team...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counsellors.map((c) => (
            <div
              key={c._id}
              className={`bg-white rounded-2xl border p-6 shadow-2xs flex flex-col justify-between transition-all ${
                !c.isActive ? 'opacity-60 border-slate-200 bg-slate-50/50' : 'border-slate-200/80 hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-200">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{c.name}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{c.role}</p>
                      <p className="text-[11px] text-slate-400">{c.department}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>

                {/* Workload Metric Chips */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Active Leads</p>
                    <p className="text-lg font-extrabold text-slate-800 mt-0.5">{c.activeLeads || 0}</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold uppercase text-emerald-700">Converted</p>
                    <p className="text-lg font-extrabold text-emerald-800 mt-0.5">{c.convertedLeads || 0}</p>
                  </div>
                  <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-center">
                    <p className="text-[10px] font-bold uppercase text-indigo-700">Win Rate</p>
                    <p className="text-lg font-extrabold text-indigo-800 mt-0.5">{c.conversionRate || 0}%</p>
                  </div>
                </div>

                {/* Specialization tags */}
                {c.specialization && c.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.specialization.map((sp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              {isManager && (
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className={`text-xs font-bold ${
                      c.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                  >
                    {c.isActive ? 'Deactivate Account' : 'Reactivate'}
                  </button>

                  <button
                    onClick={() => setIsBulkReassignOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Transfer Leads →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk Reassign Modal */}
      <BulkReassignModal
        isOpen={isBulkReassignOpen}
        onClose={() => setIsBulkReassignOpen(false)}
        counsellors={counsellors}
        onReassigned={() => fetchCounsellors()}
      />

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg">Add New Counsellor</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanmay Bhat"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="tanmay@edulead.edu"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="COUNSELLOR">Counsellor</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Specialization</label>
                <input
                  type="text"
                  placeholder="BCA, MCA, MBA"
                  value={newUserData.specialization}
                  onChange={(e) => setNewUserData({ ...newUserData, specialization: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Create Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counsellors;
