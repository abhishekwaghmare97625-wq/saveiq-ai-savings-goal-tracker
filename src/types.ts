export type GoalCategory =
  | 'Emergency Fund'
  | 'Tech & Gadgets'
  | 'Travel & Vacation'
  | 'Real Estate & Home'
  | 'Education & Learning'
  | 'Vehicle & Auto'
  | 'Debt Payoff'
  | 'Retirement & Wealth'
  | 'Other';

export interface ContributionLog {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  note?: string;
}

export interface AIRecommendation {
  summary: string;
  feasibilityScore: number; // 0 - 100
  riskLevel: 'On Track' | 'Needs Attention' | 'At Risk';
  requiredDaily: number;
  requiredWeekly: number;
  requiredMonthly: number;
  tacticalAdvice: string[];
  suggestedBudgetTrim: string[];
  milestoneCheckpoints: { label: string; date: string; targetCumulative: number }[];
  modelUsed: string;
  generatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  emailAlerts: boolean;
  emailRecipient: string;
  purpose: GoalCategory;
  priority: 'High' | 'Medium' | 'Low';
  contributionPlan: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  notes?: string;
  createdAt: string;
  history: ContributionLog[];
  aiAdvice?: AIRecommendation;
}

export interface AuditAlertRecord {
  id: string;
  goalId: string;
  goalName: string;
  recipient: string;
  severity: 'Approaching' | 'Critical' | 'Overdue' | 'Goal Completed';
  daysRemaining: number;
  percentComplete: number;
  remainingAmount: number;
  subject: string;
  body: string;
  timestamp: string;
  channel: 'Email (Apps Script / Gmail)' | 'In-App Notification';
}

export interface BotChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
}
