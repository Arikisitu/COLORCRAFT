import React, { useCallback, useRef } from 'react';
import { RotateCcw, Info } from 'lucide-react';
import { cn } from '../utils/cn';

interface ColorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
  info?: string;
  className?: string;
  accentColor?: string;
  showTooltip?: boolean;
}

export const ColorSlider: React.FC<ColorSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  defaultValue = 0,
  unit = '',
  onChange,
  onReset,
  info,
  className,
  accentColor = '#3b82f6',
  showTooltip = true,
}) => {
  const [showInfo, setShowInfo] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pct = ((value - min) / (max - min)) * 100;
  const isDefault = Math.abs(value - defaultValue) < step * 0.5;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const small = step;
    const large = step * 10;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, value + (e.shiftKey ? large : small)));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(min, value - (e.shiftKey ? large : small)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  }, [value, min, max, step, onChange]);

  const displayValue = unit === 'K'
    ? `${Math.round(value)}K`
    : unit === '°'
    ? `${value.toFixed(1)}°`
    : Math.abs(value) < 0.005
    ? '0.00'
    : value > 0
    ? `+${value.toFixed(2)}`
    : value.toFixed(2);

  return (
    <div className={cn('group relative', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">{label}</span>
          {info && showTooltip && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-600 hover:text-gray-400 transition-colors"
              aria-label={`Info about ${label}`}
            >
              <Info size={11} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-mono tabular-nums',
            isDefault ? 'text-gray-600' : 'text-blue-400'
          )}>
            {displayValue}
          </span>
          {onReset && !isDefault && (
            <button
              onClick={() => onReset()}
              className="text-gray-600 hover:text-orange-400 transition-colors"
              aria-label={`Reset ${label}`}
            >
              <RotateCcw size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-800 border border-gray-700" />
        {/* Filled portion */}
        <div
          className="absolute h-1.5 rounded-full transition-none"
          style={{
            left: value >= defaultValue
              ? `${((defaultValue - min) / (max - min)) * 100}%`
              : `${pct}%`,
            width: `${Math.abs(pct - ((defaultValue - min) / (max - min)) * 100)}%`,
            backgroundColor: isDefault ? '#374151' : accentColor,
          }}
        />
        {/* Zero marker */}
        {defaultValue !== min && defaultValue !== max && (
          <div
            className="absolute w-px h-2.5 bg-gray-600 -translate-x-0.5"
            style={{ left: `${((defaultValue - min) / (max - min)) * 100}%` }}
          />
        )}
        {/* Range input */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          style={{ zIndex: 10 }}
        />
        {/* Thumb */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-gray-300 bg-gray-900 shadow-lg pointer-events-none -translate-x-1/2 transition-none"
          style={{ left: `${pct}%`, borderColor: isDefault ? '#6b7280' : accentColor }}
        />
      </div>

      {/* Info panel */}
      {showInfo && info && (
        <div className="mt-2 p-2 rounded bg-gray-800 border border-gray-700 text-xs text-gray-400 leading-relaxed">
          {info}
        </div>
      )}
    </div>
  );
};
