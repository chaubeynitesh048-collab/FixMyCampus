import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Eye,
  Star,
  Sparkles,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDate, timeAgo, isEscalated, getEscalationLevel } from '../utils/helpers';
import StatusBadge from './StatusBadge';
import confetti from 'canvas-confetti';

export default function TrackingTimeline({
  complaint,
  onConfirmResolution,
  onReopen,
  currentUser,
}) {
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(true);

  if (!complaint) return null;

  const escalated = isEscalated(complaint);
  const escalationInfo = getEscalationLevel(complaint);

  // Standard 5 Lifecycle Stages
  const stages = [
    { key: 'Submitted', label: '1. Submitted', icon: Send, color: 'text-blue-500' },
    { key: 'Received by Dept', label: '2. Received by Dept', icon: UserCheck, color: 'text-purple-500' },
    { key: 'Assigned', label: '3. Assigned to Staff', icon: Wrench, color: 'text-indigo-500' },
    { key: 'In Progress', label: '4. In Progress', icon: Clock, color: 'text-amber-500' },
    { key: 'Resolved', label: '5. Resolved & Verified', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  // Helper to determine stage state
  const getStageIndex = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Received by Dept': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      case 'Closed': return 4;
      case 'Escalated': return 2;
      case 'Reopened': return 1;
      default: return 0;
    }
  };

  const currentStageIndex = getStageIndex(complaint.status);

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (onConfirmResolution) {
      onConfirmResolution(complaint.id, rating, feedbackComment);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
      } catch (err) {}
    }
  };

  const handleReopenSubmit = (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    if (onReopen) {
      onReopen(complaint.id, reopenReason);
      setShowReopenBox(false);
      setReopenReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Step Progress Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resolution Progress Stages
          </span>
          <StatusBadge status={escalated && complaint.status !== 'Resolved' ? 'Escalated' : complaint.status} />
        </div>

        {/* Progress Stepper for Desktop */}
        <div className="hidden sm:grid grid-cols-5 gap-2 relative">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || complaint.status === 'Resolved';
            const isCurrent = idx === currentStageIndex && complaint.status !== 'Resolved';
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-bold mt-2 ${
                    isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isCurrent
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}

          {/* Background Connecting Line */}
          <div className="absolute top-5 left-10 right-10 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${(Math.min(currentStageIndex, 4) / 4) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Mobile Horizontal Stepper */}
        <div className="sm:hidden flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {currentStageIndex + 1}
            </span>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Stage {currentStageIndex + 1} of 5: {stages[Math.min(currentStageIndex, 4)]?.label}
              </p>
              <p className="text-[11px] text-slate-400">
                Current status: {complaint.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 48-Hour Escalation Warning Notice if active */}
      {escalated && complaint.status !== 'Resolved' && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/60 dark:to-orange-950/60 border-2 border-rose-400 dark:border-rose-800 shadow-md flex items-start gap-3 text-rose-900 dark:text-rose-100">
          <AlertTriangle className="w-6 h-6 text-rose-600 mt-0.5 shrink-0 animate-bounce" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                🚨 Strict 48h SLA Escalation Alert
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                Tier {escalationInfo.level}
              </span>
            </div>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              This issue has been open without resolution for more than 48 hours. It has automatically bypassed standard departmental queue and been prioritized to{' '}
              <strong>{escalationInfo.authority}</strong> for immediate administrative action.
            </p>
          </div>
        </div>
      )}

      {/* Visual Timeline Event Feed */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Event History & Handler Remarks
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {complaint.timeline?.length || 1} Events
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-7 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {complaint.timeline &&
            complaint.timeline.map((event, idx) => {
              let stepIcon = Clock;
              let stepBadge = 'bg-blue-600 text-white';

              if (event.step === 'Submitted') {
                stepIcon = Send;
                stepBadge = 'bg-blue-600 text-white';
              } else if (event.step === 'Received by Dept') {
                stepIcon = UserCheck;
                stepBadge = 'bg-purple-600 text-white';
              } else if (event.step === 'Assigned') {
                stepIcon = Wrench;
                stepBadge = 'bg-indigo-600 text-white';
              } else if (event.step === 'In Progress') {
                stepIcon = Clock;
                stepBadge = 'bg-amber-500 text-white';
              } else if (event.step === 'Resolved') {
                stepIcon = CheckCircle2;
                stepBadge = 'bg-emerald-600 text-white';
              } else if (event.step === 'Escalated') {
                stepIcon = AlertTriangle;
                stepBadge = 'bg-rose-600 text-white';
              } else if (event.step === 'Reopened') {
                stepIcon = ArrowUpRight;
                stepBadge = 'bg-orange-600 text-white';
              } else if (event.step === 'Closed') {
                stepIcon = Check;
                stepBadge = 'bg-teal-600 text-white';
              }

              const Icon = stepIcon;

              return (
                <div key={idx} className="relative group">
                  {/* Step Pin on Line */}
                  <div
                    className={`absolute -left-[30px] sm:-left-[37px] top-0.5 w-8 h-8 rounded-full ${stepBadge} flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Card Content */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-emerald-500/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{event.title}</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatDate(event.timestamp)} ({timeAgo(event.timestamp)})
                      </span>
                    </div>

                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Action by: {event.by}</span>
                    </div>

                    {event.remark && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{event.remark}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Side-by-Side Before vs After Photos */}
        {complaint.afterPhotos && complaint.afterPhotos.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Before & After Verification Gallery
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Before (Reported Condition)
                </span>
                <div
                  onClick={() => setLightboxImg(complaint.photos[0])}
                  className="h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer group relative"
                >
                  <img
                    src={complaint.photos[0]}
                    alt="Before Issue"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 right-2 p-1.5 bg-black/60 rounded-lg text-white">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* After Photo */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  After (Verified Technician Fix)
                </span>
                <div
                  onClick={() => setLightboxImg(complaint.afterPhotos[0])}
                  className="h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/50 cursor-pointer group relative"
                >
                  <img
                    src={complaint.afterPhotos[0]}
                    alt="After Fix"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 right-2 p-1.5 bg-emerald-600 text-white rounded-lg">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {complaint.resolutionNote && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300">
                <strong>Technician Resolution Note:</strong> "{complaint.resolutionNote}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Resolution Confirmation & Rating Card */}
      {complaint.status === 'Resolved' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Student Resolution Review & Sign-Off</span>
            </h4>
            {complaint.studentFeedback?.confirmed && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Verified & Rated
              </span>
            )}
          </div>

          {complaint.studentFeedback ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < complaint.studentFeedback.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {complaint.studentFeedback.rating} / 5 Stars
                </span>
                <span className="text-[11px] text-slate-400">
                  ({formatDate(complaint.studentFeedback.submittedAt)})
                </span>
              </div>
              {complaint.studentFeedback.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  "{complaint.studentFeedback.comment}"
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Campus maintenance marked this issue as resolved. Please review the site and give your feedback:
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {rating} Stars
                  </span>
                </div>
              </div>

              <input
                type="text"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Write a quick comment (e.g. Fixed properly, thanks Ramesh ji!)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                >
                  Confirm Issue Solved
                </button>

                <button
                  type="button"
                  onClick={() => setShowReopenBox(!showReopenBox)}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                >
                  Not Solved? Reopen Ticket
                </button>
              </div>

              {showReopenBox && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-rose-800 dark:text-rose-300">
                    Reason for reopening:
                  </label>
                  <textarea
                    rows={2}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="e.g. Fan is still making squeaking noise after 10 minutes..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-rose-300 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleReopenSubmit}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                  >
                    Submit & Reopen
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Enlarged view"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
