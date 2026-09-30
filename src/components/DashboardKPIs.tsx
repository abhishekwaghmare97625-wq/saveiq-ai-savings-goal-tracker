import React from 'react';
import { Target, TrendingUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/storage';

interface DashboardKPIsProps {
  goals: SavingsGoal[];
  onOpenNewGoal: () => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ goals, onOpenNewGoal }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount && getDaysRemaining(g.deadline) >= 0).length;
  const overdueGoals = goals.filter((g) => g.currentAmount < g.targetAmount && getDaysRemaining(g.deadline) < 0).length;
  const approachingGoals = goals.filter((g) => {
    const days = getDaysRemaining(g.deadline);
    return g.currentAmount < g.targetAmount && days >= 0 && days <= 30;
  }).length;

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const aggregateRemaining = Math.max(0, totalTarget - totalSaved);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Card */}
      <div className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 relative overflow-hidden shadow-xs dark:shadow-none transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>SaveIQ Portfolio Health</span>
              <span>·</span>
              <span>Automated Goal Monitor</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Financial Savings Progress
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Tracking your personalized savings objectives with automated deadline auditing, velocity analysis, and intelligent Groq AI financial recommendations.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-lg p-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Saved</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {formatCurrency(totalSaved)}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Goal Target</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                {formatCurrency(totalTarget)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Portfolio Fulfillment:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{overallPercentage}% achieved</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Gap: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(aggregateRemaining)}</strong>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI 5-Column Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Goals */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Goals</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {totalGoals}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {new Set(goals.map((g) => g.purpose)).size} categories
          </div>
        </div>

        {/* Metric 2: Active Goals */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Goals</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono tabular-nums">
            {activeGoals}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            In active funding velocity
          </div>
        </div>

        {/* Metric 3: Completed Goals */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2 font-mono tabular-nums">
            {completedGoals}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            100% target attained
          </div>
        </div>

        {/* Metric 4: Approaching Deadlines */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Due &le; 30 Days</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono tabular-nums">
            {approachingGoals}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitored by daily audit
          </div>
        </div>

        {/* Metric 5: Overdue Goals */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 col-span-2 sm:col-span-1 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Goals</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono tabular-nums">
            {overdueGoals}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {overdueGoals > 0 ? 'Requires date rebalance' : 'Zero overdue goals'}
          </div>
        </div>
      </div>
    </div>
  );
};
