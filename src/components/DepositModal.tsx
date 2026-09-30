import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/storage';

interface DepositModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onConfirm: (goalId: string, amount: number, type: 'deposit' | 'withdrawal', note?: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  goal,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }
    if (type === 'withdrawal' && val > goal.currentAmount) {
      setError(`Cannot withdraw more than current balance (${formatCurrency(goal.currentAmount)})`);
      return;
    }
    onConfirm(goal.id, val, type, note.trim() || undefined);
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Update Goal Balance</h3>
            <div className="text-xs text-slate-500 dark:text-slate-400">{goal.name}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Segmented type switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('deposit');
                setError('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                type === 'deposit'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Deposit Funds</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('withdrawal');
                setError('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                type === 'withdrawal'
                  ? 'bg-white dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-slate-200 dark:border-rose-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw Funds</span>
            </button>
          </div>

          {/* Quick increment pills */}
          {type === 'deposit' && (
            <div className="flex gap-2">
              {[25, 50, 100, 250].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setAmount(quick.toString())}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +${quick}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="100.00"
                autoFocus
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            {error && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contribution Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Paycheck transfer, cashback bonus"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Current vs New preview */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs space-y-1 text-slate-600 dark:text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>Current Balance:</span>
              <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(goal.currentAmount)}</span>
            </div>
            {amount && !isNaN(parseFloat(amount)) && (
              <div className="flex justify-between font-bold">
                <span>Updated Balance:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    Math.max(
                      0,
                      type === 'deposit'
                        ? goal.currentAmount + parseFloat(amount)
                        : goal.currentAmount - parseFloat(amount)
                    )
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
