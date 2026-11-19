import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Sparkles,
  MapPin,
  Building,
  AlertTriangle,
  Send,
  CheckCircle,
  HelpCircle,
  Info,
  Shield,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import PhotoUploader from '../components/PhotoUploader';
import { CATEGORIES, LOCATIONS, URGENCIES, DEPARTMENTS } from '../utils/helpers';
import { analyzeComplaintWithAI } from '../utils/geminiAi';
import { uploadComplaintPhoto } from '../firebase/services';

export default function ReportPage() {
  const { createComplaint } = useComplaints();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [roomBlock, setRoomBlock] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [suggestedDepartment, setSuggestedDepartment] = useState('Maintenance Head');
  const [photos, setPhotos] = useState([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Trigger AI Auto-Assist
  const handleAiAutoAssist = async () => {
    if (!description.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        description: 'Please write a brief description first so AI can analyze it.',
      }));
      return;
    }

    setIsAiAnalyzing(true);
    setFormErrors((prev) => ({ ...prev, description: null }));

    try {
      const firstPhoto = photos[0]?.dataUrl || null;
      const result = await analyzeComplaintWithAI(description, firstPhoto);

      if (result) {
        setAiSuggestion(result);
      }
    } catch (e) {
      console.warn('AI analysis error:', e);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Apply AI suggestions to form
  const applyAiSuggestions = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.suggestedTitle && !title.trim()) {
      setTitle(aiSuggestion.suggestedTitle);
    }
    if (aiSuggestion.category) {
      const matchedCat = CATEGORIES.find((c) => c.toLowerCase().includes(aiSuggestion.category.toLowerCase())) || aiSuggestion.category;
      setCategory(matchedCat);
    }
    if (aiSuggestion.urgency) {
      setUrgency(aiSuggestion.urgency);
    }
    if (aiSuggestion.suggestedDepartment) {
      setSuggestedDepartment(aiSuggestion.suggestedDepartment);
    }
    setAiSuggestion(null);
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Please enter a short headline for the problem.';
    if (!description.trim()) errors.description = 'Please describe the problem in detail.';
    if (!roomBlock.trim()) errors.roomBlock = 'Please specify exact room, floor, or block number.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Process photo uploads
      const uploadedUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const photoItem = photos[i];
        const url = await uploadComplaintPhoto(
          photoItem.file,
          photoItem.dataUrl,
          'pending',
          i
        );
        uploadedUrls.push(url);
      }

      // Create complaint record
      const newTicket = createComplaint(
        {
          title,
          description,
          category,
          location,
          roomBlock,
          urgency,
          suggestedDepartment,
          photos: uploadedUrls,
        },
        currentUser
      );

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
        });
      } catch (confettiErr) {
        // Ignore confetti if blocked
      }

      // Direct to visual timeline tracking page
      navigate(`/track/${newTicket.id}`, {
        state: { isNewSubmission: true, complaintId: newTicket.id },
      });
    } catch (err) {
      console.error('Submission error:', err);
      alert('Could not submit complaint. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Student Civic Incident Reporting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Report a Campus Problem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Provide photos and details. Our system routes your complaint directly to the responsible campus department and generates your tracking timeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Camera & Proof Photos */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Photos & Proof (Camera / Gallery)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Up to 3 photos</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            A photo helps technicians bring the right tools (spares, ladders, pipes) on their first visit.
          </p>

          <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxPhotos={3} />
        </div>

        {/* Step 2: Problem Description & AI Auto-Assist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Describe the Problem
              </h2>
            </div>

            {/* AI Auto-Assist Button */}
            <button
              type="button"
              onClick={handleAiAutoAssist}
              disabled={isAiAnalyzing || !description.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Auto-Assist</span>
                </>
              )}
            </button>
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  AI Auto-Assist Recommendation
                </span>
                <button
                  type="button"
                  onClick={applyAiSuggestions}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Apply Recommendations
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] block">Suggested Category:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{aiSuggestion.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Suggested Urgency:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{aiSuggestion.urgency}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Routing To:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{aiSuggestion.suggestedDepartment}</strong>
                </div>
              </div>

              {aiSuggestion.oneLineSummary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 italic">
                  "{aiSuggestion.oneLineSummary}"
                </p>
              )}
            </div>
          )}

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors((p) => ({ ...p, description: null }));
              }}
              placeholder="e.g. Water fountain leaking continuously onto corridor tiles near room 204. Floor is slippery..."
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                formErrors.description
                  ? 'border-rose-400 ring-1 ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {formErrors.description && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Problem Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Issue Headline / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formErrors.title) setFormErrors((p) => ({ ...p, title: null }));
              }}
              placeholder="e.g. Water cooler leaking on 2nd floor"
              maxLength={120}
              className={`w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                formErrors.title
                  ? 'border-rose-400 ring-1 ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {formErrors.title && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {formErrors.title}
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Category, Location & Urgency */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Location, Category & Urgency
            </h2>
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specific Room / Block */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Specific Room, Floor, or Landmark <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomBlock}
                onChange={(e) => {
                  setRoomBlock(e.target.value);
                  if (formErrors.roomBlock) setFormErrors((p) => ({ ...p, roomBlock: null }));
                }}
                placeholder="e.g. Block A, Room 204, 2nd Floor Corridor"
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  formErrors.roomBlock
                    ? 'border-rose-400 ring-1 ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
            {formErrors.roomBlock && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {formErrors.roomBlock}
              </p>
            )}
          </div>

          {/* Urgency Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {URGENCIES.map((u) => {
                const selected = urgency === u.level;
                return (
                  <button
                    key={u.level}
                    type="button"
                    onClick={() => setUrgency(u.level)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {u.label}
                      </span>
                      {selected && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {u.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reporter Info Preview */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Submitting as:</span>
            <span>{currentUser?.displayName || 'Student'}</span>
            <span className="text-slate-400">({currentUser?.email || 'student@campus.edu'})</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Timeline starts immediately
          </span>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Issue...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
