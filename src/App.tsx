/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Layers,
} from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { DashboardKPIs } from './components/DashboardKPIs';
import { SavingsGrowthChart } from './components/SavingsGrowthChart';
import { GoalCard } from './components/GoalCard';
import { GoalModal } from './components/GoalModal';
import { DepositModal } from './components/DepositModal';
import { AIAdviceModal } from './components/AIAdviceModal';
import { AbhishekBot } from './components/AbhishekBot';
import { AuditAlertsView } from './components/AuditAlertsView';
import { GoogleSheetsHub } from './components/GoogleSheetsHub';
import { SavingsGoal, AuditAlertRecord, AIRecommendation, GoalCategory } from './types';
import {
  loadSavedGoals,
  saveGoals,
  loadSavedAlerts,
  saveAlerts,
  formatCurrency,
  getDaysRemaining,
} from './utils/storage';

function SaveIQApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'bot' | 'audits' | 'sheets'>('dashboard');
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [alerts, setAlerts] = useState<AuditAlertRecord[]>([]);

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'approaching' | 'overdue'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'target' | 'name'>('deadline');

  // Modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeAIGoal, setActiveAIGoal] = useState<SavingsGoal | null>(null);
  const [currentAIAdvice, setCurrentAIAdvice] = useState<AIRecommendation | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const [isAuditing, setIsAuditing] = useState(false);
  const [botGoalContext, setBotGoalContext] = useState<SavingsGoal | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    const loadedGoals = loadSavedGoals();
    setGoals(loadedGoals);
    const loadedAlerts = loadSavedAlerts();
    setAlerts(loadedAlerts);
  }, []);

  const handleUpdateGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  };

  const handleSaveGoal = (goalData: Partial<SavingsGoal>) => {
    if (goalToEdit) {
      const updated = goals.map((g) => (g.id === goalToEdit.id ? { ...g, ...goalData } : g));
      handleUpdateGoals(updated);
      showToast(`Goal "${goalData.name}" updated successfully.`);
    } else {
      const newGoal: SavingsGoal = {
        id: 'goal-' + Date.now(),
        name: goalData.name || 'New Goal',
        targetAmount: goalData.targetAmount || 1000,
        currentAmount: goalData.currentAmount || 0,
        deadline: goalData.deadline || new Date().toISOString().split('T')[0],
        emailAlerts: goalData.emailAlerts ?? true,
        emailRecipient: goalData.emailRecipient || 'abhishekwaghmare97625@gmail.com',
        purpose: (goalData.purpose as GoalCategory) || 'Emergency Fund',
        priority: goalData.priority || 'Medium',
        contributionPlan: goalData.contributionPlan || 'Monthly',
        notes: goalData.notes,
        createdAt: new Date().toISOString().split('T')[0],
        history:
          goalData.currentAmount && goalData.currentAmount > 0
            ? [
                {
                  id: 'h-' + Date.now(),
                  date: new Date().toISOString().split('T')[0],
                  amount: goalData.currentAmount,
                  type: 'deposit',
                  note: 'Initial deposit',
                },
              ]
            : [],
      };
      handleUpdateGoals([newGoal, ...goals]);
      showToast(`Goal "${newGoal.name}" created and added to automated monitoring!`);
    }
    setGoalToEdit(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    const g = goals.find((item) => item.id === goalId);
    if (!window.confirm(`Are you sure you want to remove the goal "${g?.name || 'this goal'}"?`)) {
      return;
    }
    const updated = goals.filter((item) => item.id !== goalId);
    handleUpdateGoals(updated);
    showToast('Savings goal removed.');
  };

  const handleQuickDeposit = (goal: SavingsGoal, addAmount: number) => {
    const updated = goals.map((g) => {
      if (g.id === goal.id) {
        const newBalance = g.currentAmount + addAmount;
        return {
          ...g,
          currentAmount: newBalance,
          history: [
            ...g.history,
            {
              id: 'h-' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              amount: addAmount,
              type: 'deposit' as const,
              note: `Quick deposit +$${addAmount}`,
            },
          ],
        };
      }
      return g;
    });
    handleUpdateGoals(updated);
    showToast(`Added ${formatCurrency(addAmount)} to ${goal.name}!`);
  };

  const handleConfirmDeposit = (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newBalance =
          type === 'deposit'
            ? g.currentAmount + amount
            : Math.max(0, g.currentAmount - amount);
        return {
          ...g,
          currentAmount: newBalance,
          history: [
            ...g.history,
            {
              id: 'h-' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              amount,
              type,
              note: note || (type === 'deposit' ? 'Manual deposit' : 'Manual withdrawal'),
            },
          ],
        };
      }
      return g;
    });
    handleUpdateGoals(updated);
    showToast(
      `${type === 'deposit' ? 'Deposited' : 'Withdrew'} ${formatCurrency(amount)} for ${
        goals.find((x) => x.id === goalId)?.name
      }.`
    );
  };

  const handleOpenAIAdvice = async (goal: SavingsGoal) => {
    setActiveAIGoal(goal);
    setIsAIModalOpen(true);
    fetchAIAdvice(goal);
  };

  const fetchAIAdvice = async (goal: SavingsGoal) => {
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      const data = await response.json();
      setCurrentAIAdvice(data);

      const updated = goals.map((g) => (g.id === goal.id ? { ...g, aiAdvice: data } : g));
      handleUpdateGoals(updated);
    } catch (err) {
      console.error('Error fetching AI advice:', err);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleTriggerAudit = async () => {
    setIsAuditing(true);
    try {
      const response = await fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals, forceAuditAll: true }),
      });
      const data = await response.json();
      if (data.alerts && Array.isArray(data.alerts)) {
        setAlerts((prev) => {
          const combined = [...data.alerts, ...prev].slice(0, 50);
          saveAlerts(combined);
          return combined;
        });
        showToast(
          `Daily audit complete: Checked ${data.totalGoalsAudited} goals, ${data.alertsGenerated} automated alerts generated.`
        );
      }
    } catch (err) {
      console.error('Audit error:', err);
      showToast('Completed audit locally.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleClearAlerts = () => {
    setAlerts([]);
    saveAlerts([]);
    showToast('Audit dispatch history cleared.');
  };

  const filteredGoals = goals
    .filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterCategory !== 'all' && g.purpose !== filterCategory) {
        return false;
      }

      const days = getDaysRemaining(g.deadline);
      const isCompleted = g.currentAmount >= g.targetAmount;
      const isOverdue = !isCompleted && days < 0;
      const isApproaching = !isCompleted && days >= 0 && days <= 30;

      if (filterStatus === 'active') return !isCompleted && !isOverdue;
      if (filterStatus === 'completed') return isCompleted;
      if (filterStatus === 'approaching') return isApproaching;
      if (filterStatus === 'overdue') return isOverdue;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'progress') {
        const pA = a.currentAmount / a.targetAmount;
        const pB = b.currentAmount / b.targetAmount;
        return pB - pA;
      }
      if (sortBy === 'target') {
        return b.targetAmount - a.targetAmount;
      }
      return a.name.localeCompare(b.name);
    });

  const uniqueCategories = Array.from(new Set(goals.map((g) => g.purpose)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation TopBar with Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewGoalModal={() => {
          setGoalToEdit(null);
          setIsGoalModalOpen(true);
        }}
        onRunAudit={handleTriggerAudit}
        alertCount={alerts.length}
      />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white border border-emerald-500/40 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Scenario 4: Financial Dashboard Monitoring KPIs */}
            <DashboardKPIs
              goals={goals}
              onOpenNewGoal={() => {
                setGoalToEdit(null);
                setIsGoalModalOpen(true);
              }}
            />

            {/* Visual Contribution Progress Chart (Last 30 Days Growth using Recharts) */}
            <SavingsGrowthChart goals={goals} />

            {/* Quick Actions & Category Distribution Visual Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category allocation breakdown */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 space-y-4 shadow-xs dark:shadow-none transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Savings Allocation by Category</h3>
                  </div>
                  <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
                    {goals.length} total goals
                  </span>
                </div>

                <div className="space-y-3">
                  {uniqueCategories.map((cat) => {
                    const catGoals = goals.filter((g) => g.purpose === cat);
                    const catTarget = catGoals.reduce((acc, g) => acc + g.targetAmount, 0);
                    const catSaved = catGoals.reduce((acc, g) => acc + g.currentAmount, 0);
                    const catPct = catTarget > 0 ? Math.min(100, Math.round((catSaved / catTarget) * 100)) : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{cat}</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(catSaved)}</strong> / {formatCurrency(catTarget)} ({catPct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bot Abhishek Quick Callout Card */}
              <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 flex flex-col justify-between shadow-xs dark:shadow-none transition-colors">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                    <Bot className="w-4 h-4" />
                    <span>Abhishek Waghmare AI Bot</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Lead Financial Advisor
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Have questions about prioritizing your Emergency Fund, calculating daily deposit velocity, or configuring your Google Sheets Apps Script trigger?
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setActiveTab('bot')}
                    className="w-full py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Chat with Abhishek Waghmare</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Goals Directory Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Active Savings Goals
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing {filteredGoals.length} of {goals.length} financial goals
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search goals..."
                      className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-36 sm:w-44 transition-colors"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="deadline">Deadline (Soonest)</option>
                    <option value="progress">Progress (% High)</option>
                    <option value="target">Target ($ High)</option>
                    <option value="name">Goal Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Status Segmented Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg w-fit shadow-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  All Goals ({goals.length})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-slate-700 dark:text-emerald-400 dark:border-transparent shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Active ({goals.filter((g) => g.currentAmount < g.targetAmount && getDaysRemaining(g.deadline) >= 0).length})
                </button>
                <button
                  onClick={() => setFilterStatus('approaching')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterStatus === 'approaching'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-slate-700 dark:text-amber-400 dark:border-transparent shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Due &le; 30 Days ({goals.filter((g) => {
                    const d = getDaysRemaining(g.deadline);
                    return g.currentAmount < g.targetAmount && d >= 0 && d <= 30;
                  }).length})
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterStatus === 'completed'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-slate-700 dark:text-teal-400 dark:border-transparent shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Completed ({goals.filter((g) => g.currentAmount >= g.targetAmount).length})
                </button>
                <button
                  onClick={() => setFilterStatus('overdue')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterStatus === 'overdue'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-slate-700 dark:text-rose-400 dark:border-transparent shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Overdue ({goals.filter((g) => g.currentAmount < g.targetAmount && getDaysRemaining(g.deadline) < 0).length})
                </button>
              </div>

              {/* Goals Cards Grid */}
              {filteredGoals.length === 0 ? (
                <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    No savings goals match your filters
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Try adjusting your search criteria or create a new savings goal.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterCategory('all');
                    }}
                    className="px-3.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onOpenDeposit={(g) => {
                        setActiveDepositGoal(g);
                        setIsDepositModalOpen(true);
                      }}
                      onQuickDeposit={handleQuickDeposit}
                      onOpenAIAdvice={handleOpenAIAdvice}
                      onEdit={(g) => {
                        setGoalToEdit(g);
                        setIsGoalModalOpen(true);
                      }}
                      onDelete={handleDeleteGoal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GOALS DIRECTORY */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Goals Directory & Ledger
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Manage all savings targets, review contribution velocity, and configure alert triggers.
                </p>
              </div>
              <button
                onClick={() => {
                  setGoalToEdit(null);
                  setIsGoalModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onOpenDeposit={(g) => {
                    setActiveDepositGoal(g);
                    setIsDepositModalOpen(true);
                  }}
                  onQuickDeposit={handleQuickDeposit}
                  onOpenAIAdvice={handleOpenAIAdvice}
                  onEdit={(g) => {
                    setGoalToEdit(g);
                    setIsGoalModalOpen(true);
                  }}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOT ABHISHEK WAGHMARE */}
        {activeTab === 'bot' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">AI Financial Copilot</span>
                <span>·</span>
                <span>Abhishek Waghmare</span>
                <span>·</span>
                <span>SaveIQ Lead Advisor</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                Chat with Abhishek Waghmare
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Your dedicated AI personal finance advisor. Analyzes portfolio allocations, computes daily velocity rates, recommends budget cuts, and helps you optimize deadlines.
              </p>
            </div>

            <AbhishekBot goals={goals} initialGoalContext={botGoalContext} />
          </div>
        )}

        {/* TAB 4: AUTOMATED AUDITS (Scenario 3) */}
        {activeTab === 'audits' && (
          <AuditAlertsView
            goals={goals}
            alerts={alerts}
            onTriggerAudit={handleTriggerAudit}
            isAuditing={isAuditing}
            onClearAlerts={handleClearAlerts}
          />
        )}

        {/* TAB 5: GOOGLE SHEETS & APPS SCRIPT */}
        {activeTab === 'sheets' && (
          <GoogleSheetsHub goals={goals} />
        )}
      </main>

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        goal={activeDepositGoal}
        onClose={() => {
          setIsDepositModalOpen(false);
          setActiveDepositGoal(null);
        }}
        onConfirm={handleConfirmDeposit}
      />

      <AIAdviceModal
        isOpen={isAIModalOpen}
        goal={activeAIGoal}
        advice={currentAIAdvice}
        isLoading={isAILoading}
        onClose={() => {
          setIsAIModalOpen(false);
          setActiveAIGoal(null);
          setCurrentAIAdvice(null);
        }}
        onRefreshAdvice={fetchAIAdvice}
        onOpenBotChatWithGoal={(goal) => {
          setBotGoalContext(goal);
          setActiveTab('bot');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SaveIQApp />
    </ThemeProvider>
  );
}
