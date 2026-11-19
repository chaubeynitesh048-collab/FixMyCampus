import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  UserCheck,
  Camera,
  PlusCircle,
  Upload,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import { DEPARTMENTS, formatDate, timeAgo, isEscalated } from '../utils/helpers';
import PhotoUploader from '../components/PhotoUploader';

export default function StaffPortalPage() {
  const { complaints, updateComplaintStatus } = useComplaints();
  const { currentUser, loginAsDemo } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'resolved'
  const [selectedDeptFilter, setSelectedDeptFilter] = useState(
    currentUser?.department || 'All'
  );

  // Status update modal state
  const [activeModalComplaint, setActiveModalComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remark, setRemark] = useState('');
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter complaints according to department role
  const staffDept = currentUser?.role === 'staff' ? currentUser.department : null;

  const relevantComplaints = complaints.filter((c) => {
    // If filtering by specific department
    if (selectedDeptFilter !== 'All' && c.assignedDepartment !== selectedDeptFilter) {
      return false;
    }

    if (activeTab === 'assigned' && currentUser?.displayName) {
      return c.assignedStaff?.name === currentUser.displayName;
    }
    if (activeTab === 'resolved') {
      return c.status === 'Resolved';
    }
    if (activeTab === 'open') {
      return c.status !== 'Resolved';
    }

    return true;
  });

  const handleOpenStatusModal = (complaint) => {
    setActiveModalComplaint(complaint);
    setNewStatus(complaint.status === 'Submitted' ? 'Received by Dept' : 'In Progress');
    setRemark('');
    setAfterPhotos([]);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeModalComplaint) return;

    setIsUpdating(true);
    try {
      const afterPhotoUrl = afterPhotos[0]?.dataUrl || null;

      updateComplaintStatus(
        activeModalComplaint.id,
        newStatus,
        currentUser || { displayName: 'Staff Member', role: 'staff', department: selectedDeptFilter },
        remark || `Status changed to ${newStatus}`,
        afterPhotoUrl
      );

      setActiveModalComplaint(null);
      alert(`Complaint #${activeModalComplaint.id} updated to "${newStatus}"!`);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Staff & Department Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Maintenance Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Logged in as: <strong className="text-white">{currentUser?.displayName || 'Campus Staff'}</strong> (Role: {currentUser?.department || currentUser?.role || 'Staff'})
          </p>
        </div>

        {/* Quick Role Switcher for Evaluators */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 space-y-1.5 shrink-0">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Switch Staff Department
          </p>
          <div className="flex flex-wrap gap-1.5 max-w-sm">
            <button
              onClick={() => {
                loginAsDemo('electrician');
                setSelectedDeptFilter('Electrician');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              ⚡ Electrician
            </button>
            <button
              onClick={() => {
                loginAsDemo('warden');
                setSelectedDeptFilter('Warden');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              🏠 Warden
            </button>
            <button
              onClick={() => {
                loginAsDemo('plumber');
                setSelectedDeptFilter('Plumber');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              💧 Plumber
            </button>
            <button
              onClick={() => {
                loginAsDemo('housekeeping');
                setSelectedDeptFilter('Housekeeping');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              🧹 Sanitation
            </button>
            <button
              onClick={() => {
                loginAsDemo('itSupport');
                setSelectedDeptFilter('IT Support');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              💻 IT / Wi-Fi
            </button>
            <button
              onClick={() => {
                loginAsDemo('libraryIncharge');
                setSelectedDeptFilter('Library In-charge');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              📚 Library
            </button>
            <button
              onClick={() => {
                loginAsDemo('maintenanceHead');
                setSelectedDeptFilter('Maintenance Head');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              🛠️ Maint. Head
            </button>
            <button
              onClick={() => {
                loginAsDemo('principalOffice');
                setSelectedDeptFilter('Principal Office');
              }}
              className="px-2 py-1 rounded-xl text-[11px] bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              🏛️ Principal
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total in Queue</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {complaints.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Pending Action</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">
            {complaints.filter((c) => c.status !== 'Resolved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Resolved</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {complaints.filter((c) => c.status === 'Resolved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Escalated (&gt;48h)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-500 mt-1">
            {complaints.filter((c) => isEscalated(c)).length}
          </p>
        </div>
      </div>

      {/* Department Filter & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'open', 'resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab} Issues
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Department:</span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Assigned Complaints Queue ({relevantComplaints.length})
          </h2>
          <span className="text-xs text-slate-400">Click any row to take action</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {relevantComplaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No complaints in this department queue.
            </div>
          ) : (
            relevantComplaints.map((c) => {
              const escalated = isEscalated(c);

              return (
                <div
                  key={c.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.id}
                      </span>
                      <StatusBadge status={escalated && c.status !== 'Resolved' ? 'Escalated' : c.status} />
                      <UrgencyBadge urgency={c.urgency} />
                      <span className="text-xs text-slate-400">
                        Dept: <strong className="text-slate-600 dark:text-slate-300">{c.assignedDepartment}</strong>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {c.description}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                      <span>Location: {c.location} ({c.roomBlock || 'N/A'})</span>
                      <span>•</span>
                      <span>By: {c.studentName} ({timeAgo(c.createdAt)})</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenStatusModal(c)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Update Status
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Staff Update Status Modal */}
      {activeModalComplaint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {activeModalComplaint.id}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Update Issue Status & Timeline
                </h3>
              </div>
              <button
                onClick={() => setActiveModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Received by Dept">Received by Dept (Acknowledge)</option>
                  <option value="Assigned">Assigned (Designate Technician)</option>
                  <option value="In Progress">In Progress (Work Underway)</option>
                  <option value="Resolved">Resolved (Complete & Ready for Verification)</option>
                  <option value="Escalated">Escalated (Higher Authority Intervention)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  Technician Remark / Progress Note
                </label>
                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. Procured new 25mm PVC elbow joint from central stores. Repair completed and inspected..."
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              {/* Upload After Photo if marking Resolved */}
              {newStatus === 'Resolved' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Upload "After" Resolution Proof Photo (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Provides photographic evidence to the student that the problem was resolved.
                  </p>
                  <PhotoUploader photos={afterPhotos} onPhotosChange={setAfterPhotos} maxPhotos={1} />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalComplaint(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  {isUpdating ? 'Updating...' : 'Publish Update to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
