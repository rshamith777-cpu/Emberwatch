import React from 'react';
import {
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  MapPin,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Building2,
  Hospital,
  GraduationCap,
  Zap,
  Info
} from 'lucide-react';
import { FireCluster, FactorContribution, ExposedAsset } from '../types/emberwatch.js';

interface SelectedEventPanelProps {
  cluster: FireCluster | null;
  clusters: FireCluster[];
  onSelectCluster: (c: FireCluster) => void;
}

export const SelectedEventPanel: React.FC<SelectedEventPanelProps> = ({
  cluster,
  clusters,
  onSelectCluster
}) => {
  if (!cluster) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
        <Flame className="h-10 w-10 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Cluster Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
          Click any active fire cluster or hotspot on the map to inspect ML risk factors, spread vectors, and exposed assets.
        </p>
      </div>
    );
  }

  const riskBadgeColor =
    cluster.risk_level === 'CRITICAL'
      ? 'bg-red-500/20 text-red-300 border-red-500/40 ring-red-500/30'
      : cluster.risk_level === 'HIGH'
      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 ring-orange-500/30'
      : cluster.risk_level === 'MODERATE'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 ring-yellow-500/30'
      : 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-blue-500/30';

  const riskScoreColor =
    cluster.risk_score >= 76
      ? 'text-red-400'
      : cluster.risk_score >= 51
      ? 'text-orange-400'
      : cluster.risk_score >= 26
      ? 'text-yellow-400'
      : 'text-blue-400';

  const getAssetIcon = (type: ExposedAsset['type']) => {
    switch (type) {
      case 'HOSPITAL':
        return <Hospital className="h-3.5 w-3.5 text-red-400" />;
      case 'SCHOOL':
        return <GraduationCap className="h-3.5 w-3.5 text-amber-400" />;
      case 'POWER_INFRASTRUCTURE':
        return <Zap className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Building2 className="h-3.5 w-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl text-slate-100">
      {/* Panel Header & Cluster Selector */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-['JetBrains_Mono'] bg-slate-800 text-slate-300 border border-slate-700">
              CLUSTER #{cluster.cluster_number}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider border ring-1 ${riskBadgeColor}`}
            >
              {cluster.risk_level} RISK
            </span>
          </div>

          {/* Quick cluster switcher dropdown */}
          <select
            value={cluster.id}
            onChange={(e) => {
              const target = clusters.find((c) => c.id === e.target.value);
              if (target) onSelectCluster(target);
            }}
            className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.cluster_number}: {c.name} ({c.risk_score})
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-lg font-bold text-white mt-2 leading-tight">{cluster.name}</h2>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-slate-500" />
          <span>{cluster.region}</span>
          <span className="text-slate-600">&bull;</span>
          <span className="font-['JetBrains_Mono']">
            {cluster.center_lat.toFixed(3)}°N, {Math.abs(cluster.center_lon).toFixed(3)}°W
          </span>
        </p>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Risk Score */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Model Risk Score</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-3xl font-extrabold font-['JetBrains_Mono'] ${riskScoreColor}`}>
                {cluster.risk_score}
              </span>
              <span className="text-slate-500 text-xs font-semibold">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Calibrated ML Output</span>
          </div>

          {/* Spread Risk & Direction */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Spread Threat</span>
            <div className="mt-1">
              <span className="text-base font-bold text-amber-300 font-['JetBrains_Mono']">
                {cluster.spread_estimate.spreadRisk}
              </span>
              <p className="text-[11px] text-slate-300 font-semibold mt-0.5">
                {cluster.spread_estimate.likelyThreatDirection}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {cluster.spread_estimate.forwardVelocityKmh}
            </span>
          </div>

          {/* Hotspots & Density */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Hotspots</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-white font-['JetBrains_Mono']">
                {cluster.hotspot_count}
              </span>
              <span className="text-[11px] text-slate-400">detections</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Density: {cluster.approximate_density} / 100km²
            </span>
          </div>

          {/* Peak FRP */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Peak Fire Power</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-orange-400 font-['JetBrains_Mono']">
                {cluster.max_frp}
              </span>
              <span className="text-[11px] text-slate-400">MW</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Avg FRP: {cluster.avg_frp} MW
            </span>
          </div>
        </div>

        {/* Real-time Weather Context */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-sky-400" />
              <span>Surrounding Weather Conditions</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Open-Meteo</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Temperature</span>
              <span className="text-sm font-bold text-white font-['JetBrains_Mono']">
                {cluster.weather.temperature_2m}°C
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Humidity</span>
              <span
                className={`text-sm font-bold font-['JetBrains_Mono'] ${
                  cluster.weather.relative_humidity_2m <= 15 ? 'text-red-400' : 'text-slate-200'
                }`}
              >
                {cluster.weather.relative_humidity_2m}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Sustained Wind</span>
              <span className="text-sm font-bold text-amber-300 font-['JetBrains_Mono']">
                {cluster.weather.wind_speed_10m} <span className="text-[10px] font-normal">km/h</span>
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Risk Factors: "WHY THIS EVENT IS HIGH RISK" */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
              <span>Why This Event is High Risk</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono">
              SHAP Attributions
            </span>
          </div>

          <div className="space-y-3">
            {cluster.factor_contributions.map((fc, idx) => {
              const barWidth = Math.min(100, Math.max(10, (Math.abs(fc.impactScore) / 26) * 100));
              const isPositive = fc.impactScore > 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{fc.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-mono">{fc.value}</span>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          isPositive ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {isPositive ? `+${fc.impactScore}` : fc.impactScore} pts
                      </span>
                    </div>
                  </div>

                  {/* Impact bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isPositive ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{fc.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exposed Assets */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-sky-400" />
              <span>Potentially Exposed Assets</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {cluster.exposed_assets.length} identified
            </span>
          </div>

          <p className="text-[10px] text-slate-400 mb-2 italic">
            Geospatial proximity query within 25 km risk radius.
          </p>

          {cluster.exposed_assets.length === 0 ? (
            <p className="text-xs text-slate-500">No major critical infrastructure within 25 km.</p>
          ) : (
            <div className="space-y-2">
              {cluster.exposed_assets.slice(0, 5).map((asset) => (
                <div
                  key={asset.id}
                  className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-slate-800">{getAssetIcon(asset.type)}</div>
                    <div>
                      <span className="font-semibold text-slate-200 text-xs block">{asset.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {asset.type} {asset.population ? `&bull; Pop: ${asset.population.toLocaleString()}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-['JetBrains_Mono'] text-amber-400">
                      {asset.distanceKm} km
                    </span>
                    <span className="text-[9px] block text-slate-400 uppercase">
                      {asset.estimatedRiskZone === 'WITHIN_5KM'
                        ? 'Immediate 5km'
                        : asset.estimatedRiskZone === 'WITHIN_10KM'
                        ? '10km Corridor'
                        : '25km Buffer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Intelligence Recommendations */}
        <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              <span>Response Intelligence Recommendations</span>
            </span>
          </div>

          <div className="space-y-2">
            {cluster.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="h-4 w-4 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-orange-900/30 flex items-center gap-1.5 text-[10px] text-amber-300/80">
            <Info className="h-3 w-3 shrink-0" />
            <span>Prototype decision-support output. Not an authoritative emergency warning.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
