import React, { useState, useMemo } from 'react';
import {
  Layers,
  Filter,
  Search,
  ArrowUpDown,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import ComplaintCard from '../components/ComplaintCard';
import { CATEGORIES, LOCATIONS, STATUSES } from '../utils/helpers';

export default function PublicBoardPage() {
  const { complaints } = useComplaints();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes', 'recent', 'urgency'

  // Filter and Sort complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title?.toLowerCase().includes(q);
          const matchDesc = c.description?.toLowerCase().includes(q);
          const matchId = c.id?.toLowerCase().includes(q);
          const matchLoc = c.location?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchId && !matchLoc) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && c.category !== selectedCategory) {
          return false;
        }

        // Location filter
        if (selectedLocation !== 'All' && c.location !== selectedLocation) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'All' && c.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          return (b.upvotes || 0) - (a.upvotes || 0);
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'urgency') {
          const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (weights[b.urgency] || 0) - (weights[a.urgency] || 0);
        }
        return 0;
      });
  }, [complaints, searchQuery, selectedCategory, selectedLocation, selectedStatus, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Community "Me Too" Issues Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Public Campus Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See active campus problems. Upvote ("Me Too") issues you are facing so priority tickets rise to the top!
          </p>
        </div>

        {/* Quick Sorting Toggle */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setSortBy('upvotes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              sortBy === 'upvotes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Most Upvoted
          </button>

          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              sortBy === 'recent'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Latest
          </button>

          <button
            onClick={() => setSortBy('urgency')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              sortBy === 'urgency'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Urgency
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword, room, or ID..."
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong>{filteredComplaints.length}</strong> of {complaints.length} issues
          </span>

          {(selectedCategory !== 'All' || selectedLocation !== 'All' || selectedStatus !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocation('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Issues Matched Filters
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or selecting "All Categories".
          </p>
        </div>
      )}
    </div>
  );
}
