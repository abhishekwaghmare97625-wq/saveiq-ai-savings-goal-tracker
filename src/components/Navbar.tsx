import React from 'react';
import { Plus, BellRing, Bot, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'goals' | 'bot' | 'audits' | 'sheets';
  onSelectTab: (tab: 'dashboard' | 'goals' | 'bot' | 'audits' | 'sheets') => void;
  onOpenNewGoalModal: () => void;
  onRunAudit: () => void;
  alertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewGoalModal,
  onRunAudit,
  alertCount,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>SaveIQ</span>
          </a>
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors relative py-1 ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Dashboard
            {activeTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onSelectTab('goals')}
            className={`transition-colors relative py-1 ${
              activeTab === 'goals'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Goals Directory
            {activeTab === 'goals' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onSelectTab('bot')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'bot'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Abhishek Bot</span>
            {activeTab === 'bot' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onSelectTab('audits')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'audits'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Automated Audits</span>
            {alertCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono rounded border border-amber-500/20">
                {alertCount}
              </span>
            )}
            {activeTab === 'audits' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onSelectTab('sheets')}
            className={`transition-colors relative py-1 ${
              activeTab === 'sheets'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Google Sheets & Apps Script
            {activeTab === 'sheets' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary actions + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          <button
            onClick={onRunAudit}
            title="Execute daily automated deadline inspection"
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Run Daily Audit</span>
          </button>

          <button
            onClick={onOpenNewGoalModal}
            className="px-3.5 py-2 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800/80 px-2 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`py-1 px-2 ${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('goals')}
          className={`py-1 px-2 ${activeTab === 'goals' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}
        >
          Goals
        </button>
        <button
          onClick={() => onSelectTab('bot')}
          className={`py-1 px-2 flex items-center gap-1 ${activeTab === 'bot' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}
        >
          <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Bot
        </button>
        <button
          onClick={() => onSelectTab('audits')}
          className={`py-1 px-2 ${activeTab === 'audits' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}
        >
          Audits {alertCount > 0 && `(${alertCount})`}
        </button>
        <button
          onClick={() => onSelectTab('sheets')}
          className={`py-1 px-2 ${activeTab === 'sheets' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}
        >
          Sheets
        </button>
      </div>
    </header>
  );
};
