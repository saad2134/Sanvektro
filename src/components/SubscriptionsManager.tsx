import React, { useState } from 'react';
import type { Subscription } from '../types/finance';
import { Scissors, Check, X, Plus, Music, Tv, Dumbbell, Cloud, Cpu, Palette, Sparkles } from 'lucide-react';

interface SubscriptionsManagerProps {
  subscriptions: Subscription[];
  currentDay: number;
  onToggleSubscription: (id: string) => void;
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
}

export const SubscriptionsManager: React.FC<SubscriptionsManagerProps> = ({
  subscriptions,
  currentDay,
  onToggleSubscription,
  onAddSubscription
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(149);
  const [billingDay, setBillingDay] = useState<number>(15);
  const category = 'Streaming';

  const remainingDays = Math.max(1, 30 - currentDay + 1);

  const activeTotal = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  const pausedTotal = subscriptions
    .filter(s => !s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0) return;
    onAddSubscription({
      name: name.trim(),
      amount,
      billingDay,
      category,
      isActive: true
    });
    setName('');
    setShowAddForm(false);
  };

  const getSubIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('spotify') || lower.includes('music')) return <Music className="w-4 h-4 text-emerald-400" />;
    if (lower.includes('netflix') || lower.includes('prime') || lower.includes('tv')) return <Tv className="w-4 h-4 text-rose-400" />;
    if (lower.includes('gym') || lower.includes('cult') || lower.includes('fitness')) return <Dumbbell className="w-4 h-4 text-amber-400" />;
    if (lower.includes('cloud') || lower.includes('google')) return <Cloud className="w-4 h-4 text-cyan-400" />;
    if (lower.includes('gpt') || lower.includes('ai') || lower.includes('cpu')) return <Cpu className="w-4 h-4 text-purple-400" />;
    if (lower.includes('youtube')) return <Tv className="w-4 h-4 text-red-500" />;
    if (lower.includes('adobe') || lower.includes('figma')) return <Palette className="w-4 h-4 text-indigo-400" />;
    return <Sparkles className="w-4 h-4 text-slate-400" />;
  };

  return (
    <section 
      id="subscriptions-manager-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="Subscription Guillotine"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Scissors className="w-4 h-4 text-rose-400" />
            Subscription Guillotine
          </h2>
          <p className="text-xs text-slate-400">
            Pause recurring micro-drains to instantly unlock daily runway
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Active Drain: </span>
            <span className="text-rose-400 font-bold">₹{activeTotal}/mo</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            id="btn-add-subscription"
            className="w-8 h-8 aspect-square rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center shrink-0"
            title="Add subscription"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Subscription Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Sub Name (e.g. Duolingo)"
            className="bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            required
          />
          <input
            type="number"
            min="10"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="Amount (₹)"
            className="bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            required
          />
          <input
            type="number"
            min="1"
            max="30"
            value={billingDay}
            onChange={e => setBillingDay(Number(e.target.value))}
            placeholder="Billing Day (1-30)"
            className="bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg py-1.5"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-800 text-slate-400 rounded-lg px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Subscription List */}
      <div className="space-y-2.5">
        {subscriptions.map(sub => {
          const isPendingBilling = sub.billingDay >= currentDay;
          const dailyBenefit = isPendingBilling
            ? (sub.amount / remainingDays).toFixed(1)
            : '0.0';

          return (
            <div
              key={sub.id}
              id={`sub-item-${sub.id}`}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                sub.isActive
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 aspect-square rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                  {getSubIcon(sub.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{sub.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Day {sub.billingDay}
                    </span>
                    {!sub.isActive && (
                      <span className="text-[10px] font-bold text-amber-400 uppercase">
                        PAUSED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-slate-300">₹{sub.amount}/mo</span>
                    <span>•</span>
                    {sub.isActive ? (
                      <span className="text-emerald-400/90 font-medium">
                        Pausing unlocks +₹{dailyBenefit}/day
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Saved ₹{sub.amount} towards runway
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => onToggleSubscription(sub.id)}
                id={`toggle-sub-${sub.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto ${
                  sub.isActive
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {sub.isActive ? (
                  <>
                    <X className="w-3.5 h-3.5" /> Pause Sub
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Reactivate
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {pausedTotal > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between font-mono">
          <span>Total Guillotined Savings:</span>
          <span className="font-bold">+₹{pausedTotal} preserved in cashflow</span>
        </div>
      )}
    </section>
  );
};
