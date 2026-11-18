import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import { DEPARTMENTS } from '../utils/helpers';

export default function LandingPage() {
  const { complaints } = useComplaints();
  const { currentUser, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');

  // Calculate live statistics from seed/current complaints
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Received by Dept'
  ).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 92;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim().toUpperCase()}`);
    }
  };

  const steps = [
    {
      num: '01',
      title: 'Snap & Report',
      desc: 'Take up to 3 photos directly via phone camera. Automatic compression saves mobile data.',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      num: '02',
      title: 'Smart Routing',
      desc: 'Automatic routing instantly directs the ticket to the right department (Hostel, Electrician, Plumber, etc.).',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
    },
    {
      num: '03',
      title: 'Track Live Timeline',
      desc: 'Watch the status change step-by-step: Submitted → Received → Assigned → In Progress → Resolved.',
      icon: Clock,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      num: '04',
      title: 'Verified Resolution',
      desc: 'Inspect before/after photos. Confirm with 1-5 star ratings or reopen ticket if not resolved.',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 space-y-6 relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart Campus Civic & Problem Resolution Portal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Fix your campus.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600">
              Track every step.
            </span>{' '}
            Complete transparency.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report broken fans, water leaks, hostel issues, and dirty washrooms in seconds. See exactly which staff member owns your complaint until it is fixed.
          </p>

          {/* Instant ID Lookup Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-lg mx-auto flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/10 transition-all focus-within:border-emerald-500"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Track Complaint ID (e.g. FMC-2026-0001)..."
              className="w-full px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 hover:opacity-90 text-xs font-bold shrink-0 transition-opacity flex items-center gap-1.5"
            >
              Track Now
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Camera className="w-5 h-5" />
              Report an Issue Now
            </Link>

            <Link
              to="/board"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold text-sm shadow-sm transition-all"
            >
              <Users className="w-5 h-5 text-emerald-500" />
              Browse Public Board
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm shadow-sm transition-all"
            >
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Admin Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Live Campus Stats Bar */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Reported</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{totalCount}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Campus-wide</p>
          </div>

          <div className="text-center sm:text-left space-y-1 border-l-0 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Resolution Rate</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{resolutionRate}%</p>
            <p className="text-xs text-slate-500 font-medium">Verified by students</p>
          </div>

          <div className="text-center sm:text-left space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">In Active Progress</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-500">{inProgressCount}</p>
            <p className="text-xs text-slate-500 font-medium">Under staff action</p>
          </div>

          <div className="text-center sm:text-left space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Auto Escalation</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-rose-500">48h</p>
            <p className="text-xs text-slate-500 font-medium">Strict SLA limit</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How FixMyCampus Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Designed for busy college students and responsive campus maintenance teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800">
                    {st.num}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Demo Switcher Section for Instant Testing */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Demo Testing
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Test Any Role Instantly (Student or Staff)
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Experience the dual-sided workflow. Switch to Student to submit and track, or switch to Staff to assign, update remarks, and upload after-photos.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              onClick={() => loginAsDemo('student')}
              className={`p-3 rounded-2xl text-left border transition-all ${
                currentUser?.role === 'student'
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <p className="text-xs font-bold">🎓 Student</p>
              <p className="text-[10px] opacity-80 truncate">Aarav Sharma</p>
            </button>

            <button
              onClick={() => loginAsDemo('warden')}
              className={`p-3 rounded-2xl text-left border transition-all ${
                currentUser?.department === 'Warden'
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <p className="text-xs font-bold">🏠 Warden</p>
              <p className="text-[10px] opacity-80 truncate">Dr. R. K. Verma</p>
            </button>

            <button
              onClick={() => loginAsDemo('electrician')}
              className={`p-3 rounded-2xl text-left border transition-all ${
                currentUser?.department === 'Electrician'
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <p className="text-xs font-bold">⚡ Electrician</p>
              <p className="text-[10px] opacity-80 truncate">Ramesh Sundaram</p>
            </button>

            <button
              onClick={() => loginAsDemo('plumber')}
              className={`p-3 rounded-2xl text-left border transition-all ${
                currentUser?.department === 'Plumber'
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <p className="text-xs font-bold">💧 Plumber</p>
              <p className="text-[10px] opacity-80 truncate">Santosh Kumar</p>
            </button>

            <button
              onClick={() => loginAsDemo('maintenanceHead')}
              className={`p-3 rounded-2xl text-left border transition-all ${
                currentUser?.department === 'Maintenance Head'
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <p className="text-xs font-bold">🛠️ Maint. Head</p>
              <p className="text-[10px] opacity-80 truncate">Er. Alok Nath</p>
            </button>

            <button
              onClick={() => loginAsDemo('principalOffice')}
              className={`p-3 rounded-2xl text-left border transition-all ${
                currentUser?.department === 'Principal Office'
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <p className="text-xs font-bold">🏛️ Principal</p>
              <p className="text-[10px] opacity-80 truncate">Prof. S. C. Joshi</p>
            </button>
          </div>
        </div>
      </section>

      {/* Recent Campus Complaints Preview */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Campus Feed
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recent Issue Reports
            </h2>
          </div>

          <Link
            to="/board"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View All ({complaints.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.slice(0, 6).map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </section>

      {/* Covered Campus Departments */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Connected Campus Departments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complaints are mapped directly to specialized teams for zero-delay handling.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DEPARTMENTS.map((dept) => (
              <div
                key={dept.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center text-center space-y-1.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {dept.id.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {dept.label}
                </h4>
                <span className="text-[10px] text-slate-400">
                  Active SLA: &lt;48 Hours
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
