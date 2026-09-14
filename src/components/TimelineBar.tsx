import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, History } from 'lucide-react';

interface TimelineBarProps {
  currentOffset: number; // 0 (Live), -1, -2, -3, -4
  onOffsetChange: (offset: number) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({ currentOffset, onOffsetChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { offset: -4, label: 'T-4h', desc: 'Early Detections' },
    { offset: -3, label: 'T-3h', desc: 'Thermal Growth' },
    { offset: -2, label: 'T-2h', desc: 'Cluster Merger' },
    { offset: -1, label: 'T-1h', desc: 'Peak Wind Surge' },
    { offset: 0, label: 'LIVE (T-0)', desc: 'Current State' }
  ];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onOffsetChange((prev) => {
          if (prev >= 0) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, onOffsetChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          id="btn-timeline-play"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/30 hover:bg-orange-600/40 text-orange-300 border border-orange-500/30 font-semibold transition cursor-pointer"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onOffsetChange(0);
          }}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
          title="Reset to Live"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 ml-2">
          <History className="h-3.5 w-3.5 text-slate-500" />
          <span>Historical Evolution Playback</span>
        </div>
      </div>

      {/* Scrub Points */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center">
        {steps.map((step) => {
          const isActive = currentOffset === step.offset;
          return (
            <button
              key={step.offset}
              onClick={() => {
                setIsPlaying(false);
                onOffsetChange(step.offset);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-['JetBrains_Mono'] transition cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
