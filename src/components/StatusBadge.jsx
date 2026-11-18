import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Wrench, UserCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size] || 'text-xs font-semibold px-2.5 py-1 gap-1.5';

  const config = {
    'Submitted': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      icon: Clock,
      label: 'Submitted',
    },
    'Received by Dept': {
      bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      icon: UserCheck,
      label: 'Dept Received',
    },
    'Assigned': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
      icon: Wrench,
      label: 'Assigned',
    },
    'In Progress': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: Clock,
      label: 'In Progress',
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: CheckCircle2,
      label: 'Resolved',
    },
    'Escalated': {
      bg: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 animate-pulse',
      icon: AlertTriangle,
      label: 'Escalated (>48h)',
    },
    'Reopened': {
      bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
      icon: ArrowUpRight,
      label: 'Reopened',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: Clock,
    label: status || 'Pending',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
