import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  SlidersHorizontal
} from 'lucide-react';
import type { FinancialState, ConsequenceMetrics, SimulationDraft, CoachEvaluationResult } from '../../types/finance';
import { evaluateCoachQuery } from '../../utils/coachEvaluator';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  evaluation?: CoachEvaluationResult;
}

interface SanvektroCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialState;
  metrics: ConsequenceMetrics;
  presetName: string;
  onStageSimulation: (draft: SimulationDraft) => void;
}

const QUICK_QUESTIONS = [
  'Can I afford ₹1,500 sneakers today?',
  'What happens if I spend ₹450 on Swiggy dinner tonight?',
  'Should I pause my subscriptions (Spotify/Gym)?',
  'How do I guarantee my savings target this month?',
  'What is my exact safe daily spending limit today?'
];

export const SanvektroCoachModal: React.FC<SanvektroCoachModalProps> = ({
  isOpen,
  onClose,
  state,
  metrics,
  presetName,
  onStageSimulation
}) => {
  const [query, setQuery] = useState('');
  const msgCounterRef = useRef(0);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'init-coach',
      sender: 'assistant',
      text: `Hey! I'm your Sanvektro Decision Coach. I evaluate your financial dilemmas directly against your ₹${state.startingBudget.toLocaleString('en-IN')} budget, ₹${metrics.dailyAllowance}/day safe allowance, and ₹${metrics.balance.toLocaleString('en-IN')} liquid cash. Click a dilemma below or type any purchase question!`
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const evaluation = evaluateCoachQuery(state, userText, metrics);

    msgCounterRef.current += 1;
    const userMsg: Message = {
      id: `usr-${msgCounterRef.current}`,
      sender: 'user',
      text: userText
    };

    msgCounterRef.current += 1;
    const botMsg: Message = {
      id: `bot-${msgCounterRef.current}`,
      sender: 'assistant',
      text: evaluation.response,
      evaluation
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setQuery('');
  };

  const handleStageDraft = (evaluation: CoachEvaluationResult) => {
    if (!evaluation.extractedAmount) return;

    const draft: SimulationDraft = {
      title: evaluation.extractedTitle || 'Coach Evaluated Purchase',
      amount: evaluation.extractedAmount,
      category: 'Shopping & Quick-Commerce',
      day: state.currentDay
    };

    onStageSimulation(draft);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Sanvektro Decision Coach"
    >
      <div className="bg-[#090d16] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d121e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 aspect-square rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full aspect-square bg-[#07090e] rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-['Plus_Jakarta_Sans'] m-0">
                  Decision Coach ✦ {presetName}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI Offline Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic mathematical reasoning grounded in live ₹10k budget invariants
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="btn-close-coach"
            className="w-8 h-8 aspect-square rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Close Coach (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Liquid Cash:</span>
            <span className="text-emerald-400 font-bold">₹{metrics.balance.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Safe Daily Burn:</span>
            <span className="text-cyan-400 font-bold">₹{metrics.dailyAllowance}/day</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Health Index:</span>
            <span className="text-amber-400 font-bold">{metrics.healthScore}/100 ({metrics.letterGrade})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Day:</span>
            <span className="text-slate-200 font-bold">{state.currentDay}/30</span>
          </div>
        </div>

        {/* Quick Dilemma Chips */}
        <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/50 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Ask:
          </span>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'user' ? (
                <div className="max-w-[85%] rounded-2xl bg-cyan-600/30 border border-cyan-500/40 px-4 py-2.5 text-cyan-100 shadow-md">
                  <div className="font-medium text-xs">{m.text}</div>
                </div>
              ) : (
                <div className="max-w-[90%] rounded-2xl bg-[#0d121e] border border-slate-700/70 p-4 space-y-3 shadow-xl">
                  {m.evaluation && (
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-slate-200 text-xs">Coach Analysis</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                        m.evaluation.verdict === 'SAFE'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : m.evaluation.verdict === 'CAUTION'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {m.evaluation.verdictLabel}
                      </span>
                    </div>
                  )}

                  <p className="text-slate-300 leading-relaxed m-0 text-xs">
                    {m.text}
                  </p>

                  {/* Structured Data Metric Grid */}
                  {m.evaluation?.dataSnippet && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-500">Liquid Balance</div>
                        <div className="text-slate-200 font-bold">
                          ₹{m.evaluation.dataSnippet.currentBalance} → <span className={m.evaluation.dataSnippet.simulatedBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}>₹{m.evaluation.dataSnippet.simulatedBalance}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-500">Daily Safe Burn</div>
                        <div className="text-slate-200 font-bold">
                          ₹{m.evaluation.dataSnippet.currentAllowance} → <span className={m.evaluation.dataSnippet.simulatedAllowance < 60 ? 'text-rose-400' : 'text-cyan-400'}>₹{m.evaluation.dataSnippet.simulatedAllowance}/day</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 col-span-2 sm:col-span-1">
                        <div className="text-[10px] text-slate-500">Allowance Δ</div>
                        <div className={`font-bold ${m.evaluation.dataSnippet.allowanceDelta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {m.evaluation.dataSnippet.allowanceDelta <= 0 ? '' : '+'}₹{m.evaluation.dataSnippet.allowanceDelta}/day
                        </div>
                      </div>
                    </div>
                  )}

                  {/* One-Click Stage Action in Simulator */}
                  {m.evaluation?.extractedAmount && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleStageDraft(m.evaluation!)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Stage ₹{m.evaluation.extractedAmount.toLocaleString('en-IN')} in Pre-Spend Simulator
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#0d121e]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(query);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a dilemma (e.g., 'Can I buy ₹1,500 sneakers today?')..."
              className="flex-1 bg-[#07090e] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
