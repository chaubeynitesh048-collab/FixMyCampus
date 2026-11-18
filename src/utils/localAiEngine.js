/**
 * localAiEngine.js
 * 
 * FixMyCampus Local AI Engine - Runs 100% in-browser, zero cloud dependencies.
 * 
 * Architecture:
 * - Multi-signal keyword classifier with weighted scoring
 * - Context-aware urgency detection (safety keywords boost urgency)
 * - Domain-specific title generation with NLP heuristics
 * - Rule-based conversational FAQ engine for the chatbot
 * - Modular design: swap out the engine without touching consumers
 * 
 * No API keys, no network calls, no model downloads required.
 */

import { CATEGORIES, DEPARTMENTS } from './helpers';

// ═══════════════════════════════════════════════════════════════
//  ENGINE STATE & INITIALIZATION
// ═══════════════════════════════════════════════════════════════

let engineReady = false;
let engineVersion = '2.0.0';
let initCallbacks = [];

/**
 * Initialize the local AI engine.
 * Currently instant (rule-based), but designed so a future ML model
 * can be loaded here with progress callbacks.
 * 
 * @param {Object} options
 * @param {Function} options.onProgress - (percent, message) => void
 * @param {Function} options.onReady - () => void
 * @param {Function} options.onError - (error) => void
 * @returns {Promise<boolean>}
 */
export async function initializeAiEngine(options = {}) {
  const { onProgress, onReady, onError } = options;

  try {
    onProgress?.(10, 'Loading classification rules...');
    // Simulate tiny init delay for UX smoothness
    await new Promise((r) => setTimeout(r, 100));

    onProgress?.(40, 'Building keyword index...');
    await new Promise((r) => setTimeout(r, 80));

    onProgress?.(70, 'Initializing NLP pipeline...');
    await new Promise((r) => setTimeout(r, 80));

    onProgress?.(100, 'AI Engine ready');
    engineReady = true;
    onReady?.();

    // Notify any pending waiters
    initCallbacks.forEach((cb) => cb(true));
    initCallbacks = [];

    return true;
  } catch (err) {
    onError?.(err);
    initCallbacks.forEach((cb) => cb(false));
    initCallbacks = [];
    return false;
  }
}

/**
 * Check if the engine is ready
 */
export function isEngineReady() {
  return engineReady;
}

/**
 * Get engine info for display
 */
export function getEngineInfo() {
  return {
    name: 'FixMyCampus Smart NLP',
    version: engineVersion,
    type: 'local-rule-based',
    ready: engineReady,
    requiresDownload: false,
    modelSize: '0 MB (built-in)',
    capabilities: ['complaint-classification', 'urgency-detection', 'department-routing', 'title-generation', 'faq-chatbot'],
  };
}

// ═══════════════════════════════════════════════════════════════
//  CLASSIFICATION KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════

/**
 * Weighted keyword patterns for each category.
 * Higher weight = stronger signal for that category.
 */
