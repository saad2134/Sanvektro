import React, { useState } from 'react';
import type { TrajectoryPoint } from '../utils/calculations';
import { TrendingDown, Calendar } from 'lucide-react';

interface TrajectoryChartProps {
  points: TrajectoryPoint[];
  currentDay: number;
  isSimulating: boolean;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  points,
  currentDay,
  isSimulating
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TrajectoryPoint | null>(null);

  // Chart dimensions in SVG coordinates
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Max scale: ₹11,000 to 0
  const maxBalance = 11000;
  const minBalance = 0;

  // Coordinate mappers
  const getX = (day: number) => padding.left + ((day - 1) / 29) * plotWidth;
  const getY = (val: number) => {
    const clamped = Math.max(minBalance, Math.min(maxBalance, val));
    return padding.top + (1 - clamped / maxBalance) * plotHeight;
  };

  // 1. Build Safe Corridor Area Path
  const safeAreaPath = `
    M ${getX(points[0].day)} ${getY(points[0].safeCorridorMax)}
    ${points.map(p => `L ${getX(p.day)} ${getY(p.safeCorridorMax)}`).join(' ')}
    ${points.slice().reverse().map(p => `L ${getX(p.day)} ${getY(p.safeCorridorMin)}`).join(' ')}
    Z
  `;

  // 2. Build Projected Path
  const projectedPath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.projectedBalance)}`)
    .join(' ');

  // 3. Build Actual Path (up to currentDay)
  const actualPoints = points.filter(p => p.day <= currentDay);
  const actualPath = actualPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.actualBalance ?? p.projectedBalance)}`)
    .join(' ');

  // 4. Build Simulated Path (if active)
  const simulatedPath = isSimulating
    ? points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.simulatedBalance ?? p.projectedBalance)}`)
        .join(' ')
    : '';

  return (
    <section 
      id="trajectory-chart-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="30-Day Cash Runway Chart"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            30-Day Cash Trajectory & Burn Forecast
          </h2>
          <p className="text-xs text-slate-400">
            Realized cash trajectory vs safe corridor & simulated decision delta
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-1 bg-emerald-400 rounded-full" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-3 h-0.5 bg-cyan-400 border-b border-dashed border-cyan-400" />
            <span>Projected</span>
          </div>
          {isSimulating && (
            <div className="flex items-center gap-1.5 text-amber-400 animate-pulse font-semibold">
              <span className="w-3 h-0.5 bg-amber-400 border-b-2 border-dotted border-amber-400" />
              <span>Simulated Shift</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-2 bg-emerald-500/10 rounded border border-emerald-500/20" />
            <span>Safe Corridor</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[800/280] max-h-[300px]">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[10000, 7500, 5000, 2500, 0].map(val => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={svgWidth - padding.right}
                y2={getY(val)}
                stroke="#1e293b"
                strokeDasharray={val === 0 ? '0' : '4 4'}
                strokeWidth={val === 0 ? '1.5' : '1'}
              />
              <text
                x={padding.left - 8}
                y={getY(val) + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-500 font-mono"
              >
                ₹{val >= 1000 ? `${val / 1000}k` : val}
              </text>
            </g>
          ))}

          {/* X Axis Day Labels */}
          {[1, 5, 10, 15, 20, 25, 30].map(day => (
            <text
              key={day}
              x={getX(day)}
              y={svgHeight - 12}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 font-mono"
            >
              D{day}
            </text>
          ))}

          {/* Safe Corridor Area */}
          <path d={safeAreaPath} fill="url(#corridorGrad)" />

          {/* Projected Path (Whole month) */}
          <path
            d={projectedPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Simulated Path (If simulating) */}
          {isSimulating && (
            <path
              d={simulatedPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="5 3"
              className="animate-pulse"
            />
          )}

          {/* Actual Realized Path (Up to currentDay) */}
          <path
            d={actualPath}
            fill="none"
            stroke="url(#actualGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Current Day Vertical Indicator Line */}
          <line
            x1={getX(currentDay)}
            y1={padding.top}
            x2={getX(currentDay)}
            y2={svgHeight - padding.bottom}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Interactive Day Node Circles */}
          {points.map(p => {
            const isToday = p.day === currentDay;
            const hasEvent = !!p.eventNote;
            const x = getX(p.day);
            const y = getY(p.day <= currentDay ? (p.actualBalance ?? p.projectedBalance) : p.projectedBalance);

            return (
              <g 
                key={p.day}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <circle cx={x} cy={y} r="10" fill="transparent" />

                {/* Visible node */}
                {(isToday || hasEvent || p.day % 5 === 0) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isToday ? 5 : hasEvent ? 4 : 3}
                    fill={isToday ? '#10b981' : hasEvent ? '#f59e0b' : '#334155'}
                    stroke="#07090e"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs font-mono"
            style={{
              left: `${((hoveredPoint.day - 1) / 29) * 100}%`,
              top: '25%'
            }}
          >
            <div className="font-bold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" /> Day {hoveredPoint.day}
            </div>
            <div className="text-emerald-400 font-semibold mt-0.5">
              Balance: ₹{hoveredPoint.day <= currentDay ? hoveredPoint.actualBalance : hoveredPoint.projectedBalance}
            </div>
            {isSimulating && hoveredPoint.simulatedBalance !== undefined && (
              <div className="text-amber-400 font-semibold">
                Simulated: ₹{hoveredPoint.simulatedBalance}
              </div>
            )}
            {hoveredPoint.eventNote && (
              <div className="text-[11px] text-slate-300 mt-1 border-t border-slate-800 pt-1 font-sans">
                {hoveredPoint.eventNote}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
