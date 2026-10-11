import React, { useState } from 'react';
import { DayForecastPoint } from '../../lib/forecast-engine';
import { TrendingDown } from 'lucide-react';

interface ForecastLineProps {
  data: DayForecastPoint[];
  totalBudget: number;
  simulatedBurn?: number;
}

export const ForecastLine: React.FC<ForecastLineProps> = ({
  data,
  totalBudget,
  simulatedBurn: _simulatedBurn,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DayForecastPoint | null>(null);

  const width = 650;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = totalBudget;
  const minVal = 0;

  const getX = (day: number) => padding.left + ((day - 1) / 29) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  // Build projected SVG path
  const projectedPoints = data.map((d) => `${getX(d.day)},${getY(d.projectedBalance)}`).join(' ');
  const projectedPathD = `M ${projectedPoints}`;

  // Build actual historical SVG path
  const actualData = data.filter((d) => d.actualBalance !== undefined);
  const actualPoints = actualData.map((d) => `${getX(d.day)},${getY(d.actualBalance!)}`).join(' ');
  const actualPathD = actualPoints ? `M ${actualPoints}` : '';

  // Area under projected curve
  const areaPathD = `${projectedPathD} L ${getX(30)},${getY(0)} L ${getX(1)},${getY(0)} Z`;

  return (
    <div className="rounded-xl bg-[#111320] border border-[#1E2238] p-4 sm:p-5 space-y-4 w-full min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-indigo-400" />
            <span>30-Day Runway Trajectory</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pacing projection from Day 1 to Day 30 factoring daily allowance & subscriptions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" />
            <span className="text-slate-300">Actual Spent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-400" />
            <span className="text-slate-300">Projected Burn</span>
          </div>
        </div>
      </div>

      {/* SVG Line Chart with touch-friendly scroll containment */}
      <div className="w-full min-w-0">
        <div className="relative w-full overflow-x-auto pb-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[520px] overflow-visible"
          role="img"
          aria-label="30-day budget runway projection graph"
        >
          {/* Grid lines */}
          {[0, 2500, 5000, 7500, 10000].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1B2036"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  ₹{(tick / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Days axis ticks */}
          {[1, 5, 10, 15, 20, 25, 30].map((day) => {
            const x = getX(day);
            return (
              <g key={day}>
                <text
                  x={x}
                  y={height - 15}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  D{day}
                </text>
              </g>
            );
          })}

          {/* Gradient Area fill */}
          <defs>
            <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPathD} fill="url(#projectedGrad)" />

          {/* Projected dashed line */}
          <path
            d={projectedPathD}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />

          {/* Actual solid line */}
          {actualPathD && (
            <path
              d={actualPathD}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
            />
          )}

          {/* Interactive Dots for key days */}
          {data.map((point) => {
            const cx = getX(point.day);
            const cy = getY(point.projectedBalance);
            const isHovered = hoveredPoint?.day === point.day;
            const hasSubscription = point.subscriptionsDue.length > 0;

            return (
              <g
                key={point.day}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {point.isToday && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="#10B981"
                    fillOpacity="0.3"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : hasSubscription ? 4.5 : point.isToday ? 5 : 2.5}
                  fill={
                    hasSubscription
                      ? '#06B6D4'
                      : point.isToday
                      ? '#10B981'
                      : '#6366F1'
                  }
                  stroke="#0C0E17"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-[#191D32] border border-[#262D4A] rounded-lg p-2.5 text-xs shadow-xl pointer-events-none z-10 space-y-1">
            <div className="font-bold text-white flex items-center justify-between gap-4">
              <span>Day {hoveredPoint.day}</span>
              <span className="font-mono text-indigo-300">
                ₹{hoveredPoint.projectedBalance.toLocaleString('en-IN')}
              </span>
            </div>
            {hoveredPoint.subscriptionsDue.length > 0 && (
              <div className="text-[11px] text-cyan-300">
                Scheduled: {hoveredPoint.subscriptionsDue.join(', ')}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="text-[11px] text-slate-400">
        Cyan points indicate scheduled subscription charges occurring on that calendar day.
      </div>
    </div>
  );
};
