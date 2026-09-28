import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Simple price range dual-thumb slider.
 * Uses two range inputs layered on top of each other.
 */
interface SliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

const thumbClass =
  'pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent ' +
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
  '[&::-webkit-slider-thumb]:bg-terracotta-500 [&::-webkit-slider-thumb]:shadow ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 ' +
  '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 ' +
  '[&::-moz-range-thumb]:bg-terracotta-500';

export function Slider({ min, max, value, onChange, step = 50, className }: SliderProps) {
  const [low, high] = value;
  const span = Math.max(max - min, 1);
  const lowPct = ((low - min) / span) * 100;
  const highPct = ((high - min) / span) * 100;

  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <div className="relative h-4 w-full">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />
        {/* Page is RTL, so 0 is on the right. Inset the fill from that edge. */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-terracotta-400"
          style={{ right: `${lowPct}%`, left: `${100 - highPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label="الحد الأدنى للسعر"
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), high);
            onChange([next, high]);
          }}
          className={cn(thumbClass, high - low <= step ? 'z-30' : 'z-10')}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label="الحد الأقصى للسعر"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), low);
            onChange([low, next]);
          }}
          className={cn(thumbClass, high - low <= step ? 'z-10' : 'z-20')}
        />
      </div>
    </div>
  );
}
