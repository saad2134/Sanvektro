import React from 'react';
import type { Commitment } from '../../types/finance';
import { ShieldAlert, CheckCircle2, Landmark, Clock } from 'lucide-react';
import { calculateCashPressureRadar } from '../../utils/calculations';

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

  const pressureRadar = calculateCashPressureRadar(commitments, currentDay);

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

      {/* 7-Day Cash Pressure Radar Banner */}
      <div 
        data-testid="cash-pressure-radar"
        className={`mb-3.5 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
          pressureRadar.status === 'ALERT'
            ? 'bg-rose-950/20 border-rose-500/30'
            : pressureRadar.status === 'WATCH'
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-emerald-950/20 border-emerald-500/30'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 aspect-square rounded-lg flex items-center justify-center shrink-0 ${
            pressureRadar.status === 'ALERT'
              ? 'bg-rose-500/10 text-rose-400'
              : pressureRadar.status === 'WATCH'
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                7-Day Cash Pressure Radar
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                pressureRadar.status === 'ALERT'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : pressureRadar.status === 'WATCH'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}>
                {pressureRadar.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {pressureRadar.descriptor}
            </p>
          </div>
        </div>

        {pressureRadar.nextDueItem && (
          <div className="text-[11px] font-mono self-start sm:self-auto px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Next Due: </span>
            <strong className="text-white">{pressureRadar.nextDueItem.name}</strong> (Day {pressureRadar.nextDueItem.dueDay} ✦ ₹{pressureRadar.nextDueItem.amount})
          </div>
        )}
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
                  className={`w-6 h-6 aspect-square rounded-lg flex items-center justify-center transition-colors shrink-0 ${
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
