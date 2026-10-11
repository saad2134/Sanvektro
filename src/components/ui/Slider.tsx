import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 50,
  onChange,
  label,
  unit = '₹',
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{label}</span>
          <span className="font-mono text-slate-200">
            {unit}
            {value.toLocaleString('en-IN')}
          </span>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[#1A1E30] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #1A1E30 ${percentage}%, #1A1E30 100%)`,
          }}
          {...props}
        />
      </div>
    </div>
  );
};
