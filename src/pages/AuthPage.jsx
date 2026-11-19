import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { DEPARTMENTS } from '../utils/helpers';

export default function AuthPage() {
  const {
    currentUser,
    loginAsDemo,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    isFirebaseConfigured,
    loading,
    error,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Electrician');
  const [authError, setAuthError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, displayName, role, role === 'staff' ? department : null);
      }
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.');
    }
  };

  const handleQuickDemo = (demoKey) => {
    loginAsDemo(demoKey);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus Portal Authentication
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sign in to report campus problems, track assigned work orders, or manage resolution timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Status Indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Backend Mode:
            </span>
            {isFirebaseConfigured ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Firebase Cloud Connected
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                Local / Demo Mode Active
              </span>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Register (New Account)
            </button>
          </div>

          {/* Error Notice */}
          {(authError || error) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{authError || error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold text-xs shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="px-3 bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
              Or email & password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    I am registering as:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        role === 'student'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('staff')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        role === 'staff'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      🛡️ Staff / Admin
                    </button>
                  </div>
                </div>

                {role === 'staff' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                      Department Assignment
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Campus Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* 1-Click Demo Profiles & Firebase Guide Card */}
        <div className="space-y-6">
          {/* Quick Demo Switcher Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                1-Click Instant Demo Login
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No registration needed for quick testing. Pick a student or staff role to immediately experience role-based capabilities:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    🎓 Student
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Aarav Sharma</p>
                <p className="text-[10px] text-slate-400">Can report & rate issues</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('warden')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    🏠 Hostel Warden
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Dr. R. K. Verma</p>
                <p className="text-[10px] text-slate-400">Review hostel complaints</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('electrician')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    ⚡ Electrician
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Ramesh Sundaram</p>
                <p className="text-[10px] text-slate-400">Update work & after-photos</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('plumber')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    💧 Plumber
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Santosh Kumar</p>
                <p className="text-[10px] text-slate-400">Fix water leakage tickets</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('maintenanceHead')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    🛠️ Maint. Head
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Er. Alok Nath</p>
                <p className="text-[10px] text-slate-400">Tier 2 escalation owner</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('housekeeping')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    🧹 Sanitation
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Sunita Devi</p>
                <p className="text-[10px] text-slate-400">Hygiene & cafeteria</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('itSupport')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    💻 IT Support
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Anil Deshmukh</p>
                <p className="text-[10px] text-slate-400">Lab & Wi-Fi networks</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('libraryIncharge')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    📚 Library
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Mrs. S. Bannerjee</p>
                <p className="text-[10px] text-slate-400">Reading hall facilities</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('principalOffice')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                    🏛️ Principal Office
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">1-Click</span>
                </div>
                <p className="text-[11px] text-slate-500">Prof. S. C. Joshi</p>
                <p className="text-[10px] text-slate-400">Institution-level overseer</p>
              </button>
            </div>
          </div>

          {/* Firebase Guide Card */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/80 space-y-2 text-xs">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Firebase Setup Instructions
            </h4>
            <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              To connect real cloud database & storage, paste your credentials into the <code className="bg-emerald-200/50 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono">.env</code> file:
            </p>
            <div className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto space-y-0.5">
              <p>VITE_FIREBASE_API_KEY=AIzaSy...</p>
              <p>VITE_FIREBASE_AUTH_DOMAIN=fixmycampus.firebaseapp.com</p>
              <p>VITE_FIREBASE_PROJECT_ID=fixmycampus-xxxx</p>
              <p>VITE_FIREBASE_STORAGE_BUCKET=fixmycampus.appspot.com</p>
              <p className="text-slate-500"># AI runs locally — no API key needed</p>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              The app automatically detects config and activates full cloud syncing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
