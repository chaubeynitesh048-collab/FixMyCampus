import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  Zap,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatWithAI, initializeAiEngine, isEngineReady, getEngineInfo } from '../utils/localAiEngine';

export default function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I\'m the FixMyCampus AI Assistant — running locally on your device. Ask me anything about campus maintenance, reporting issues, or how the 48-hour escalation works!',
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState('idle'); // 'idle' | 'loading' | 'ready'
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize engine when modal opens
  useEffect(() => {
    if (isOpen && !isEngineReady()) {
      setEngineStatus('loading');
      initializeAiEngine({
        onProgress: (pct, msg) => {
          // Could show progress bar here
        },
        onReady: () => setEngineStatus('ready'),
        onError: () => setEngineStatus('ready'), // Still functional with fallbacks
      });
    } else if (isOpen) {
      setEngineStatus('ready');
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText, time: 'Just now' },
    ]);

    setLoading(true);

    try {
      const replyText = await chatWithAI(userText);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: replyText, time: 'Just now' },
      ]);
    } catch (err) {
      console.warn('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I\'m here to help. You can report problems anytime using the "Report Issue" form or track progress in real-time under "Track Complaints".',
          time: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const engineInfo = getEngineInfo();

  return (
    <>
      {/* Floating Action Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-600/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
        aria-label="Open AI Campus Assistant"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Ask Campus AI</span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md h-[550px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Campus Civic AI Assistant</h3>
                  <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5" />
                    <span>Local AI Engine v{engineInfo.version}</span>
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <button
                onClick={() => setInputQuery('How does the 48-hour escalation work?')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
              >
                ⏱️ 48h Escalation?
              </button>
              <button
                onClick={() => setInputQuery('How do I report a water leak in Hostel?')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
              >
                💧 Water Leak?
              </button>
              <button
                onClick={() => setInputQuery('Who fixes broken lab computers?')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
              >
                💻 Lab Wi-Fi?
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about campus issues, escalation, departments..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
