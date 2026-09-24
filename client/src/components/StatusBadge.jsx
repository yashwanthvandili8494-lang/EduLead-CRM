import React from 'react';

const statusConfig = {
  NEW: {
    label: 'New',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  FOLLOW_UP: {
    label: 'Follow-up',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  INTERESTED: {
    label: 'Interested',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  APPLICATION: {
    label: 'Application',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  CONVERTED: {
    label: 'Converted',
    bg: 'bg-green-100 text-green-800 border-green-300 font-semibold',
    dot: 'bg-green-600',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
