import React from 'react';
import {
  UserPlus,
  UserCheck,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileEdit,
  GraduationCap,
  Calendar,
} from 'lucide-react';

export const ActivityTimeline = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">No activity recorded yet for this lead.</p>
      </div>
    );
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'LEAD_CREATED':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'COUNSELLOR_ASSIGNED':
      case 'COUNSELLOR_REASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'FOLLOWUP_SCHEDULED':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'FOLLOWUP_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'LEAD_CONVERTED':
        return <GraduationCap className="w-4 h-4 text-green-600" />;
      case 'LEAD_LOST':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'LEAD_RECOVERED':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'STATUS_CHANGED':
      default:
        return <FileEdit className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LEAD_CONVERTED':
        return 'bg-green-50 border-green-200';
      case 'LEAD_LOST':
        return 'bg-rose-50 border-rose-200';
      case 'LEAD_RECOVERED':
        return 'bg-amber-50 border-amber-200';
      case 'FOLLOWUP_COMPLETED':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act) => {
        const dateObj = new Date(act.createdAt);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const formattedTime = dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={act._id} className="relative group">
            {/* Timeline icon dot */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-xs ${getActionColor(
                act.action
              )}`}
            >
              {getActionIcon(act.action)}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800">
                  {act.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formattedDate} • {formattedTime}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{act.description}</p>
              {act.userId && (
                <p className="text-xs text-slate-400 mt-2">
                  Action performed by: <span className="font-medium text-slate-600">{act.userId.name || 'System'}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
