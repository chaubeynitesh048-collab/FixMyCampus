import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  ChevronRight,
  Camera,
  UserCheck,
  AlertTriangle,
  Star,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import UrgencyBadge from './UrgencyBadge';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import { timeAgo, isEscalated } from '../utils/helpers';

export default function ComplaintCard({ complaint }) {
  const { upvoteComplaint } = useComplaints();
  const { currentUser } = useAuth();

  const isUserUpvoted =
    currentUser &&
    complaint.upvotedBy &&
    complaint.upvotedBy.includes(currentUser.uid);

  const escalated = isEscalated(complaint);

  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    upvoteComplaint(complaint.id, currentUser?.uid);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top Banner / Details */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {complaint.id}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <UrgencyBadge urgency={complaint.urgency} />
          </div>
        </div>

        {/* Title */}
        <Link to={`/track/${complaint.id}`} className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
            {complaint.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* Photos Preview */}
        {complaint.photos && complaint.photos.length > 0 && (
          <div className="relative mt-3.5 h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <img
              src={complaint.photos[0]}
              alt={complaint.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {complaint.photos.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Camera className="w-3 h-3" />
                +{complaint.photos.length - 1} more
              </span>
            )}
            {complaint.status === 'Resolved' && complaint.afterPhotos && complaint.afterPhotos.length > 0 && (
              <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                Before / After Available
              </span>
            )}
          </div>
        )}

        {/* Location & Room */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate font-medium">{complaint.location}</span>
          {complaint.roomBlock && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="truncate text-slate-400 dark:text-slate-500">{complaint.roomBlock}</span>
            </>
          )}
        </div>

        {/* Assigned Staff or Department */}
        {complaint.assignedStaff ? (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <img
              src={complaint.assignedStaff.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(complaint.assignedStaff.name)}&background=0284c7&color=fff`}
              alt={complaint.assignedStaff.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                {complaint.assignedStaff.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {complaint.assignedStaff.role}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Routed to: <strong className="text-slate-700 dark:text-slate-300">{complaint.assignedDepartment || 'Maintenance Cell'}</strong></span>
          </div>
        )}

        {/* Student Rating if present */}
        {complaint.studentFeedback && (
          <div className="flex items-center gap-1 mt-2 text-amber-500 text-xs font-semibold">
            <div className="flex">
              {[...Array(complaint.studentFeedback.rating || 5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-500 text-[11px]">Verified by student</span>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <StatusBadge status={escalated && complaint.status !== 'Resolved' ? 'Escalated' : complaint.status} />

        <div className="flex items-center gap-2">
          {/* Upvote Button ("Me Too") */}
          <button
            type="button"
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              isUserUpvoted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
            }`}
            title="Upvote: I have this problem too"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUserUpvoted ? 'fill-white' : ''}`} />
            <span>{complaint.upvotes || 0}</span>
          </button>

          {/* Track Link */}
          <Link
            to={`/track/${complaint.id}`}
            className="p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 transition-colors"
            title="View Live Timeline"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
