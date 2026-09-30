import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Scissors,
  Bot,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { SavingsGoal, AIRecommendation } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/storage';

interface AIAdviceModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  advice: AIRecommendation | null;
  isLoading: boolean;
  onClose: () => void;
  onRefreshAdvice: (goal: SavingsGoal) => void;
  onOpenBotChatWithGoal?: (goal: SavingsGoal) => void;
}

export const AIAdviceModal: React.FC<AIAdviceModalProps> = ({
  isOpen,
  goal,
  advice,
  isLoading,
  onClose,
  onRefreshAdvice,
  onOpenBotChatWithGoal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !goal) return null;

  const daysRemaining = getDaysRemaining(goal.deadline);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleCopy = () => {
    if (!advice) return;
    const text = `SaveIQ AI Recommendation for ${goal.name}:
Status: ${advice.riskLevel} (Feasibility: ${advice.feasibilityScore}/100)
Required Savings: $${advice.requiredDaily}/day, $${advice.requiredWeekly}/week, $${advice.requiredMonthly}/month
Summary: ${advice.summary}

Tactical Advice:
${advice.tacticalAdvice.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Budget Optimizations:
${advice.suggestedBudgetTrim.map((b) => `• ${b}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Financial Insights</h3>
                <span className="text-2xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  Groq / Gemini AI
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{goal.name} ({goal.purpose})</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefreshAdvice(goal)}
              disabled={isLoading}
              title="Re-run AI Analysis"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Goal State Mini Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
            <div>
              <div className="text-slate-500 dark:text-slate-400">Target</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(goal.targetAmount)}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Current Balance</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(goal.currentAmount)}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Remaining Gap</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {formatCurrency(remaining)}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400">Deadline Horizon</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Auditing savings velocity & generating financial guidance...
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Evaluating Groq & Gemini financial models
              </div>
            </div>
          ) : advice ? (
            <div className="space-y-6">
              {/* Executive Assessment & Risk Meter */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md border font-mono ${
                        advice.riskLevel === 'On Track'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : advice.riskLevel === 'Needs Attention'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      Trajectory: {advice.riskLevel}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Feasibility Score: <strong className="text-slate-900 dark:text-white font-mono">{advice.feasibilityScore}/100</strong>
                    </span>
                  </div>

                  <div className="text-2xs text-slate-500 font-mono">
                    Model: {advice.modelUsed}
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {advice.summary}
                </p>
              </div>

              {/* Required Savings Rate Matrix */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Required Savings Velocity to Hit Deadline
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Daily Pace</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                      ${advice.requiredDaily.toFixed(2)}
                    </div>
                    <div className="text-2xs text-slate-500 mt-0.5">per day</div>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Weekly Target</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1 font-mono tabular-nums">
                      ${advice.requiredWeekly.toFixed(2)}
                    </div>
                    <div className="text-2xs text-emerald-600 dark:text-emerald-500/70 mt-0.5 font-medium">recommended</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Monthly Target</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                      ${advice.requiredMonthly.toFixed(2)}
                    </div>
                    <div className="text-2xs text-slate-500 mt-0.5">per month</div>
                  </div>
                </div>
              </div>

              {/* Tactical Recommendations */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Strategic Acceleration Actions</span>
                </h4>
                <div className="space-y-2">
                  {advice.tacticalAdvice.map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-2xs">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Budget Trims */}
              {advice.suggestedBudgetTrim && advice.suggestedBudgetTrim.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="text-amber-500">✂️</span>
                    <span>Identified Discretionary Budget Trims</span>
                  </h4>
                  <div className="space-y-1.5">
                    {advice.suggestedBudgetTrim.map((trim, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{trim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones Checkpoints */}
              {advice.milestoneCheckpoints && advice.milestoneCheckpoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Projected Milestones Timeline</span>
                  </h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden text-xs">
                    {advice.milestoneCheckpoints.map((ms, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{ms.label}</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-slate-500 dark:text-slate-400">
                          <span>{ms.date}</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            {formatCurrency(ms.targetCumulative)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No recommendations cached. Click refresh above to generate insights.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <button
            onClick={handleCopy}
            disabled={!advice}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Strategy'}</span>
          </button>

          <div className="flex items-center gap-3">
            {onOpenBotChatWithGoal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBotChatWithGoal(goal);
                }}
                className="px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Discuss with Abhishek Bot</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
