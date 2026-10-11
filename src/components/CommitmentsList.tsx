import React from 'react';
import type { Commitment } from '../types/finance';
import { ShieldAlert, CheckCircle2, Landmark } from 'lucide-react';

interface CommitmentsListProps {
  commitments: Commitment[];
  currentDay: number;
  onToggleCommitmentPaid: (id: string) => void;
}

export const CommitmentsList: React.FC<CommitmentsListProps> = ({
  commitments,
  currentDay,
  onToggleCommitmentPaid
}) => {
  const totalCommitments = commitments.reduce((sum, c) => sum + c.amount, 0);
  const pendingTotal = commitments
    .filter(c => !c.isPaid && c.dueDay >= currentDay)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <section 
      id="commitments-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="Fixed Commitments & Obligations"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Landmark className="w-4 h-4 text-cyan-400" />
            Fixed Commitments & Obligations
          </h2>
          <p className="text-xs text-slate-400">
            Mandatory monthly overhead (Rent, transit, bills) ringfenced from daily spending
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            Pending: <strong className="text-amber-400">₹{pendingTotal}</strong> / ₹{totalCommitments}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {commitments.map(item => {
          const isOverdue = !item.isPaid && item.dueDay < currentDay;

          return (
            <div
              key={item.id}
              id={`commitment-item-${item.id}`}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                item.isPaid
                  ? 'bg-slate-950/40 border-slate-800/50'
                  : isOverdue
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleCommitmentPaid(item.id)}
                  id={`btn-toggle-paid-${item.id}`}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    item.isPaid
                      ? 'bg-emerald-500 text-slate-950'
                      : isOverdue
                      ? 'border border-rose-500 text-rose-400 hover:bg-rose-500/20'
                      : 'border border-slate-700 text-transparent hover:text-slate-400'
                  }`}
                  title={item.isPaid ? 'Mark as unpaid' : 'Mark as settled'}
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${item.isPaid ? 'line-through text-slate-500' : 'text-white'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Day {item.dueDay}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-0.5">
                        <ShieldAlert className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ₹{item.amount} • {item.category}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className={`text-xs font-bold ${item.isPaid ? 'text-slate-500' : 'text-white'}`}>
                  ₹{item.amount}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {item.isPaid ? 'Settled' : `Due D${item.dueDay}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
