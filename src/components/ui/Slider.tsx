/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
  hint?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  valueDisplay,
  hint,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {(label || valueDisplay) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && (
            <label htmlFor={id} className="text-slate-300">
              {label}
            </label>
          )}
          {valueDisplay && <span className="text-emerald-400 font-mono font-bold">{valueDisplay}</span>}
        </div>
      )}
      <input
        type="range"
        id={id}
        className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${className}`}
        {...props}
      />
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
};
