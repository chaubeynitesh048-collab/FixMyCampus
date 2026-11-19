/**
 * helpers.js
 * Common constants, department mappings, role lists, and formatters
 */

export const DEPARTMENTS = [
  { id: 'Warden', label: 'Hostel Warden', icon: 'Home' },
  { id: 'Electrician', label: 'Electrical Department', icon: 'Zap' },
  { id: 'Plumber', label: 'Plumbing & Water Supply', icon: 'Droplets' },
  { id: 'Housekeeping', label: 'Housekeeping & Sanitation', icon: 'Sparkles' },
  { id: 'IT Support', label: 'IT Support & Wi-Fi', icon: 'Wifi' },
  { id: 'Library In-charge', label: 'Library Facilities', icon: 'BookOpen' },
  { id: 'Maintenance Head', label: 'Campus Maintenance Head', icon: 'Wrench' },
  { id: 'Principal Office', label: 'Principal & Administration', icon: 'ShieldAlert' },
];

export const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Cleanliness / Sanitation',
  'Wi-Fi / Internet',
  'Furniture / Classroom',
  'Library Facilities',
  'Food & Canteen',
  'Safety & Security',
  'Other',
];

export const LOCATIONS = [
  'Hostel (Boys)',
  'Hostel (Girls)',
  'Library',
  'Classroom / Lecture Hall',
  'Canteen',
  'Ground / Sports Complex',
  'Computer / Science Lab',
  'Administrative Block',
  'Other',
];

export const URGENCIES = [
  { level: 'Low', label: 'Low', desc: 'Routine issue, not blocking activities' },
  { level: 'Medium', label: 'Medium', desc: 'Inconvenient, needs attention in 24-48 hrs' },
  { level: 'High', label: 'High', desc: 'Urgent, impacting multiple students' },
  { level: 'Critical', label: 'Critical', desc: 'Emergency or immediate safety risk' },
];

export const STATUSES = [
  'Submitted',
  'Received by Dept',
  'Assigned',
  'In Progress',
  'Resolved',
  'Reopened',
  'Escalated',
];

export function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return 'Recently';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return 'Recently';

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

/**
 * Check if a complaint has exceeded 48 hours without resolution
 */
export function isEscalated(complaint) {
  if (!complaint) return false;
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') return false;
  if (complaint.status === 'Escalated') return true;

  const createdTime = new Date(complaint.createdAt).getTime();
  if (isNaN(createdTime)) return false;

  const hoursDiff = (Date.now() - createdTime) / (1000 * 60 * 60);
  return hoursDiff >= 48;
}

/**
 * Returns escalation tier
 */
export function getEscalationLevel(complaint) {
  const createdTime = new Date(complaint.createdAt).getTime();
  const hoursDiff = (Date.now() - createdTime) / (1000 * 60 * 60);

  if (hoursDiff >= 96) {
    return { level: 3, authority: 'Principal Office', color: 'rose' };
  }
  if (hoursDiff >= 48) {
    return { level: 2, authority: 'Maintenance Head', color: 'amber' };
  }
  return { level: 1, authority: complaint.assignedDepartment || 'Department In-charge', color: 'emerald' };
}
