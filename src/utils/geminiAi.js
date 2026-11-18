/**
 * geminiAi.js
 * 
 * AI Auto-Assist bridge for FixMyCampus.
 * Delegates to the local AI engine (no cloud API calls).
 * This file is kept as the public API so existing imports don't break.
 */

import { analyzeComplaint } from './localAiEngine';

/**
 * Analyze a complaint description and photo, returning AI suggestions.
 * Now powered entirely by the local AI engine — no API keys or network needed.
 * 
 * @param {string} description - Complaint description text
 * @param {string|null} photoDataUrl - Optional base64 photo data URL
 * @returns {Promise<Object>} { suggestedTitle, category, urgency, suggestedDepartment, oneLineSummary }
 */
export async function analyzeComplaintWithAI(description, photoDataUrl = null) {
  return analyzeComplaint(description, photoDataUrl);
}
