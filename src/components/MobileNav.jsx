import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Search, Layers, ShieldCheck } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Track', path: '/track', icon: Search },
    { label: 'Report', path: '/report', icon: PlusCircle, isFab: true },
    { label: 'Board', path: '/board', icon: Layers },
    { label: 'Staff', path: '/staff', icon: ShieldCheck },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          if (item.isFab) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative -top-3 flex flex-col items-center"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-900 active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Report
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                active
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