const CATEGORY_RULES = [
  {
    category: 'Electrical',
    department: 'Electrician',
    keywords: [
      { pattern: /\b(electric|electricity)\b/i, weight: 3 },
      { pattern: /\b(wire|wiring|cable)\b/i, weight: 3 },
      { pattern: /\b(spark|sparking)\b/i, weight: 4 },
      { pattern: /\b(switch|switchboard)\b/i, weight: 3 },
      { pattern: /\b(socket|plug|outlet)\b/i, weight: 3 },
      { pattern: /\b(fan|ceiling fan)\b/i, weight: 2 },
      { pattern: /\b(light|bulb|tube|tubelight|led)\b/i, weight: 3 },
      { pattern: /\b(power|power cut|blackout|outage)\b/i, weight: 3 },
      { pattern: /\b(mcb|circuit breaker|fuse|tripped)\b/i, weight: 4 },
      { pattern: /\b(shock|electrocute)\b/i, weight: 5 },
      { pattern: /\b(voltage|fluctuation)\b/i, weight: 3 },
      { pattern: /\b(generator|inverter|ups)\b/i, weight: 2 },
      { pattern: /\b(ac|air conditioner|air conditioning)\b/i, weight: 2 },
      { pattern: /\b(heater|geyser)\b/i, weight: 2 },
      { pattern: /\b(smoke|burning smell)\b/i, weight: 4 },
    ],
  },
  {
    category: 'Plumbing',
    department: 'Plumber',
    keywords: [
      { pattern: /\b(leak|leaking|leakage)\b/i, weight: 3 },
      { pattern: /\b(water)\b/i, weight: 2 },
      { pattern: /\b(pipe|piping|pipeline)\b/i, weight: 4 },
      { pattern: /\b(tap|faucet)\b/i, weight: 3 },
      { pattern: /\b(drain|drainage|clogged|blocked)\b/i, weight: 4 },
      { pattern: /\b(flush|toilet|commode|urinal)\b/i, weight: 3 },
      { pattern: /\b(sewage|sewer|septic)\b/i, weight: 4 },
      { pattern: /\b(sink|basin)\b/i, weight: 2 },
      { pattern: /\b(cooler|water cooler|ro|purifier)\b/i, weight: 3 },
      { pattern: /\b(overflow|flooding|flooded|waterlogging)\b/i, weight: 4 },
      { pattern: /\b(shower|bathroom)\b/i, weight: 2 },
      { pattern: /\b(tank|water tank|overhead)\b/i, weight: 3 },
      { pattern: /\b(burst|broken pipe)\b/i, weight: 5 },
      { pattern: /\b(drip|dripping)\b/i, weight: 3 },
    ],
  },
  {
    category: 'Cleanliness / Sanitation',
    department: 'Housekeeping',
    keywords: [
      { pattern: /\b(clean|cleaning|unclean)\b/i, weight: 3 },
      { pattern: /\b(dirty|filthy|stain)\b/i, weight: 3 },
      { pattern: /\b(garbage|trash|waste|litter)\b/i, weight: 4 },
      { pattern: /\b(dustbin|bin|dusty)\b/i, weight: 3 },
      { pattern: /\b(smell|odor|odour|stink|foul)\b/i, weight: 3 },
      { pattern: /\b(hygiene|unhygienic|sanitary|sanitation)\b/i, weight: 4 },
      { pattern: /\b(mop|sweep|sweep)\b/i, weight: 3 },
      { pattern: /\b(washroom|restroom|toilet)\b/i, weight: 2 },
      { pattern: /\b(pest|cockroach|rat|mice|mosquito|insect|bug|ant)\b/i, weight: 4 },
      { pattern: /\b(mold|mould|fungus|damp)\b/i, weight: 3 },
      { pattern: /\b(spill|spilled)\b/i, weight: 2 },
      { pattern: /\b(cobweb|dust)\b/i, weight: 2 },
    ],
  },
  {
    category: 'Wi-Fi / Internet',
    department: 'IT Support',
    keywords: [
      { pattern: /\b(wifi|wi-fi|wi fi)\b/i, weight: 5 },
      { pattern: /\b(internet|connectivity|connection)\b/i, weight: 4 },
      { pattern: /\b(network|networking)\b/i, weight: 3 },
      { pattern: /\b(router|modem|access point)\b/i, weight: 4 },
      { pattern: /\b(lan|ethernet|cable)\b/i, weight: 3 },
      { pattern: /\b(server|server down)\b/i, weight: 4 },
      { pattern: /\b(portal|erp|website|login)\b/i, weight: 3 },
      { pattern: /\b(slow|speed|buffering|lag)\b/i, weight: 2 },
      { pattern: /\b(projector|smart board|smartboard)\b/i, weight: 3 },
      { pattern: /\b(computer|pc|desktop|laptop|system)\b/i, weight: 2 },
      { pattern: /\b(printer|print|scanner)\b/i, weight: 3 },
      { pattern: /\b(software|password|account)\b/i, weight: 2 },
      { pattern: /\b(cctv|camera|surveillance)\b/i, weight: 3 },
    ],
  },
  {
    category: 'Furniture / Classroom',
    department: 'Maintenance Head',
    keywords: [
      { pattern: /\b(bench|desk|table)\b/i, weight: 3 },
      { pattern: /\b(chair|seat|seating)\b/i, weight: 3 },
      { pattern: /\b(board|whiteboard|blackboard|marker)\b/i, weight: 3 },
      { pattern: /\b(window|glass|pane)\b/i, weight: 2 },
      { pattern: /\b(door|lock|handle|hinge|knob)\b/i, weight: 3 },
      { pattern: /\b(broken|cracked|damaged|dent)\b/i, weight: 2 },
      { pattern: /\b(furniture|cupboard|shelf|rack|almirah)\b/i, weight: 4 },
      { pattern: /\b(classroom|lecture hall|auditorium)\b/i, weight: 2 },
      { pattern: /\b(paint|painting|wall|ceiling|floor|tile)\b/i, weight: 2 },
      { pattern: /\b(curtain|blind|shade)\b/i, weight: 2 },
    ],
  },
  {
    category: 'Library Facilities',
    department: 'Library In-charge',
    keywords: [
      { pattern: /\b(library)\b/i, weight: 5 },
      { pattern: /\b(book|books|journal|magazine)\b/i, weight: 3 },
      { pattern: /\b(reading hall|reading room|study room)\b/i, weight: 4 },
      { pattern: /\b(silence|noise|disturbance)\b/i, weight: 2 },
      { pattern: /\b(issue|return|fine|overdue)\b/i, weight: 1 },
      { pattern: /\b(catalogue|catalog|reference)\b/i, weight: 3 },
      { pattern: /\b(photocopy|xerox|scan)\b/i, weight: 2 },
    ],
  },
  {
    category: 'Food & Canteen',
    department: 'Warden',
    keywords: [
      { pattern: /\b(food|meal|lunch|dinner|breakfast)\b/i, weight: 4 },
      { pattern: /\b(canteen|mess|cafeteria|kitchen)\b/i, weight: 5 },
      { pattern: /\b(cook|cooking|taste|quality)\b/i, weight: 2 },
      { pattern: /\b(hygiene|unhygienic|expired|stale)\b/i, weight: 3 },
      { pattern: /\b(menu|variety|vegetarian|non-veg)\b/i, weight: 2 },
      { pattern: /\b(vending machine|water dispenser)\b/i, weight: 2 },
    ],
  },
  {
    category: 'Safety & Security',
    department: 'Principal Office',
    keywords: [
      { pattern: /\b(security|guard|theft|stolen|robbery)\b/i, weight: 5 },
      { pattern: /\b(fire|fire extinguisher|alarm|emergency)\b/i, weight: 5 },
      { pattern: /\b(fight|harassment|bully|ragging)\b/i, weight: 5 },
      { pattern: /\b(gate|entry|exit|access|id card)\b/i, weight: 3 },
      { pattern: /\b(accident|injury|ambulance|medical)\b/i, weight: 5 },
      { pattern: /\b(stray|dog|animal|snake)\b/i, weight: 4 },
      { pattern: /\b(cctv|surveillance|monitoring)\b/i, weight: 3 },
      { pattern: /\b(parking|vehicle)\b/i, weight: 2 },
      { pattern: /\b(unsafe|danger|hazard|risk)\b/i, weight: 4 },
    ],
  },
];

