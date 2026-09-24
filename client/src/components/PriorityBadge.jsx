import React from 'react';

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  URGENT: {
    label: 'Urgent',
    className: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold animate-pulse',
  },
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

export default PriorityBadge;
