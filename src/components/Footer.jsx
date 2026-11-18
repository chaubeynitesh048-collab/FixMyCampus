import React from 'react';
import { Building2, Phone, ShieldCheck, Heart, ExternalLink, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-10 transition-colors pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                FixMyCampus
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering college students with transparent, AI-assisted civic complaint tracking. Every issue tracked from submission to verified resolution.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-3 h-3 text-amber-500" />
              Smart Campus Civic Initiative
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Portal Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#/report" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Report Campus Problem
                </a>
              </li>
              <li>
                <a href="#/track" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Live Visual Timeline Tracking
                </a>
              </li>
              <li>
                <a href="#/board" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Public Board & "Me Too" Upvotes
                </a>
              </li>
              <li>
                <a href="#/staff" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Staff & Department Action Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Escalations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Campus Emergency Helplines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>Electrical Emergency: <strong className="text-slate-800 dark:text-slate-200">Ext. 2104</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Hostel Warden Desk: <strong className="text-slate-800 dark:text-slate-200">Ext. 1102</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>Plumbing & Leakage: <strong className="text-slate-800 dark:text-slate-200">Ext. 2108</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Campus Medical Unit: <strong className="text-slate-800 dark:text-slate-200">Ext. 1080</strong></span>
              </li>
            </ul>
          </div>

          {/* Department Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Covered Departments
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Warden, Electrician, Plumber, Housekeeping, IT Support, Library In-charge, Maintenance Head, Principal Office.
            </p>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Auto-escalates after 48 hours to senior authorities.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>
            FixMyCampus © 2026. Built with React, Tailwind CSS, Vite & Firebase.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made for college students & campus transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
