/**
 * idGenerator.js
 * Generates unique complaint IDs like FMC-2026-0001
 */

const COUNTER_KEY = 'fmc_complaint_counter';

export function generateComplaintId() {
  const year = new Date().getFullYear();
  let currentCounter = 1;

  try {
    const saved = localStorage.getItem(COUNTER_KEY);
    if (saved) {
      currentCounter = parseInt(saved, 10) + 1;
    }
  } catch (e) {
    console.warn('LocalStorage unavailable for counter, using random sequence');
    currentCounter = Math.floor(1000 + Math.random() * 9000);
  }

  try {
    localStorage.setItem(COUNTER_KEY, currentCounter.toString());
  } catch (e) {
    // Ignore storage errors
  }

  const paddedNum = String(currentCounter).padStart(4, '0');
  return `FMC-${year}-${paddedNum}`;
}

export function isValidComplaintId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^FMC-\d{4}-\d{4,}$/i.test(id.trim());
}
