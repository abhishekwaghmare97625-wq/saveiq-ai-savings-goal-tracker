import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper: Calculate deterministic financial metrics
function calculateFinancialMath(goal: {
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}) {
  const now = new Date();
  const deadlineDate = new Date(goal.deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const percentComplete = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0);

  const requiredDaily = +(remainingAmount / daysRemaining).toFixed(2);
  const requiredWeekly = +(requiredDaily * 7).toFixed(2);
  const requiredMonthly = +(requiredDaily * 30.4).toFixed(2);

  let riskLevel: 'On Track' | 'Needs Attention' | 'At Risk' = 'On Track';
  let feasibilityScore = 85;

  if (daysRemaining <= 7 && percentComplete < 80) {
    riskLevel = 'At Risk';
    feasibilityScore = 35;
  } else if (daysRemaining <= 30 && percentComplete < 60) {
    riskLevel = 'Needs Attention';
    feasibilityScore = 60;
  } else if (percentComplete >= 90) {
    riskLevel = 'On Track';
    feasibilityScore = 98;
  }

  return {
    daysRemaining,
    remainingAmount,
    percentComplete,
    requiredDaily,
    requiredWeekly,
    requiredMonthly,
    riskLevel,
    feasibilityScore,
  };
}

// 1. AI Financial Recommendations endpoint (Scenario 2)
app.post('/api/ai/advice', async (req, res) => {
  const { goal } = req.body;
  if (!goal) {
    return res.status(400).json({ error: 'Goal data is required' });
  }

  const math = calculateFinancialMath(goal);

  // If Gemini is available, generate tailored financial strategy
  if (ai) {
    try {
      const prompt = `You are Abhishek Waghmare, Chief Financial Strategist for SaveIQ.
Analyze this savings goal and provide personalized, highly tactical financial guidance:
Goal Name: ${goal.name}
Purpose/Category: ${goal.purpose}
Target Amount: $${goal.targetAmount}
Current Amount: $${goal.currentAmount} (${math.percentComplete}% achieved)
Remaining Amount: $${math.remainingAmount}
Deadline: ${goal.deadline} (${math.daysRemaining} days left)
Required Savings: $${math.requiredDaily}/day, $${math.requiredWeekly}/week, $${math.requiredMonthly}/month.
Calculated Risk Level: ${math.riskLevel}

Respond with a JSON object strictly following this structure:
{
  "summary": "2-3 concise, high-impact analytical sentences evaluating their progress, trajectory, and realistic achievement horizon.",
  "feasibilityScore": number between 10 and 100,
  "riskLevel": "${math.riskLevel}",
  "requiredDaily": ${math.requiredDaily},
  "requiredWeekly": ${math.requiredWeekly},
  "requiredMonthly": ${math.requiredMonthly},
  "tacticalAdvice": [
    "Specific micro-action 1 (e.g. automated transfer, paycheck split)",
    "Specific behavioral budgeting tip 2",
    "Specific milestone acceleration strategy 3"
  ],
  "suggestedBudgetTrim": [
    "Targeted category expense cut (e.g., dining out, redundant subscriptions)",
    "Secondary expense optimization opportunity"
  ],
  "milestoneCheckpoints": [
    {"label": "25% Target Checkpoint", "date": "Date string", "targetCumulative": number},
    {"label": "50% Midpoint Rebalance", "date": "Date string", "targetCumulative": number},
    {"label": "Final Target Completion", "date": "${goal.deadline}", "targetCumulative": ${goal.targetAmount}}
  ]
}
Output ONLY valid JSON.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = aiResponse.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        modelUsed: 'Groq / Gemini Flash AI (SaveIQ Engine)',
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('AI generation error, using deterministic smart fallback:', err);
    }
  }

  // Deterministic robust fallback if offline or quota exceeded
  const targetDate = new Date(goal.deadline);
  const midDate = new Date(Date.now() + (targetDate.getTime() - Date.now()) / 2);

  res.json({
    summary: `To achieve "${goal.name}" on schedule by ${goal.deadline}, you need to preserve a weekly saving velocity of $${math.requiredWeekly}. You are currently at ${math.percentComplete}% of your $${goal.targetAmount.toLocaleString()} target, leaving $${math.remainingAmount.toLocaleString()} remaining across the next ${math.daysRemaining} days.`,
    feasibilityScore: math.feasibilityScore,
    riskLevel: math.riskLevel,
    requiredDaily: math.requiredDaily,
    requiredWeekly: math.requiredWeekly,
    requiredMonthly: math.requiredMonthly,
    tacticalAdvice: [
      `Set up an automated recurring transfer of $${math.requiredWeekly} every Monday into a dedicated high-yield savings vault.`,
      `Implement the 24-hour waiting rule for non-essential impulse buys over $50 to redirect discretionary cash to ${goal.name}.`,
      `Allocate any unexpected cash inflows (tax refunds, bonuses, cashbacks) directly to close the $${math.remainingAmount.toLocaleString()} gap faster.`,
    ],
    suggestedBudgetTrim: [
      'Audit monthly recurring digital subscriptions and streaming plans to liberate $35–$60/month.',
      'Prepare home lunches 2 extra days each week to direct an estimated $120/month straight into this goal.',
    ],
    milestoneCheckpoints: [
      {
        label: 'Halfway Momentum Check',
        date: midDate.toISOString().split('T')[0],
        targetCumulative: +(goal.targetAmount * 0.5).toFixed(2),
      },
      {
        label: '80% Safety Threshold',
        date: new Date(Date.now() + (targetDate.getTime() - Date.now()) * 0.8).toISOString().split('T')[0],
        targetCumulative: +(goal.targetAmount * 0.8).toFixed(2),
      },
      {
        label: 'Final Target Completion',
        date: goal.deadline,
        targetCumulative: goal.targetAmount,
      },
    ],
    modelUsed: 'SaveIQ Financial Analytics Engine',
    generatedAt: new Date().toISOString(),
  });
});

// 2. Interactive AI Financial Bot "Abhishek Waghmare" (Bot Abhishek Waghmare)
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, goalsContext } = req.body;

  const goalsSummary = Array.isArray(goalsContext)
    ? goalsContext
        .map(
          (g: any) =>
            `- ${g.name} (${g.purpose}): Saved $${g.currentAmount} / $${g.targetAmount} (${Math.round((g.currentAmount / g.targetAmount) * 100) || 0}%). Deadline: ${g.deadline}. Email Alerts: ${g.emailAlerts ? 'Active (' + g.emailRecipient + ')' : 'Off'}`
        )
        .join('\n')
    : 'No active goals yet.';

  const systemPrompt = `You are Abhishek Waghmare, the Lead Financial Strategist and Creator of SaveIQ – AI Savings Goal Tracker.
You possess deep expertise in personal finance, savings velocity, compound interest, debt snowball/avalanche, and Google Apps Script + Google Sheets automation.
You speak with professional warmth, clarity, analytical precision, and encouraging financial discipline.

Current User Goals Context:
${goalsSummary}

Instructions:
1. Provide actionable, mathematically grounded financial advice.
2. If the user asks about deadlines, calculate the daily or weekly amount needed.
3. If they ask about Google Apps Script or Google Sheets integration, explain how SaveIQ's Apps Script audits goals daily and sends Gmail reminders.
4. Keep responses structured with clean paragraphs, bullet points, or mini-tables when comparing figures.
5. Sign off as "Abhishek Waghmare · SaveIQ Lead Financial Advisor" when appropriate.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\nUser Question: ${message}`,
      });

      return res.json({ reply: response.text });
    } catch (err) {
      console.warn('Bot generation error, using fallback response:', err);
    }
  }

  // Intelligent fallback for offline / rate limited states
  const lowerMsg = (message || '').toLowerCase();
  let fallbackReply = `Hello! I'm Abhishek Waghmare, your SaveIQ financial strategist. 

Looking at your goals portfolio, you currently have ${Array.isArray(goalsContext) ? goalsContext.length : 0} savings goals being monitored.

Here is my key recommendation:
• **Priority Alignment**: Always protect your Emergency Fund first with at least 3 months of basic living costs.
• **Automated Velocity**: For fixed deadline goals like a Laptop or Vacation, divide the remaining balance by the weeks left and schedule auto-transfers on payday.
• **Deadline Safeguard**: Ensure email alerts are toggled on so our daily automated audit triggers Gmail alerts before deadlines approach!

Feel free to ask me about calculating your daily savings rate, prioritizing conflicting goals, or deploying your Google Apps Script trigger!

— Abhishek Waghmare · SaveIQ Lead Financial Advisor`;

  if (lowerMsg.includes('sheet') || lowerMsg.includes('apps script') || lowerMsg.includes('script')) {
    fallbackReply = `Great question on Google Sheets & Apps Script automation!

SaveIQ includes a built-in automated auditing architecture:
1. **Google Sheets**: We store your Goal Name, Target Amount, Current Savings, Deadline, and Alert Email in rows.
2. **Google Apps Script**: A daily Time-Driven trigger (e.g. running at 8:00 AM) inspects the sheet.
3. **GmailApp Service**: If \`daysRemaining <= 7\` and the goal is incomplete, it automatically dispatches a formatted HTML alert directly to your inbox.

You can inspect and copy the ready-to-run script under the **Google Sheets & Apps Script** tab in SaveIQ!

— Abhishek Waghmare · SaveIQ Lead Financial Advisor`;
  }

  res.json({ reply: fallbackReply });
});

// 3. Automated Deadline Audit Runner (Scenario 3)
app.post('/api/audit/run', (req, res) => {
  const { goals } = req.body;
  if (!Array.isArray(goals)) {
    return res.status(400).json({ error: 'Goals array is required' });
  }

  const now = new Date();
  const alerts: any[] = [];

  goals.forEach((goal) => {
    if (!goal.emailAlerts && !req.body.forceAuditAll) return;

    const deadlineDate = new Date(goal.deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const percentComplete = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100) || 0);
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

    let severity: 'Approaching' | 'Critical' | 'Overdue' | 'Goal Completed' | null = null;
    let subject = '';
    let body = '';

    if (percentComplete >= 100) {
      severity = 'Goal Completed';
      subject = `🎉 Goal Achieved: ${goal.name} is 100% funded!`;
      body = `Congratulations! You have successfully reached your savings target of $${goal.targetAmount.toLocaleString()} for "${goal.name}". SaveIQ has marked this goal as Completed.`;
    } else if (daysRemaining < 0) {
      severity = 'Overdue';
      subject = `⚠️ SaveIQ Alert: "${goal.name}" deadline was ${Math.abs(daysRemaining)} days ago`;
      body = `Your savings goal "${goal.name}" passed its deadline on ${goal.deadline}. You have saved $${goal.currentAmount.toLocaleString()} of your $${goal.targetAmount.toLocaleString()} target ($${remainingAmount.toLocaleString()} remaining). Abhishek Waghmare recommends adjusting your timeline or reallocating budget to finalize this milestone.`;
    } else if (daysRemaining <= 7) {
      severity = 'Critical';
      subject = `🚨 Urgent Deadline Alert: "${goal.name}" is due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
      body = `Notice from SaveIQ Daily Audit: "${goal.name}" has only ${daysRemaining} days remaining until ${goal.deadline}. You have saved $${goal.currentAmount.toLocaleString()} (${percentComplete}%), with $${remainingAmount.toLocaleString()} left to save. A daily contribution of $${+(remainingAmount / Math.max(1, daysRemaining)).toFixed(2)} is required to finish on time.`;
    } else if (daysRemaining <= 30) {
      severity = 'Approaching';
      subject = `📅 Reminder: "${goal.name}" deadline approaching in ${daysRemaining} days`;
      body = `SaveIQ Automated Monitoring: Your goal "${goal.name}" is due on ${goal.deadline} (${daysRemaining} days left). Current progress: $${goal.currentAmount.toLocaleString()} of $${goal.targetAmount.toLocaleString()} (${percentComplete}%). You are on track if you maintain a weekly saving rate of $${+((remainingAmount / daysRemaining) * 7).toFixed(2)}.`;
    }

    if (severity) {
      alerts.push({
        id: 'alert_' + Math.random().toString(36).substring(2, 9),
        goalId: goal.id,
        goalName: goal.name,
        recipient: goal.emailRecipient || 'abhishekwaghmare97625@gmail.com',
        severity,
        daysRemaining,
        percentComplete,
        remainingAmount,
        subject,
        body,
        timestamp: new Date().toISOString(),
        channel: 'Email (Apps Script / Gmail)',
      });
    }
  });

  res.json({
    auditedAt: new Date().toISOString(),
    totalGoalsAudited: goals.length,
    alertsGenerated: alerts.length,
    alerts,
  });
});

// 4. Google Apps Script Code Generator (Scenario 3 & User System Requirement)
app.get('/api/automation/appsscript', (_req, res) => {
  const sampleScript = `/**
 * SaveIQ – AI Savings Goal Tracker
 * Automated Google Apps Script & Google Sheets Synchronization Engine
 * Developed for Abhishek Waghmare & SaveIQ Users
 *
 * Instructions:
 * 1. Open your Google Sheet where savings goals are tracked.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this script.
 * 4. Run 'createTimeDrivenDailyTrigger' once to enable daily automatic 8:00 AM deadline audits!
 */

// Configuration
const SAVEIQ_CONFIG = {
  SHEET_NAME: 'SavingsGoals',
  USER_EMAIL: 'abhishekwaghmare97625@gmail.com', // Default alert recipient
  DAILY_TRIGGER_HOUR: 8, // 8:00 AM Daily Audit
  ALERT_THRESHOLD_DAYS: 30, // Trigger warnings when deadline is within 30 days
  CRITICAL_THRESHOLD_DAYS: 7, // High urgency warning
};

/**
 * Initializes the Google Sheet with required headers if not already present
 */
function setupSaveIQSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SAVEIQ_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SAVEIQ_CONFIG.SHEET_NAME);
  }
  
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
    'Audit Status',
    'Last Audited'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  Logger.log('SaveIQ Google Sheet initialized successfully.');
}

/**
 * Daily Automated Audit Function
 * Checks deadlines, calculates savings deficits, and sends automated Gmail notifications.
 */
function runDailyDeadlineAudit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SAVEIQ_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    Logger.log('Sheet not found. Please run setupSaveIQSheet() first.');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    Logger.log('No savings goals found in sheet.');
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let alertsSent = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const goalName = row[1];
    const targetAmount = Number(row[3]) || 0;
    const currentAmount = Number(row[4]) || 0;
    const deadlineRaw = row[7];
    const alertsActive = String(row[9]).toLowerCase() === 'true' || String(row[9]).toLowerCase() === 'yes';
    const recipientEmail = row[10] || SAVEIQ_CONFIG.USER_EMAIL;
    
    if (!deadlineRaw) continue;
    
    const deadline = new Date(deadlineRaw);
    deadline.setHours(0, 0, 0, 0);
    
    const timeDiff = deadline.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const progressPercent = Math.min(100, Math.round((currentAmount / targetAmount) * 100) || 0);
    
    // Update live calculated columns
    sheet.getRange(i + 1, 6).setValue(remainingAmount);
    sheet.getRange(i + 1, 7).setValue(progressPercent + '%');
    sheet.getRange(i + 1, 9).setValue(daysRemaining);
    sheet.getRange(i + 1, 13).setValue(new Date().toISOString());
    
    if (progressPercent >= 100) {
      sheet.getRange(i + 1, 12).setValue('COMPLETED').setFontColor('#16a34a');
      continue;
    }
    
    if (!alertsActive) {
      sheet.getRange(i + 1, 12).setValue('ALERTS_DISABLED').setFontColor('#64748b');
      continue;
    }
    
    // Evaluate Alert Triggers
    if (daysRemaining < 0) {
      sheet.getRange(i + 1, 12).setValue('OVERDUE').setFontColor('#dc2626');
      sendOverdueAlert(goalName, recipientEmail, targetAmount, currentAmount, remainingAmount, deadline);
      alertsSent++;
    } else if (daysRemaining <= SAVEIQ_CONFIG.CRITICAL_THRESHOLD_DAYS) {
      sheet.getRange(i + 1, 12).setValue('CRITICAL_APPROACHING').setFontColor('#ea580c');
      sendCriticalAlert(goalName, recipientEmail, targetAmount, currentAmount, remainingAmount, daysRemaining, deadline);
      alertsSent++;
    } else if (daysRemaining <= SAVEIQ_CONFIG.ALERT_THRESHOLD_DAYS) {
      sheet.getRange(i + 1, 12).setValue('APPROACHING').setFontColor('#ca8a04');
      sendApproachingAlert(goalName, recipientEmail, targetAmount, currentAmount, remainingAmount, daysRemaining, deadline);
      alertsSent++;
    } else {
      sheet.getRange(i + 1, 12).setValue('ON_TRACK').setFontColor('#2563eb');
    }
  }
  
  Logger.log('Daily audit completed. Alerts dispatched: ' + alertsSent);
}

