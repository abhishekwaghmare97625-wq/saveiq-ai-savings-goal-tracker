import React from 'react';
import {
  Calendar,
  Sparkles,
  Mail,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/storage';

interface GoalCardProps {
  goal: SavingsGoal;
  onOpenDeposit: (goal: SavingsGoal) => void;
  onQuickDeposit: (goal: SavingsGoal, amount: number) => void;
  onOpenAIAdvice: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onOpenDeposit,
  onQuickDeposit,
  onOpenAIAdvice,
  onEdit,
  onDelete,
}) => {
  const percentComplete = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const daysRemaining = getDaysRemaining(goal.deadline);
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const isOverdue = !isCompleted && daysRemaining < 0;
  const isApproaching = !isCompleted && daysRemaining >= 0 && daysRemaining <= 30;

  const safeDays = Math.max(1, daysRemaining);
  const requiredWeekly = +( (remaining / safeDays) * 7 ).toFixed(2);

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-xl p-5 flex flex-col justify-between group shadow-xs dark:shadow-none">
      <div>
        {/* Card Header: Metadata unboxed without pill badge clutter */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{goal.purpose}</span>
              <span aria-hidden="true">·</span>
              <span>Priority: {goal.priority}</span>
              <span aria-hidden="true">·</span>
              <span>{goal.contributionPlan} cadence</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              {goal.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              title="Edit Goal"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-md transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              title="Delete Goal"
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Financial Progress & Numbers */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Current Progress</span>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {percentComplete}% Funded
            </span>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(goal.currentAmount)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              target: <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-teal-500 dark:bg-teal-400'
                  : isOverdue
                  ? 'bg-rose-500'
                  : isApproaching
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Remaining: {formatCurrency(remaining)}</span>
            {!isCompleted && !isOverdue && (
              <span>~${requiredWeekly}/wk</span>
            )}
          </div>
        </div>

        {/* Status Indicators & Deadline */}
        <div className="mt-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Due: {goal.deadline}</span>
            </div>

            {isCompleted ? (
              <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : isOverdue ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> {Math.abs(daysRemaining)}d Overdue
              </span>
            ) : isApproaching ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" /> {daysRemaining} days left
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                {daysRemaining} days left
              </span>
            )}
          </div>

          {/* Email alert status */}
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-700/40">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={goal.emailRecipient}>
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">
                {goal.emailAlerts ? goal.emailRecipient : 'Alerts disabled'}
              </span>
            </div>
            <span className="text-2xs font-mono text-slate-500 dark:text-slate-400">
              {goal.emailAlerts ? 'Daily Audit: ON' : 'Audit: OFF'}
            </span>
          </div>
        </div>

        {goal.notes && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
            "{goal.notes}"
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2">
        <button
          onClick={() => onOpenAIAdvice(goal)}
          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-700/60 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>AI Insights</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuickDeposit(goal, 50)}
            title="Quick deposit +$50"
            className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 dark:bg-slate-900 dark:hover:bg-slate-700/80 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs font-mono font-semibold transition-colors"
          >
            +$50
          </button>
          <button
            onClick={() => onQuickDeposit(goal, 100)}
            title="Quick deposit +$100"
            className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-emerald-700 dark:bg-slate-900 dark:hover:bg-slate-700/80 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs font-mono font-semibold transition-colors"
          >
            +$100
          </button>
          <button
            onClick={() => onOpenDeposit(goal)}
            title="Custom deposit or withdrawal"
            className="py-2 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Deposit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
