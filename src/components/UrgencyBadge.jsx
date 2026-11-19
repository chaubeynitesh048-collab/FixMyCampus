import React from 'react';
import { Shield, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

export default function UrgencyBadge({ urgency, showLabel = true }) {
  const config = {
    'Low': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      icon: Shield,
      dot: 'bg-emerald-500',
      label: 'Low Urgency',
    },
    'Medium': {
      bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
      icon: AlertCircle,
      dot: 'bg-sky-500',
      label: 'Medium Urgency',
    },
    'High': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: AlertTriangle,
      dot: 'bg-amber-500',
      label: 'High Urgency',
    },
    'Critical': {
      bg: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 font-bold',
      icon: Flame,
      dot: 'bg-rose-600 animate-ping',
      label: 'Critical',
    },
  }[urgency] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: AlertCircle,
    dot: 'bg-slate-400',
    label: urgency || 'Normal',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${config.bg}`}
      title={`Urgency: ${urgency}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