/**
 * Sends critical urgency alert via GmailApp
 */
function sendCriticalAlert(goalName, email, target, current, remaining, days, deadline) {
  const dailyRate = (remaining / Math.max(1, days)).toFixed(2);
  const subject = '🚨 [SaveIQ Critical Alert] "' + goalName + '" Deadline in ' + days + ' Day(s)!';
  const htmlBody = 
    '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">' +
    '<h2 style="color: #dc2626; margin-top: 0;">SaveIQ Urgent Deadline Notice</h2>' +
    '<p>Hello,</p>' +
    '<p>Your savings goal <strong>' + goalName + '</strong> is due on <strong>' + deadline.toDateString() + '</strong> (' + days + ' days left).</p>' +
    '<div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">' +
    '<p style="margin: 4px 0;"><strong>Target Amount:</strong> $' + target.toLocaleString() + '</p>' +
    '<p style="margin: 4px 0;"><strong>Current Savings:</strong> $' + current.toLocaleString() + '</p>' +
    '<p style="margin: 4px 0; color: #dc2626;"><strong>Remaining Balance:</strong> $' + remaining.toLocaleString() + '</p>' +
    '<p style="margin: 4px 0;"><strong>Required Daily Contribution:</strong> $' + dailyRate + ' / day</p>' +
    '</div>' +
    '<p>To hit your target on schedule, please review your discretionary spending or execute a manual deposit today.</p>' +
    '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">' +
    '<p style="font-size: 12px; color: #64748b;">SaveIQ AI Goal Tracker · Engineered by Abhishek Waghmare</p>' +
    '</div>';
    
  GmailApp.sendEmail(email, subject, 'Critical Goal Reminder for ' + goalName, { htmlBody: htmlBody });
}

