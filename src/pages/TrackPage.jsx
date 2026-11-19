import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Clock,
  ThumbsUp,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import TrackingTimeline from '../components/TrackingTimeline';
import { formatDate, timeAgo, isEscalated, getEscalationLevel } from '../utils/helpers';

export default function TrackPage() {
  const { complaintId: routeId } = useParams();
  const navigate = useNavigate();
  const { complaints, getComplaintById, upvoteComplaint, confirmResolution, reopenComplaint } = useComplaints();
  const { currentUser } = useAuth();

  const [searchInput, setSearchInput] = useState(routeId || '');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Sync route param with active complaint
  useEffect(() => {
    if (routeId) {
      const found = getComplaintById(routeId);
      setSelectedComplaint(found);
      setSearchInput(routeId);
    } else if (complaints.length > 0) {
      setSelectedComplaint(complaints[0]);
    }
  }, [routeId, complaints]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const clean = searchInput.trim().toUpperCase();
      const found = getComplaintById(clean);
      if (found) {
        setSelectedComplaint(found);
        navigate(`/track/${clean}`);
      } else {
        alert(`No complaint found with ID "${clean}". Check the ID or select one from the recent tickets below.`);
      }
    }
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setSearchInput(complaint.id);
    navigate(`/track/${complaint.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Track Campus Complaint Timeline</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enter any complaint ID to see the complete handling lifecycle, responsible staff, and remarks.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter ID (e.g. FMC-2026-0001)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Quick ID Pills from current dataset */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none text-xs">
          <span className="text-slate-400 shrink-0 font-medium text-[11px]">Quick Switch Ticket:</span>
          {complaints.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectComplaint(c)}
              className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-semibold transition-all shrink-0 border ${
                selectedComplaint?.id === c.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {selectedComplaint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual Tracking Timeline (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {selectedComplaint.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedComplaint.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={selectedComplaint.urgency} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedComplaint.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Location Badge */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {selectedComplaint.location}
                  {selectedComplaint.roomBlock && ` • ${selectedComplaint.roomBlock}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Reported {formatDate(selectedComplaint.createdAt)}
                </span>
              </div>
            </div>

            {/* TRACKING TIMELINE COMPONENT */}
            <TrackingTimeline
              complaint={selectedComplaint}
              onConfirmResolution={confirmResolution}
              onReopen={reopenComplaint}
              currentUser={currentUser}
            />
          </div>

          {/* Right Column: Assigned Staff & Proof Photos */}
          <div className="space-y-6">
            {/* Assigned Staff Ownership Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Staff Ownership & Department
              </h3>

              {selectedComplaint.assignedStaff ? (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <img
                    src={
                      selectedComplaint.assignedStaff.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedComplaint.assignedStaff.name
                      )}&background=0284c7&color=fff`
                    }
                    alt={selectedComplaint.assignedStaff.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedComplaint.assignedStaff.name}
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {selectedComplaint.assignedStaff.role}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Department: {selectedComplaint.assignedDepartment}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Routed to {selectedComplaint.assignedDepartment || 'Maintenance Cell'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Department head is assigning a technician.
                  </p>
                </div>
              )}

              {/* Upvote Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    "Me Too" Campus Upvotes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedComplaint.upvotes || 0} students affected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => upvoteComplaint(selectedComplaint.id, currentUser?.uid)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote</span>
                </button>
              </div>
            </div>

            {/* Evidence Photos Gallery */}
            {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Uploaded Evidence Photos ({selectedComplaint.photos.length})
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  {selectedComplaint.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImg(photo)}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer group relative"
                    >
                      <img
                        src={photo}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className="absolute bottom-2 right-2 p-1 bg-black/60 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reporter Information */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Reported By
              </h3>
              <p>
                <strong>Student:</strong> {selectedComplaint.studentName}
              </p>
              <p>
                <strong>Email:</strong> {selectedComplaint.studentEmail}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedComplaint.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Complaint Selected
          </h3>
          <p className="text-xs text-slate-500">
            Enter a complaint ID above (e.g. FMC-2026-0001) or browse the public board.
          </p>
          <Link
            to="/board"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            Go to Public Board
          </Link>
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
              alt="Enlarged evidence"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
