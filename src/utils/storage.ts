import { SavingsGoal, AuditAlertRecord } from '../types';
import { INITIAL_GOALS } from '../data/initialGoals';

const GOALS_STORAGE_KEY = 'saveiq_goals_v1';
const ALERTS_STORAGE_KEY = 'saveiq_alerts_v1';

export function loadSavedGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) {
      saveGoals(INITIAL_GOALS);
      return INITIAL_GOALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_GOALS;
  } catch (e) {
    console.error('Error loading saved goals:', e);
    return INITIAL_GOALS;
  }
}

export function saveGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals to localStorage:', e);
  }
}

export function loadSavedAlerts(): AuditAlertRecord[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAlerts(alerts: AuditAlertRecord[]): void {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('Error saving alerts to localStorage:', e);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDaysRemaining(deadlineStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