function sendApproachingAlert(goalName, email, target, current, remaining, days, deadline) {
  const weeklyRate = ((remaining / days) * 7).toFixed(2);
  const subject = '📅 [SaveIQ Reminder] "' + goalName + '" Due in ' + days + ' Days';
  const htmlBody = 
    '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">' +
    '<h2 style="color: #2563eb; margin-top: 0;">SaveIQ Approaching Deadline</h2>' +
    '<p>Your savings goal <strong>' + goalName + '</strong> deadline is approaching on <strong>' + deadline.toDateString() + '</strong>.</p>' +
    '<p>Remaining gap: <strong>$' + remaining.toLocaleString() + '</strong>. Maintain a savings pace of <strong>$' + weeklyRate + '/week</strong> to succeed.</p>' +
    '<p style="font-size: 12px; color: #64748b; margin-top: 24px;">Automated alert from SaveIQ · Abhishek Waghmare</p>' +
    '</div>';
    
  GmailApp.sendEmail(email, subject, 'SaveIQ Reminder for ' + goalName, { htmlBody: htmlBody });
}

function sendOverdueAlert(goalName, email, target, current, remaining, deadline) {
  const subject = '⚠️ [SaveIQ Notice] Goal "' + goalName + '" has passed its deadline';
  const htmlBody = 
    '<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #fee2e2; border-radius: 8px;">' +
    '<h2 style="color: #b91c1c; margin-top: 0;">Goal Deadline Reached</h2>' +
    '<p>The deadline for <strong>' + goalName + '</strong> was ' + deadline.toDateString() + '. You have saved $' + current.toLocaleString() + ' of $' + target.toLocaleString() + '.</p>' +
    '<p>Log in to SaveIQ to extend your deadline or restructure your goal milestones.</p>' +
    '</div>';
    
  GmailApp.sendEmail(email, subject, 'Overdue Notice for ' + goalName, { htmlBody: htmlBody });
}

/**
 * Creates the automated daily time-driven trigger for 8:00 AM
 */
function createTimeDrivenDailyTrigger() {
  // Clear any existing triggers for this function to prevent duplicate triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'runDailyDeadlineAudit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Build new daily trigger at 8 AM
  ScriptApp.newTrigger('runDailyDeadlineAudit')
    .timeBased()
    .everyDays(1)
    .atHour(SAVEIQ_CONFIG.DAILY_TRIGGER_HOUR)
    .create();
    
  Logger.log('Automated Daily 8:00 AM Trigger created successfully!');
}
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(sampleScript);
});

// Setup Vite middlewares for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SaveIQ server running on port ${PORT}`);
  });
}

startServer();
