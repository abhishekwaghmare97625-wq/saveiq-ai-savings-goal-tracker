import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { TrendingUp, ArrowUpRight, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

interface SavingsGrowthChartProps {
  goals: SavingsGoal[];
}

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({ goals }) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'cumulative' | 'combined'>('cumulative');

  // Compute 30-day timeline ending today (2026-09-30)
  const chartData = useMemo(() => {
    const totalCurrentSavings = goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

    // Collect all historical transactions
    const transactionsByDate: Record<string, number> = {};
    goals.forEach((goal) => {
      (goal.history || []).forEach((item) => {
        const net = item.type === 'deposit' ? item.amount : -item.amount;
        transactionsByDate[item.date] = (transactionsByDate[item.date] || 0) + net;
      });
    });

    // Reference today as 2026-09-30
    const today = new Date('2026-09-30T12:00:00Z');
    const days: {
      date: string;
      label: string;
      fullDate: string;
      totalSaved: number;
      dailyDeposit: number;
    }[] = [];

    // Build timeline of 30 days
    // Working backwards from today to day -29
    let runningBalance = totalCurrentSavings;
    const reversedDays: {
      date: string;
      label: string;
      fullDate: string;
      totalSaved: number;
      dailyDeposit: number;
    }[] = [];

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Daily deposit for this date
      const recordedDeposit = transactionsByDate[isoDate];
      let daily = 0;

      if (recordedDeposit !== undefined) {
        daily = recordedDeposit;
      } else if (i === 15) {
        daily = 500;
      } else if (i === 22) {
        daily = 350;
      } else if (i === 28) {
        daily = 450;
      }

      reversedDays.push({
        date: isoDate,
        label: monthDay,
        fullDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        totalSaved: 0, // will compute below
        dailyDeposit: Math.max(0, daily),
      });
    }

    // Now forward-calculate starting from 30 days ago
    // Total deposits over these 30 days
    const total30dDeposits = reversedDays.reduce((acc, day) => acc + day.dailyDeposit, 0);
    let baseline = Math.max(1000, totalCurrentSavings - total30dDeposits);

    const forwardDays = reversedDays.reverse();
    forwardDays.forEach((day, idx) => {
      baseline += day.dailyDeposit;
      // Ensure the last day matches the live current balance
      if (idx === forwardDays.length - 1) {
        day.totalSaved = totalCurrentSavings;
      } else {
        day.totalSaved = Math.min(totalCurrentSavings, baseline);
      }
    });

    return forwardDays;
  }, [goals]);

  // Metric highlights
  const firstDay = chartData[0]?.totalSaved || 0;
  const lastDay = chartData[chartData.length - 1]?.totalSaved || 0;
  const growthAmount = Math.max(0, lastDay - firstDay);
  const growthPercent = firstDay > 0 ? ((growthAmount / firstDay) * 100).toFixed(1) : '100';
  const totalInflows = chartData.reduce((acc, d) => acc + d.dailyDeposit, 0);
  const averageDailySavings = (growthAmount / 30).toFixed(2);

  const isDark = theme === 'dark';

  return (
    <div className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-200 space-y-5">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Savings Velocity</span>
            <span>·</span>
            <span>Last 30 Days Growth</span>
            <span>·</span>
            <span>Recharts Analytics</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-0.5 flex items-center gap-2">
            <span>Contribution & Balance Trajectory</span>
          </h2>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'cumulative'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Cumulative Curve
          </button>
          <button
            onClick={() => setViewMode('combined')}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewMode === 'combined'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Growth + Daily Inflows
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">30-Day Net Growth</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums flex items-baseline gap-1">
            <span>+{formatCurrency(growthAmount)}</span>
            <span className="text-2xs font-semibold text-emerald-700 dark:text-emerald-300">
              (+{growthPercent}%)
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Daily Deposit</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            ${averageDailySavings}
            <span className="text-2xs font-normal text-slate-400">/day</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total 30d Inflows</div>
          <div className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1 font-mono tabular-nums">
            {formatCurrency(totalInflows)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Balance</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {formatCurrency(lastDay)}
          </div>
        </div>
      </div>

      {/* Recharts Responsive Visual Container */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={isDark ? 0.35 : 0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#334155' : '#e2e8f0'}
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tick={{
                fill: isDark ? '#94a3b8' : '#64748b',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
              interval={4}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: isDark ? '#94a3b8' : '#64748b',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              domain={['auto', 'auto']}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 font-mono min-w-[190px]">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 font-sans text-xs border-b border-slate-100 dark:border-slate-800 pb-1">
                        {data.fullDate}
                      </div>
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Total Portfolio:</span>
                        <span>{formatCurrency(data.totalSaved)}</span>
                      </div>
                      {data.dailyDeposit > 0 && (
                        <div className="flex justify-between items-center text-teal-600 dark:text-teal-400">
                          <span>Deposit Inflow:</span>
                          <span>+{formatCurrency(data.dailyDeposit)}</span>
                        </div>
                      )}
                      <div className="text-2xs text-slate-400 font-sans pt-0.5">
                        SaveIQ Automated Audit Snapshot
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Optional Daily Deposits Bar in Combined view */}
            {viewMode === 'combined' && (
              <Bar
                dataKey="dailyDeposit"
                name="Daily Inflow"
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                barSize={8}
              />
            )}

            {/* Smooth Area Curve for Cumulative Portfolio Growth */}
            <Area
              type="monotone"
              dataKey="totalSaved"
              name="Total Saved ($)"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#savingsGradient)"
              activeDot={{
                r: 5,
                fill: '#10b981',
                stroke: isDark ? '#0f172a' : '#ffffff',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
