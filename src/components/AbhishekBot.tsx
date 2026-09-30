import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { SavingsGoal, BotChatMessage } from '../types';
import { formatCurrency, getDaysRemaining } from '../utils/storage';

interface AbhishekBotProps {
  goals: SavingsGoal[];
  initialGoalContext?: SavingsGoal | null;
}

const DEFAULT_PROMPTS = [
  'How should I prioritize my Emergency Fund vs Laptop & Vacation?',
  'Calculate my required daily & weekly savings to hit all deadlines.',
  'How does the Google Apps Script automated daily email audit work?',
  'Suggest 3 realistic monthly budget cuts to accelerate my goals.',
  'What should I do if a deadline is approaching and I am behind?',
];

export const AbhishekBot: React.FC<AbhishekBotProps> = ({
  goals,
  initialGoalContext,
}) => {
  const [messages, setMessages] = useState<BotChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Greetings! I am **Abhishek Waghmare**, your Lead Financial Strategy Advisor & creator of SaveIQ.

I am actively monitoring your **${goals.length} savings goals** with total targets of **${formatCurrency(
        goals.reduce((acc, g) => acc + g.targetAmount, 0)
      )}**.

How can I assist your financial journey today? You can ask me to calculate savings velocity, audit approaching deadlines, optimize discretionary spending, or deploy Google Apps Script automation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: DEFAULT_PROMPTS.slice(0, 3),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialGoalContext) {
      const days = getDaysRemaining(initialGoalContext.deadline);
      const prompt = `Let's discuss my goal "${initialGoalContext.name}". I have saved ${formatCurrency(
        initialGoalContext.currentAmount
      )} of ${formatCurrency(initialGoalContext.targetAmount)}, with ${days} days remaining until ${
        initialGoalContext.deadline
      }. What is your tactical advice?`;
      sendMessage(prompt);
    }
  }, [initialGoalContext]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: BotChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.slice(-6),
          goalsContext: goals.map((g) => ({
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            deadline: g.deadline,
            purpose: g.purpose,
            priority: g.priority,
            emailAlerts: g.emailAlerts,
            emailRecipient: g.emailRecipient,
          })),
        }),
      });

      const data = await response.json();
      const botReply = data.reply || "I am analyzing your portfolio. Let's optimize your savings plan.";

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          role: 'assistant',
          content: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts: DEFAULT_PROMPTS.slice(2, 5),
        },
      ]);
    } catch (err) {
      console.error('Bot chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          role: 'assistant',
          content: `I'm calculating your savings metrics locally. To maintain momentum, consistently allocate 15–20% of net income across your active goals. Priority rule: Emergency Fund first, then fixed-deadline goals like Laptop or Vacation.\n\n— Abhishek Waghmare · SaveIQ Lead Advisor`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'reset-1',
        role: 'assistant',
        content: `Chat session reset. I'm Abhishek Waghmare. What financial strategy or savings target would you like to review?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: DEFAULT_PROMPTS.slice(0, 3),
      },
    ]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[740px] shadow-lg dark:shadow-xl transition-colors">
      {/* Bot Header */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Abhishek Waghmare
              </h2>
              <span className="text-2xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                Lead Financial Strategist
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              SaveIQ AI Copilot · Groq AI & Gemini Analytics
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset Conversation"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick context info banner */}
      <div className="bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
        <div className="flex items-center gap-4 shrink-0 font-mono">
          <span>Active Goals: <strong className="text-slate-900 dark:text-white">{goals.length}</strong></span>
          <span>·</span>
          <span>Saved: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(goals.reduce((acc, g) => acc + g.currentAmount, 0))}</strong></span>
          <span>·</span>
          <span>Target: <strong className="text-slate-800 dark:text-slate-300">{formatCurrency(goals.reduce((acc, g) => acc + g.targetAmount, 0))}</strong></span>
        </div>
        <span className="text-2xs text-slate-500 hidden md:inline">
          Contextual portfolio auditing active
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-sm">
                {msg.content}
              </div>

              <div
                className={`text-2xs font-mono mt-1 ${
                  msg.role === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>

              {/* Suggested prompts on recent assistant messages */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40 mt-2 space-y-1.5">
                  <div className="text-2xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Suggested Next Questions:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => sendMessage(prompt)}
                        className="text-xs text-left bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/60 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-slate-500 dark:text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Abhishek Waghmare is analyzing financial velocity & drafting advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <div className="p-4 bg-white dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Abhishek about deadline calculations, budget cuts, or Google Sheets sync..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
