import React, { useState } from 'react';
import {
  BellRing,
  Mail,
  Clock,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import { AuditAlertRecord, SavingsGoal } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/storage';

interface AuditAlertsViewProps {
  goals: SavingsGoal[];
  alerts: AuditAlertRecord[];
  onTriggerAudit: () => void;
  isAuditing: boolean;
  onClearAlerts: () => void;
}

export const AuditAlertsView: React.FC<AuditAlertsViewProps> = ({
  goals,
  alerts,
  onTriggerAudit,
  isAuditing,
  onClearAlerts,
}) => {
  const [selectedAlertForPreview, setSelectedAlertForPreview] = useState<AuditAlertRecord | null>(null);

  const activeAlertGoals = goals.filter((g) => g.emailAlerts);
  const approachingGoals = goals.filter((g) => {
    const d = getDaysRemaining(g.deadline);
    return g.currentAmount < g.targetAmount && d >= 0 && d <= 30;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Scenario 3</span>
              <span>·</span>
              <span>Automated Daily Monitoring</span>
              <span>·</span>
              <span>Google Apps Script Sync</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Automated Deadline Alerts & Audit Engine
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              SaveIQ audits your savings goals daily. If a deadline approaches and remaining balances exist, automated email reminders are triggered directly to your inbox via Google Apps Script.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {alerts.length > 0 && (
              <button
                onClick={onClearAlerts}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-200 dark:border-slate-700/60"
              >
                Clear Log
              </button>
            )}
            <button
              onClick={onTriggerAudit}
              disabled={isAuditing}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing Goals...' : 'Execute Daily Audit Now'}</span>
            </button>
          </div>
        </div>

        {/* Audit Status Counters */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200 dark:border-slate-700/60 font-mono text-xs tabular-nums">
          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 font-sans">Monitored Goals</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {activeAlertGoals.length} / {goals.length}
            </div>
            <div className="text-2xs text-slate-400 dark:text-slate-500 font-sans">email alerts enabled</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 font-sans">Deadlines &le; 30 Days</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
              {approachingGoals.length}
            </div>
            <div className="text-2xs text-slate-400 dark:text-slate-500 font-sans">eligible for reminders</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 font-sans">Dispatched Reminders</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {alerts.length}
            </div>
            <div className="text-2xs text-slate-400 dark:text-slate-500 font-sans">logged in audit history</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 font-sans">Automation Service</div>
            <div className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1 font-sans text-sm">
              Apps Script Daily 8 AM
            </div>
            <div className="text-2xs text-slate-400 dark:text-slate-500 font-sans">Google Sheets cron trigger</div>
          </div>
        </div>
      </div>

      {/* Dispatched Alerts History Table */}
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs dark:shadow-none transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Audit Notifications & Email Dispatches
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {alerts.length} record{alerts.length === 1 ? '' : 's'}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
              No audit alerts generated yet
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Click "Execute Daily Audit Now" to simulate today's deadline check across all active savings goals.
            </p>
            <button
              onClick={onTriggerAudit}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Automated Audit</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-mono font-semibold border ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                          : alert.severity === 'Approaching'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : alert.severity === 'Overdue'
                          ? 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40'
                          : 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30'
                      }`}
                    >
                      {alert.severity}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400">To: <strong className="text-slate-800 dark:text-slate-200">{alert.recipient}</strong></span>
                    <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">·</span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-2xs">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight truncate">
                    {alert.subject}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                    {alert.body}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block font-mono text-xs">
                    <div className="text-slate-800 dark:text-slate-200 font-bold">
                      {formatCurrency(alert.remainingAmount)} left
                    </div>
                    <div className="text-2xs text-slate-500 dark:text-slate-400">
                      {alert.percentComplete}% funded
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAlertForPreview(alert)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Email</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gmail Live Dispatch Preview Modal */}
      {selectedAlertForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transition-colors">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gmail Message Preview</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Dispatched via Google Apps Script (GmailApp.sendEmail)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertForPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Header Meta */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex">
                  <span className="w-16 text-slate-400 font-mono">From:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">SaveIQ Automated Monitor &lt;alerts@saveiq.ai&gt;</span>
                </div>
                <div className="flex">
                  <span className="w-16 text-slate-400 font-mono">To:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{selectedAlertForPreview.recipient}</span>
                </div>
                <div className="flex">
                  <span className="w-16 text-slate-400 font-mono">Date:</span>
                  <span>{new Date(selectedAlertForPreview.timestamp).toUTCString()}</span>
                </div>
                <div className="flex">
                  <span className="w-16 text-slate-400 font-mono">Subject:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedAlertForPreview.subject}</span>
                </div>
              </div>

              {/* Email Styled Body */}
              <div className="border border-slate-200 bg-white text-slate-900 rounded-xl p-5 text-sm space-y-4 shadow-sm">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <span className="font-bold text-slate-900 tracking-tight text-base">
                    SaveIQ AI Savings Tracker
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Automated Alert</span>
                </div>

                <div className="space-y-3 text-slate-700 leading-relaxed text-xs sm:text-sm">
                  <p>{selectedAlertForPreview.body}</p>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 font-mono text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Goal Target:</span>
                      <strong className="text-slate-900">{formatCurrency(selectedAlertForPreview.remainingAmount + (selectedAlertForPreview.percentComplete > 0 ? (selectedAlertForPreview.remainingAmount / (100 - selectedAlertForPreview.percentComplete)) * selectedAlertForPreview.percentComplete : 0))}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Deficit:</span>
                      <strong className="text-rose-600">{formatCurrency(selectedAlertForPreview.remainingAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Days to Deadline:</span>
                      <strong>{selectedAlertForPreview.daysRemaining > 0 ? `${selectedAlertForPreview.daysRemaining} days` : 'Overdue'}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    This automated monitoring notice was generated and dispatched by SaveIQ's automated Google Apps Script cron trigger.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-3 text-2xs text-slate-500 flex items-center justify-between">
                  <span>Engineered by Abhishek Waghmare</span>
                  <span>SaveIQ Personal Finance AI</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                onClick={() => setSelectedAlertForPreview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
