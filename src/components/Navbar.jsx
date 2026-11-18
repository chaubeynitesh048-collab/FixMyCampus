import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Search,
  Users,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  Zap,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { currentUser, logout, loginAsDemo } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Report Issue', path: '/report', highlight: true },
    { name: 'Track Complaints', path: '/track' },
    { name: 'Public Board', path: '/board' },
    { name: 'Staff Portal', path: '/staff' },
    { name: 'Analytics', path: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  FixMy<span className="text-emerald-600 dark:text-emerald-400">Campus</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Civic AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Campus Problem & Resolution Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Demo Switcher Button / Indicator */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                title="Switch Demo Role for testing"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[110px]">
                  {currentUser?.role === 'staff'
                    ? currentUser?.department || 'Staff'
                    : 'Student'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs animate-in fade-in"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => loginAsDemo('student')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>🎓 Student (Aarav)</span>
                    {currentUser?.role === 'student' && <span className="text-emerald-500 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => loginAsDemo('warden')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>🏠 Hostel Warden</span>
                    {currentUser?.department === 'Warden' && <span className="text-emerald-500 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => loginAsDemo('electrician')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>⚡ Electrician</span>
                    {currentUser?.department === 'Electrician' && <span className="text-emerald-500 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => loginAsDemo('plumber')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>💧 Plumber</span>
                    {currentUser?.department === 'Plumber' && <span className="text-emerald-500 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => loginAsDemo('maintenanceHead')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>🛠️ Maintenance Head</span>
                    {currentUser?.department === 'Maintenance Head' && <span className="text-emerald-500 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => loginAsDemo('principalOffice')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
                  >
                    <span>🏛️ Principal Office</span>
                    {currentUser?.department === 'Principal Office' && <span className="text-emerald-500 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <Link
                  to="/auth"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                  title={`${currentUser.displayName} (${currentUser.role})`}
                >
                  <img
                    src={
                      currentUser.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        currentUser.displayName || 'User'
                      )}&background=059669&color=fff`
                    }
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {currentUser.displayName?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize leading-tight">
                      {currentUser.role === 'staff' ? currentUser.department : 'Student'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-150">
          <div className="flex items-center gap-2 p-2 mb-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Active Role: {currentUser?.displayName} ({currentUser?.role === 'staff' ? currentUser?.department : 'Student'})
            </span>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{link.name}</span>
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Role Switch (Demo)
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  loginAsDemo('student');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-left font-medium"
              >
                🎓 Student
              </button>
              <button
                onClick={() => {
                  loginAsDemo('warden');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-left font-medium"
              >
                🏠 Warden
              </button>
              <button
                onClick={() => {
                  loginAsDemo('electrician');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-left font-medium"
              >
                ⚡ Electrician
              </button>
              <button
                onClick={() => {
                  loginAsDemo('maintenanceHead');
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-left font-medium"
              >
                🛠️ Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
