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

export function Slider({ min, max, value, onChange, step = 50, className }: SliderProps) {
  const [low, high] = value;

  return (
    <div className={cn('relative flex flex-col gap-2', className)}>
      <div className="relative h-2 w-full">
        {/* Track */}
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-muted" />
        {/* Active range */}
        <div
          className="absolute inset-y-0 rounded-full bg-terracotta-400"
          style={{
            left: `${((low - min) / (max - min)) * 100}%`,
            right: `${((max - high) / (max - min)) * 100}%`,
          }}
        />
        {/* Low thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= high) onChange([v, high]);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-terracotta-500 [&::-webkit-slider-thumb]:shadow"
        />
        {/* High thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= low) onChange([low, v]);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-terracotta-500 [&::-webkit-slider-thumb]:shadow"
        />
      </div>
    </div>
  );
}
