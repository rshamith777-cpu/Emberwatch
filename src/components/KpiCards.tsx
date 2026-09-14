import React from 'react';
import { Flame, Layers, AlertOctagon, Bell, Zap, Wind } from 'lucide-react';
import { FireCluster, FireObservation, EmberAlert } from '../types/emberwatch.js';

interface KpiCardsProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  alerts: EmberAlert[];
  onSelectHighRisk: () => void;
  onOpenAlerts: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  clusters,
  hotspots,
  alerts,
  onSelectHighRisk,
  onOpenAlerts
}) => {
  const highRiskCount = clusters.filter((c) => c.risk_score >= 51).length;
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const peakFrp = hotspots.length > 0 ? Math.max(...hotspots.map((h) => h.frp)) : 0;
  const viirsCount = hotspots.filter((h) => h.instrument === 'VIIRS').length;
  const modisCount = hotspots.filter((h) => h.instrument === 'MODIS').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-950/60 border-b border-slate-900">
      {/* 1. Active Hotspots */}
      <div
        id="kpi-hotspots"
        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Hotspots
          </span>
          <div className="h-7 w-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-['JetBrains_Mono']">
            {hotspots.length}
          </span>
          <span className="text-[11px] text-slate-400">
            {viirsCount} VIIRS &bull; {modisCount} MODIS
          </span>
        </div>
      </div>

      {/* 2. Fire Clusters */}
      <div
        id="kpi-clusters"
        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Fire Clusters
          </span>
          <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-['JetBrains_Mono']">
            {clusters.length}
          </span>
          <span className="text-[11px] text-slate-400">DBSCAN Geospatial</span>
        </div>
      </div>

      {/* 3. High-Risk Events */}
      <div
        id="kpi-high-risk"
        onClick={onSelectHighRisk}
        className="p-3.5 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 shadow-sm flex flex-col justify-between cursor-pointer transition"
        title="Click to focus highest risk wildfire"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
            High-Risk Events
          </span>
          <div className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
            <AlertOctagon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-300 font-['JetBrains_Mono']">
            {highRiskCount}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">
            Score &gt; 50
          </span>
        </div>
      </div>

      {/* 4. Critical Alerts */}
      <div
        id="kpi-alerts"
        onClick={onOpenAlerts}
        className="p-3.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-900/50 shadow-sm flex flex-col justify-between cursor-pointer transition"
        title="Click to view automated alerts"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Critical Alerts
          </span>
          <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-300 font-['JetBrains_Mono']">
            {criticalAlertsCount}
          </span>
          <span className="text-[11px] text-slate-400">Automated Cooldown</span>
        </div>
      </div>

      {/* 5. Peak Radiative Power */}
      <div
        id="kpi-frp"
        className="col-span-2 md:col-span-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Peak Fire FRP
          </span>
          <div className="h-7 w-7 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-yellow-400 font-['JetBrains_Mono']">
            {peakFrp.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">MW</span>
        </div>
      </div>
    </div>
  );
};