/**
 * Urgency keywords - presence and count boost urgency level
 */
const URGENCY_BOOSTERS = {
  critical: [
    /\b(fire|smoke|burning|flame)\b/i,
    /\b(shock|electrocute|electrocution)\b/i,
    /\b(flood|flooding|burst)\b/i,
    /\b(collapse|collapsed|falling)\b/i,
    /\b(emergency|urgent|immediately|asap)\b/i,
    /\b(injury|injured|hurt|accident)\b/i,
    /\b(danger|dangerous|hazard|hazardous)\b/i,
    /\b(theft|stolen|robbery)\b/i,
    /\b(fight|harassment|ragging)\b/i,
    /\b(snake|gas leak|short circuit)\b/i,
  ],
  high: [
    /\b(spark|sparking)\b/i,
    /\b(overflow|overflowing)\b/i,
    /\b(continuous|continuously|non.?stop)\b/i,
    /\b(entire|whole|all|everyone|multiple)\b/i,
    /\b(exam|examination|test|assessment)\b/i,
    /\b(broken|not working|failed|down)\b/i,
    /\b(safety|unsafe|risk)\b/i,
    /\b(stink|unbearable|intolerable)\b/i,
    /\b(sewage|septic)\b/i,
    /\b(blocked|no water|no power|no electricity)\b/i,
  ],
  medium: [
    /\b(slow|intermittent|sometimes)\b/i,
    /\b(problem|issue|complaint|trouble)\b/i,
    /\b(need|needs|required|require)\b/i,
    /\b(replace|replacement|repair)\b/i,
    /\b(faulty|defective|malfunctioning)\b/i,
  ],
};

