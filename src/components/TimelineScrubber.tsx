import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import type { Commitment, Subscription, Inflow } from '../types/finance';

interface TimelineScrubberProps {
  currentDay: number;
  onDayChange: (day: number | ((prev: number) => number)) => void;
  commitments: Commitment[];
  subscriptions: Subscription[];
  inflows: Inflow[];
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentDay,
  onDayChange,
  commitments,
  subscriptions,
  inflows
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        onDayChange((prev: number) => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 30;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, onDayChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDayChange(Number(e.target.value));
  };

  const handlePrev = () => {
    if (currentDay > 1) onDayChange(currentDay - 1);
  };

  const handleNext = () => {
    if (currentDay < 30) onDayChange(currentDay + 1);
  };

  // Find milestones on current day
  const todaysCommitments = commitments.filter(c => c.dueDay === currentDay);
  const todaysSubs = subscriptions.filter(s => s.isActive && s.billingDay === currentDay);
  const todaysInflows = inflows.filter(i => i.day === currentDay);

  return (
    <section 
      id="timeline-scrubber-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="30-Day Timeline Simulator"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              30-Day Calendar Time Scrubber
            </h2>
            <p className="text-xs text-slate-400">
              Scrub across the 30-day billing cycle to test cashflow velocity & scheduled deductions
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrev}
            disabled={currentDay <= 1}
            id="btn-day-prev"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            id="btn-day-play-pause"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying 
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Auto-Advance
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentDay >= 30}
            id="btn-day-next"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Range Slider Track */}
      <div className="relative pt-1 pb-3">
        <input
          type="range"
          min="1"
          max="30"
          value={currentDay}
          onChange={handleSliderChange}
          id="timeline-scrubber"
          data-testid="timeline-scrubber"
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
        />

        {/* Markers on slider */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
          <span>Day 1 (Stipend Inflow)</span>
          <span className="hidden sm:inline">Day 10</span>
          <span>Day 15 (Mid-Month)</span>
          <span className="hidden sm:inline">Day 20</span>
          <span>Day 30 (Goal Target)</span>
        </div>
      </div>

      {/* Daily Event Notification Banner if something happens on this day */}
      {(todaysCommitments.length > 0 || todaysSubs.length > 0 || todaysInflows.length > 0) && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> Day {currentDay} Events:
          </span>
          {todaysInflows.map(inf => (
            <span key={inf.id} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              +{inf.title}: ₹{inf.amount}
            </span>
          ))}
          {todaysCommitments.map(com => (
            <span key={com.id} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Due: {com.name} (₹{com.amount})
            </span>
          ))}
          {todaysSubs.map(sub => (
            <span key={sub.id} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Sub Charge: {sub.name} (₹{sub.amount})
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
