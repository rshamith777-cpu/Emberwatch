import React from 'react';
import { Radio, Database, RefreshCw, AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { SystemStatus } from '../types/emberwatch.js';

interface SystemStatusBannerProps {
  status: SystemStatus | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onToggleMode: () => void;
}

export const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({
  status,
  isRefreshing,
  onRefresh,
  onToggleMode
}) => {
  if (!status) return null;

  const isDemo = status.mode === 'DEMO_SNAPSHOT';

  const formatTimeAgo = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  };

  return (
    <div
      className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDemo
          ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
          : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
      }`}
    >
      {/* Left: Mode Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isDemo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'
          }`}
        />
        <span className="font-bold tracking-wider uppercase font-['JetBrains_Mono']">
          DATA SOURCE: {isDemo ? 'VERIFIED DEMO SNAPSHOT' : 'NASA FIRMS LIVE STREAM'}
        </span>
        {isDemo && (
          <span className="text-[11px] text-amber-300/80 hidden sm:inline">
            (Calibrated Real Satellite Hotspots &bull; {status.snapshotTimestamp})
          </span>
        )}
      </div>

      {/* Center: Refresh Timings */}
      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>Last Ingest:</span>
          <strong className="text-slate-300 font-mono">{formatTimeAgo(status.lastRefreshTime)}</strong>
        </span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="hidden sm:inline">
          Next Auto-Cycle: <strong className="text-slate-300 font-mono">{status.refreshIntervalMinutes}m interval</strong>
        </span>
      </div>

      {/* Right: Switch Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMode}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium transition cursor-pointer text-[11px]"
          title="Toggle between Live API query and Verified Demo Snapshot"
        >
          {isDemo ? (
            <>
              <ToggleLeft className="h-3.5 w-3.5 text-amber-400" />
              <span>Switch to Live API</span>
            </>
          ) : (
            <>
              <ToggleRight className="h-3.5 w-3.5 text-emerald-400" />
              <span>Switch to Snapshot</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