// ═══════════════════════════════════════════════════════════════
//  COMPLAINT ANALYSIS (Main AI Function)
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze a complaint description and return smart suggestions.
 * This is the main function that replaces Gemini API calls.
 * 
 * @param {string} description - The complaint text
 * @param {string|null} photoDataUrl - Optional photo (not used in rule-based, reserved for future ML)
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeComplaint(description, photoDataUrl = null) {
  // Auto-initialize if needed
  if (!engineReady) {
    await initializeAiEngine();
  }

  const text = (description || '').trim();
  if (!text) {
    return getDefaultAnalysis();
  }

  // 1. Score each category
  const scores = CATEGORY_RULES.map((rule) => {
    let totalScore = 0;
    let matchCount = 0;

    for (const kw of rule.keywords) {
      if (kw.pattern.test(text)) {
        totalScore += kw.weight;
        matchCount++;
      }
    }

    return {
      category: rule.category,
      department: rule.department,
      score: totalScore,
      matchCount,
    };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  const bestMatch = scores[0];

  // 2. Determine category and department
  let category = bestMatch.score > 0 ? bestMatch.category : 'Other';
  let department = bestMatch.score > 0 ? bestMatch.department : 'Maintenance Head';

  // Special routing: if Hostel context keywords present, Warden should be involved
  if (/\b(hostel|room\s*mate|warden|mess|curfew)\b/i.test(text) && category === 'Other') {
    department = 'Warden';
  }

  // 3. Determine urgency
  let urgency = 'Medium';
  let criticalHits = 0;
  let highHits = 0;

  for (const pattern of URGENCY_BOOSTERS.critical) {
    if (pattern.test(text)) criticalHits++;
  }
  for (const pattern of URGENCY_BOOSTERS.high) {
    if (pattern.test(text)) highHits++;
  }

  if (criticalHits >= 1) {
    urgency = 'Critical';
  } else if (highHits >= 2 || (highHits >= 1 && bestMatch.score >= 4)) {
    urgency = 'High';
  } else if (bestMatch.score <= 2) {
    urgency = 'Low';
  }

  // 4. Generate a smart title
  const suggestedTitle = generateSmartTitle(text, category, department);

  // 5. Generate a one-line summary
  const oneLineSummary = generateSummary(text, category, department, urgency);

  return {
    suggestedTitle,
    category,
    urgency,
    suggestedDepartment: department,
    oneLineSummary,
    confidence: bestMatch.score > 0 ? Math.min(0.95, 0.5 + bestMatch.matchCount * 0.1) : 0.3,
    isLocalEngine: true,
    engineVersion,
  };
}

/**
 * Generate a clean, descriptive title from the complaint text
 */
function generateSmartTitle(text, category, department) {
  const lower = text.toLowerCase();

  // Try to extract a meaningful noun phrase
  // Pattern: "[Problem word] + [in/at/near] + [Location/Object]"
  const problemPatterns = [
    /(?:broken|damaged|faulty|defective|malfunctioning)\s+(\w+(?:\s+\w+)?)/i,
    /(\w+(?:\s+\w+)?)\s+(?:not working|is broken|is damaged|stopped|failed)/i,
    /(?:no|lack of|shortage of)\s+(\w+(?:\s+\w+)?)/i,
    /(\w+)\s+(?:leak|leaking|overflowing|sparking|flickering)/i,
    /(?:leak|overflow|blockage|damage|crack)\s+(?:in|at|near)\s+(\w+(?:\s+\w+)?)/i,
  ];

  for (const pattern of problemPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const subject = match[1].trim();
      // Build title from match
      const cappedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
      
      // Try to find a location context
      const locationMatch = text.match(/(?:in|at|near|on)\s+((?:room|block|floor|hostel|lab|library|canteen|corridor|building|hall|ground)\s*\w*)/i);
      const locationSuffix = locationMatch ? ` ${locationMatch[0]}` : '';
      
      return truncateTitle(`${cappedSubject} Issue${locationSuffix}`, 60);
    }
  }

  // Fallback: Use first meaningful words
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 7);

  if (words.length > 0) {
    const title = words.join(' ');
    return truncateTitle(title.charAt(0).toUpperCase() + title.slice(1), 60);
  }

  return `${category} Issue - ${department}`;
}

function truncateTitle(title, maxLen) {
  if (title.length <= maxLen) return title;
  return title.substring(0, maxLen - 3).trim() + '...';
}

/**
 * Common English stop words to filter from titles
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'than', 'too', 'very', 'just', 'because',
  'this', 'that', 'these', 'those', 'its', 'our', 'their', 'your',
  'my', 'his', 'her', 'we', 'they', 'you', 'him', 'them', 'who',
  'whom', 'which', 'what', 'where', 'when', 'how', 'there', 'here',
  'please', 'kindly', 'sir', 'madam', 'dear', 'hello', 'complaint',
]);

/**
 * Generate a concise one-line summary for technicians
 */
