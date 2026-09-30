import React, { useState, useEffect } from 'react';
import { X, Target, BellRing, Sparkles, Mail } from 'lucide-react';
import { SavingsGoal, GoalCategory } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Partial<SavingsGoal>) => void;
  goalToEdit?: SavingsGoal | null;
}

const CATEGORIES: GoalCategory[] = [
  'Emergency Fund',
  'Tech & Gadgets',
  'Travel & Vacation',
  'Real Estate & Home',
  'Education & Learning',
  'Vehicle & Auto',
  'Debt Payoff',
  'Retirement & Wealth',
  'Other',
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goalToEdit,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSavings, setInitialSavings] = useState('');
  const [deadline, setDeadline] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emailRecipient, setEmailRecipient] = useState('abhishekwaghmare97625@gmail.com');
  const [purpose, setPurpose] = useState<GoalCategory>('Emergency Fund');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [contributionPlan, setContributionPlan] = useState<'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly'>('Monthly');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setInitialSavings(goalToEdit.currentAmount.toString());
      setDeadline(goalToEdit.deadline);
      setEmailAlerts(goalToEdit.emailAlerts);
      setEmailRecipient(goalToEdit.emailRecipient || 'abhishekwaghmare97625@gmail.com');
      setPurpose(goalToEdit.purpose);
      setPriority(goalToEdit.priority);
      setContributionPlan(goalToEdit.contributionPlan);
      setNotes(goalToEdit.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setInitialSavings('0');
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setDeadline(future.toISOString().split('T')[0]);
      setEmailAlerts(true);
      setEmailRecipient('abhishekwaghmare97625@gmail.com');
      setPurpose('Emergency Fund');
      setPriority('High');
      setContributionPlan('Monthly');
      setNotes('');
    }
    setErrors({});
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Goal name is required';
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) errs.targetAmount = 'Enter a valid target amount greater than 0';
    const current = parseFloat(initialSavings);
    if (isNaN(current) || current < 0) errs.initialSavings = 'Initial savings must be 0 or higher';
    if (!deadline) errs.deadline = 'Target deadline date is required';
    if (emailAlerts && (!emailRecipient.trim() || !emailRecipient.includes('@'))) {
      errs.emailRecipient = 'Valid email address is required for automated alerts';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(initialSavings || '0'),
      deadline,
      emailAlerts,
      emailRecipient: emailRecipient.trim(),
      purpose,
      priority,
      contributionPlan,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {goalToEdit ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Define targets, deadlines, and automated audit monitoring
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!goalToEdit && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Quick Scenario Presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setName('Emergency Fund (3-6 Months)');
                    setPurpose('Emergency Fund');
                    setTargetAmount('5000');
                    setPriority('High');
                  }}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Emergency Fund ($5k)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName('Laptop & Tech Upgrade');
                    setPurpose('Tech & Gadgets');
                    setTargetAmount('2000');
                    setPriority('Medium');
                  }}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Laptop Purchase ($2k)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName('Vacation & Travel Experience');
                    setPurpose('Travel & Vacation');
                    setTargetAmount('3500');
                    setPriority('Medium');
                  }}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Vacation Plan ($3.5k)
                </button>
              </div>
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emergency Fund, Laptop Purchase, Vacation Plan"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {errors.name && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Category / Purpose & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purpose / Category *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as GoalCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Target Amount & Initial Savings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {errors.targetAmount && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.targetAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {goalToEdit ? 'Current Balance ($)' : 'Initial Savings ($)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={initialSavings}
                  onChange={(e) => setInitialSavings(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              {errors.initialSavings && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.initialSavings}</p>
              )}
            </div>
          </div>

          {/* Deadline & Contribution Cadence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deadline Date *
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {errors.deadline && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.deadline}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Planned Savings Cadence
              </label>
              <select
                value={contributionPlan}
                onChange={(e) => setContributionPlan(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Weekly">Weekly Transfers</option>
                <option value="Bi-weekly">Bi-weekly (Paycheck)</option>
                <option value="Monthly">Monthly Transfers</option>
                <option value="Daily">Daily Micro-saves</option>
              </select>
            </div>
          </div>

          {/* Email Alerts Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Automated Email Alerts</div>
                  <div className="text-2xs text-slate-500 dark:text-slate-400">
                    Daily audit sends reminder if deadline approaches or goal falls behind
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {emailAlerts && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                {errors.emailRecipient && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.emailRecipient}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Stored in High Yield 4.5% APY vault, reward for Q4 launch"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              {goalToEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
