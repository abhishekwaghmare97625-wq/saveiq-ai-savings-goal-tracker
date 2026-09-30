import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileCode,
  Copy,
  Check,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/storage';

interface GoogleSheetsHubProps {
  goals: SavingsGoal[];
}

export const GoogleSheetsHub: React.FC<GoogleSheetsHubProps> = ({ goals }) => {
  const [scriptCode, setScriptCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);

  useEffect(() => {
    fetchScript();
  }, []);

  const fetchScript = async () => {
    setLoadingScript(true);
    try {
      const res = await fetch('/api/automation/appsscript');
      const text = await res.text();
      setScriptCode(text);
    } catch (e) {
      console.error('Failed to load apps script:', e);
    } finally {
      setLoadingScript(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const generateCSV = (): string => {
    const headers = [
      'Goal ID',
      'Goal Name',
      'Category / Purpose',
      'Target Amount ($)',
      'Current Savings ($)',
      'Remaining ($)',
      'Progress (%)',
      'Deadline',
      'Days Remaining',
      'Email Alerts Active',
      'Recipient Email',
      'Priority',
      'Cadence',
    ];

    const rows = goals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100) || 0);
      const days = getDaysRemaining(g.deadline);
      return [
        `"${g.id}"`,
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.purpose}"`,
        g.targetAmount,
        g.currentAmount,
        remaining,
        `${percent}%`,
        `"${g.deadline}"`,
        days,
        g.emailAlerts ? 'TRUE' : 'FALSE',
        `"${g.emailRecipient}"`,
        `"${g.priority}"`,
        `"${g.contributionPlan}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleCopyCSV = () => {
    const csv = generateCSV();
    navigator.clipboard.writeText(csv);
    setCopiedCSV(true);
    setTimeout(() => setCopiedCSV(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SaveIQ_Goals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([scriptCode], { type: 'text/javascript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SaveIQ_Automation.gs');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Google Workspace Ecosystem</span>
              <span>·</span>
              <span>Google Sheets & Apps Script Automation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Google Sheets Synchronization & Apps Script Engine
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              SaveIQ pairs directly with Google Sheets for tabular ledger tracking, and Google Apps Script with automated time-driven triggers to audit deadlines and dispatch reminders via GmailApp.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              {copiedCSV ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCSV ? 'CSV Copied' : 'Copy CSV'}</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to Sheets (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Google Sheets Spreadsheet Mock View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs dark:shadow-lg transition-colors">
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              SaveIQ_SavingsGoals.gsheet (Live Sync View)
            </span>
          </div>
          <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
            {goals.length} rows tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-3 font-semibold">Goal Name</th>
                <th className="py-2.5 px-3 font-semibold">Purpose</th>
                <th className="py-2.5 px-3 font-semibold text-right">Target</th>
                <th className="py-2.5 px-3 font-semibold text-right">Saved</th>
                <th className="py-2.5 px-3 font-semibold text-right">Remaining</th>
                <th className="py-2.5 px-3 font-semibold text-right">Progress</th>
                <th className="py-2.5 px-3 font-semibold">Deadline</th>
                <th className="py-2.5 px-3 font-semibold text-right">Days Left</th>
                <th className="py-2.5 px-3 font-semibold">Alerts Active</th>
                <th className="py-2.5 px-3 font-semibold">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 tabular-nums">
              {goals.map((g) => {
                const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100) || 0);
                const days = getDaysRemaining(g.deadline);
                const isOverdue = percent < 100 && days < 0;
                const isApproaching = percent < 100 && days >= 0 && days <= 30;

                return (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{g.name}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">{g.purpose}</td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(g.targetAmount)}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(g.currentAmount)}</td>
                    <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400">{formatCurrency(remaining)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={percent >= 100 ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                        {percent}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{g.deadline}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : isApproaching ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                        {days}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={g.emailAlerts ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-600'}>
                        {g.emailAlerts ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-2xs px-1.5 py-0.5 rounded font-semibold ${
                          percent >= 100
                            ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400'
                            : isOverdue
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                            : isApproaching
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {percent >= 100 ? 'COMPLETED' : isOverdue ? 'OVERDUE' : isApproaching ? 'APPROACHING' : 'ON_TRACK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Step Setup Guide & Google Apps Script Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Guide */}
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 space-y-4 shadow-xs dark:shadow-none transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Google Apps Script Quick Setup
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 font-mono font-bold text-2xs">
                1
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Create Google Sheet:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Open <span className="text-emerald-600 dark:text-emerald-400 font-mono">sheets.new</span> and import the CSV exported above or let Apps Script format the sheet.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 font-mono font-bold text-2xs">
                2
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Open Apps Script:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Click <span className="font-semibold text-slate-800 dark:text-slate-200">Extensions &gt; Apps Script</span> in the Google Sheets menu.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 font-mono font-bold text-2xs">
                3
              </span>
              <div>
                <strong className="text-slate-900 dark:text-white">Paste Code & Run Trigger:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Paste the <span className="font-mono text-emerald-600 dark:text-emerald-400">SaveIQ_Automation.gs</span> code and run <span className="font-mono text-slate-800 dark:text-slate-200">createTimeDrivenDailyTrigger()</span> once. It sets up an automatic 8:00 AM daily check!
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-2xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
            GmailApp will automatically deliver HTML reminders to each goal's specified recipient when deadlines are &le; 30 days away.
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xs dark:shadow-none">
          <div className="px-5 py-3 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-white">
                SaveIQ_Automation.gs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadScript}
                className="px-2.5 py-1 text-xs text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/30 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download .gs</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 bg-slate-950 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-[380px] overflow-y-auto leading-relaxed select-all">
            {loadingScript ? (
              <div className="text-slate-500">Loading automation script...</div>
            ) : (
              <pre className="whitespace-pre font-mono">{scriptCode}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