function generateSummary(text, category, department, urgency) {
  const lower = text.toLowerCase();

  // Extract location if mentioned
  const locationMatch = text.match(
    /(?:in|at|near|on)\s+((?:room|block|floor|hostel|lab|library|canteen|corridor|building|hall|ground|wing)\s*[\w\d\-]*)/i
  );
  const locationStr = locationMatch ? ` ${locationMatch[0]}` : '';

  // Urgency prefix
  const urgencyPrefix = urgency === 'Critical' ? '⚠️ URGENT: ' : urgency === 'High' ? '🔴 ' : '';

  return `${urgencyPrefix}${category} issue reported${locationStr}. Route to ${department} for inspection.`;
}

function getDefaultAnalysis() {
  return {
    suggestedTitle: 'Campus Maintenance Issue',
    category: 'Other',
    urgency: 'Medium',
    suggestedDepartment: 'Maintenance Head',
    oneLineSummary: 'General campus issue reported. Route to Maintenance Head for assessment.',
    confidence: 0.1,
    isLocalEngine: true,
    engineVersion,
  };
}

// ═══════════════════════════════════════════════════════════════
//  CHATBOT / FAQ ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Knowledge base for the campus AI chatbot.
 * Each entry has trigger patterns and a response.
 */
const FAQ_KNOWLEDGE = [
  {
    triggers: [/escalat/i, /48\s*h/i, /sla/i, /time\s*limit/i, /overdue/i],
    response: 'All complaints follow a strict 48-hour SLA. If your issue isn\'t resolved within 48 hours, it automatically escalates to Tier 2 (Campus Maintenance Head). After 96 hours, it escalates to Tier 3 (Principal Office). You\'ll see escalation status on your tracking timeline.',
  },
  {
    triggers: [/report/i, /submit/i, /file\s*(a|my)?\s*complaint/i, /how\s*(do|can|to)/i],
    response: 'To report an issue: Click "Report Issue" in the navigation bar → Take or upload photos (up to 3) → Describe the problem → Click "AI Auto-Assist" to get smart suggestions for category, urgency, and routing → Review and submit. You\'ll get a unique tracking ID like FMC-2026-0001.',
  },
  {
    triggers: [/track/i, /status/i, /where\s*is/i, /check/i, /progress/i],
    response: 'Track your complaint by clicking "Track Complaints" in the menu. You can search by your complaint ID (e.g., FMC-2026-0001). The tracking timeline shows every step: Submitted → Received by Dept → Assigned → In Progress → Resolved, with timestamps and handler names.',
  },
  {
    triggers: [/electric/i, /fan/i, /light/i, /wire/i, /spark/i, /power/i, /switch/i],
    response: 'Electrical issues are routed directly to the Electrician department. For high-voltage sparks, exposed wires, or safety hazards, mark urgency as "Critical" to trigger immediate dispatch. Include the exact room/block number and floor for fastest response.',
  },
  {
    triggers: [/plumb/i, /water/i, /leak/i, /tap/i, /drain/i, /pipe/i, /toilet/i, /cooler/i],
    response: 'Water supply and plumbing tickets go to the Plumber department. For burst pipes or flooding, mark as "Critical". Please specify the exact floor, room number, and nearest landmark. Take a photo showing the severity of the leak or blockage.',
  },
  {
    triggers: [/clean/i, /dirty/i, /garbage/i, /smell/i, /hygiene/i, /washroom/i, /pest/i, /cockroach/i],
    response: 'Cleanliness and sanitation issues are handled by Housekeeping. For pest infestations or washroom hygiene emergencies, mark as "High" urgency. Report the specific area (washroom number, corridor, floor) for targeted cleaning dispatch.',
  },
  {
    triggers: [/wifi/i, /internet/i, /network/i, /slow/i, /connect/i, /router/i, /computer/i, /printer/i],
    response: 'Wi-Fi and IT issues go to IT Support. Include which network you\'re trying to connect to, your device type, and the specific building/floor. If the entire network is down, mark urgency as "High". For individual device issues, "Medium" is appropriate.',
  },
  {
    triggers: [/hostel/i, /warden/i, /room/i, /mess/i, /food/i, /canteen/i, /curfew/i],
    response: 'Hostel-related complaints are routed to the Hostel Warden. This includes room maintenance, mess/food quality, roommate issues, and hostel policy matters. For food quality or hygiene concerns in the canteen, provide specific details about the meal and date.',
  },
  {
    triggers: [/library/i, /book/i, /reading/i, /study\s*room/i, /journal/i],
    response: 'Library facility issues are handled by the Library In-charge. This includes book availability, reading hall maintenance, noise complaints, AC/lighting in study rooms, and photocopy services. Use "Library Facilities" as the category.',
  },
  {
    triggers: [/security/i, /safe/i, /theft/i, /guard/i, /fire/i, /emergency/i, /accident/i],
    response: 'Safety and security concerns are escalated to the Principal Office directly. For emergencies (fire, injury, theft), mark urgency as "Critical". Also contact campus security at the nearest guard post. FixMyCampus is for documentation and follow-up, not real-time emergency response.',
  },
  {
    triggers: [/rating/i, /star/i, /review/i, /feedback/i, /resolve/i, /solved/i, /reopen/i],
    response: 'After staff marks your issue as "Resolved", you\'ll get a notification to review. You can: (1) Confirm "Issue Solved" and give a 1-5 star rating, or (2) Click "Reopen" with a reason if the problem persists. Reopened tickets keep their original ID and timeline history.',
  },
  {
    triggers: [/upvote/i, /me\s*too/i, /same\s*problem/i, /public/i, /board/i, /common/i],
    response: 'The Public Issues Board shows all reported issues. You can upvote ("Me Too") complaints that affect you too — this helps common problems rise to the top and get faster attention from campus administration. Use filters by category, status, and location.',
  },
  {
    triggers: [/photo/i, /camera/i, /picture/i, /image/i, /upload/i, /attach/i],
    response: 'You can attach up to 3 photos per complaint. Use "Take Photo" to capture directly from your camera, or "Upload from Gallery" to select existing photos. Images are automatically compressed before upload to save data. Photos help technicians prepare the right tools before visiting.',
  },
  {
    triggers: [/department/i, /staff/i, /who\s*(handle|fix|resolve)/i, /assign/i, /route/i],
    response: 'FixMyCampus routes complaints to 8 departments: Hostel Warden, Electrician, Plumber, Housekeeping, IT Support, Library In-charge, Maintenance Head, and Principal Office. The AI Auto-Assist feature analyzes your description to suggest the best department automatically.',
  },
  {
    triggers: [/ai/i, /auto.?assist/i, /smart/i, /suggest/i, /recommend/i, /analy/i],
    response: 'The AI Auto-Assist feature analyzes your complaint description to suggest the best category, urgency level, department routing, and a concise title. Click the "AI Auto-Assist" button after typing your description. You can always edit the suggestions before submitting.',
  },
  {
    triggers: [/dark\s*mode/i, /theme/i, /night/i, /light\s*mode/i],
    response: 'FixMyCampus supports both light and dark themes. Click the sun/moon icon in the top navigation bar to toggle between modes. Your preference is saved automatically.',
  },
  {
    triggers: [/hello/i, /hi\b/i, /hey/i, /good\s*(morning|afternoon|evening)/i, /help/i],
    response: 'Hello! I\'m the FixMyCampus AI Assistant. I can help you with:\n• How to report campus issues\n• Tracking your complaints\n• Understanding the 48-hour escalation policy\n• Department routing information\n• Photo upload guidelines\n\nWhat would you like to know?',
  },
];

/**
 * Process a chatbot query and return a helpful response.
 * Uses pattern matching against the FAQ knowledge base.
 * 
 * @param {string} query - User's question
 * @returns {Promise<string>} AI response
 */
export async function chatWithAI(query) {
  if (!engineReady) {
    await initializeAiEngine();
  }

  const text = (query || '').trim();
  if (!text) {
    return 'Please type a question and I\'ll do my best to help!';
  }

  // Score each FAQ entry
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ_KNOWLEDGE) {
    let score = 0;
    for (const trigger of faq.triggers) {
      if (trigger.test(text)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // If we found a good match, return it
  if (bestMatch && bestScore >= 1) {
    return bestMatch.response;
  }

  // Generic fallback
  return 'You can report any campus infrastructure issue by clicking "Report Issue" in the navigation bar. Attach up to 3 photos using your device camera, and the AI Auto-Assist will route it to the correct department. For tracking, use your complaint ID (e.g., FMC-2026-0001) in the "Track Complaints" section.';
}
