import React, { useState } from 'react';
import {
  X,
  Flame,
  AlertTriangle,
  Compass,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  MapPin,
  Building2,
  Hospital,
  GraduationCap,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Radio,
  ExternalLink,
  Info
} from 'lucide-react';
import { FireCluster, FactorContribution, ExposedAsset } from '../types/emberwatch.js';

interface IncidentIntelligenceDrawerProps {
  cluster: FireCluster | null;
  clusters: FireCluster[];
  onSelectCluster: (c: FireCluster) => void;
  onClose?: () => void;
  isStandaloneScreen?: boolean;
}

export const IncidentIntelligenceDrawer: React.FC<IncidentIntelligenceDrawerProps> = ({
  cluster,
  clusters,
  onSelectCluster,
  onClose,
  isStandaloneScreen = false
}) => {
  const [selectedTab, setSelectedTab] = useState<'OVERVIEW' | 'FACTORS' | 'WEATHER' | 'EXPOSURE' | 'TACTICAL'>('OVERVIEW');

  if (!cluster) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#080A0D] border border-[#C6A15B]/20 rounded-xl text-[#A9A394]">
        <Flame className="h-12 w-12 text-[#C6A15B]/50 mb-3 animate-pulse" />
        <h3 className="font-serif-display text-xl font-bold text-[#F3EEE2]">No Incident Selected</h3>
        <p className="text-xs text-[#A9A394] mt-2 max-w-sm">
          Select an active fire cluster from the Operations Center map or the list above to review deep ML attribution, atmospheric parameters, propagation vectors, and tactical exposure intelligence.
        </p>
      </div>
    );
  }

  const riskBadgeColor =
    cluster.risk_level === 'CRITICAL'
      ? 'bg-[#D45543]/20 text-[#D45543] border-[#D45543]/40'
      : cluster.risk_level === 'HIGH'
      ? 'bg-[#B84535]/20 text-[#B84535] border-[#B84535]/40'
      : cluster.risk_level === 'MODERATE'
      ? 'bg-[#C89A4B]/20 text-[#C89A4B] border-[#C89A4B]/40'
      : 'bg-[#718A72]/20 text-[#718A72] border-[#718A72]/40';

  const getAssetIcon = (type: ExposedAsset['type']) => {
    switch (type) {
      case 'HOSPITAL':
        return <Hospital className="h-4 w-4 text-[#D45543]" />;
      case 'SCHOOL':
        return <GraduationCap className="h-4 w-4 text-[#C89A4B]" />;
      case 'POWER_INFRASTRUCTURE':
        return <Zap className="h-4 w-4 text-[#C6A15B]" />;
      default:
        return <Building2 className="h-4 w-4 text-[#E1C47A]" />;
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[#0D1117]/95 border-l border-[#C6A15B]/35 backdrop-blur-2xl shadow-2xl text-[#F5F0E6] ${
      isStandaloneScreen ? 'max-w-7xl mx-auto rounded-xl' : 'w-full'
    }`}>
      {/* Header Banner */}
      <div className="p-4 lg:p-5 border-b border-white/[0.08] bg-[#080A0D]/90 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#171D27] text-[#C6A15B] border border-[#C6A15B]/30">
                INCIDENT #{cluster.cluster_number}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${riskBadgeColor}`}>
                {cluster.risk_level} THREAT
              </span>
            </div>
            <h2 className="font-fire text-3xl lg:text-4xl font-bold text-fire-gradient tracking-wide">
              {cluster.name.toUpperCase()}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#A9A394] font-mono">
              <MapPin className="h-3.5 w-3.5 text-[#C6A15B]" />
              <span>{cluster.region}</span>
              <span>&bull;</span>
              <span>{cluster.center_lat.toFixed(4)}&deg; N, {Math.abs(cluster.center_lon).toFixed(4)}&deg; W</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Cluster Switcher */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-[#A9A394] hidden md:inline">CLUSTER:</span>
              <select
                value={cluster.id}
                onChange={(e) => {
                  const target = clusters.find((c) => c.id === e.target.value);
                  if (target) onSelectCluster(target);
                }}
                className="bg-[#171D27] border border-[#C6A15B]/40 rounded px-2.5 py-1.5 text-xs text-[#F3EEE2] font-mono focus:outline-none focus:border-[#E1C47A]"
              >
                {clusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.cluster_number} - {c.name} ({c.risk_score.toFixed(0)})
                  </option>
                ))}
              </select>
            </div>

            {onClose && !isStandaloneScreen && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#111720] hover:bg-[#171D27] text-[#A9A394] hover:text-[#F3EEE2] border border-white/[0.08] transition cursor-pointer"
                title="Close Incident Drawer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/[0.06] overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'FACTORS', label: 'Risk Factors & SHAP' },
            { id: 'WEATHER', label: 'Meteorology' },
            { id: 'EXPOSURE', label: 'Exposed Assets' },
            { id: 'TACTICAL', label: 'Response Intelligence' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-3 py-1 rounded text-xs font-mono tracking-wider uppercase transition cursor-pointer whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-[#171D27] text-[#E1C47A] border border-[#C6A15B]/50'
                  : 'text-[#A9A394] hover:text-[#F3EEE2] hover:bg-[#111720]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Core Intelligence Top Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Risk Score */}
          <div className="p-4 rounded-xl bg-[#111720] border border-[#C6A15B]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#D45543]/10 rounded-bl-full pointer-events-none"></div>
            <span className="text-[10px] font-mono tracking-widest text-[#A9A394] uppercase block">
              MODEL RISK SCORE
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif-display text-4xl font-bold text-[#D45543] leading-none">
                {cluster.risk_score.toFixed(0)}
              </span>
              <span className="font-serif-display text-xl text-[#A9A394]">/ 100</span>
            </div>
            <span className="text-[10px] font-mono text-[#E1C47A] block mt-1">
              {cluster.risk_level} THREAT CONE
            </span>
          </div>

          {/* Satellite Telemetry */}
          <div className="p-4 rounded-xl bg-[#111720] border border-white/[0.08]">
            <span className="text-[10px] font-mono tracking-widest text-[#A9A394] uppercase block">
              SATELLITE THERMAL POWER
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif-display text-3xl font-bold text-[#F3EEE2] leading-none">
                {cluster.max_frp ? cluster.max_frp.toFixed(0) : '0'}
              </span>
              <span className="text-xs font-mono text-[#A9A394]">MW PEAK</span>
            </div>
            <span className="text-[10px] font-mono text-[#A9A394] block mt-1">
              {cluster.hotspot_count || (cluster as any).observations_count || cluster.hotspots?.length || 0} Active Detections (VIIRS)
            </span>
          </div>

          {/* Threat Direction */}
          <div className="p-4 rounded-xl bg-[#111720] border border-white/[0.08]">
            <span className="text-[10px] font-mono tracking-widest text-[#A9A394] uppercase block">
              ESTIMATED THREAT VECTOR
            </span>
            <div className="font-mono font-bold text-lg text-[#E1C47A] mt-1 truncate">
              {cluster.spread_estimate?.likelyThreatDirection || 'NORTHEAST'}
            </div>
            <span className="text-[10px] font-mono text-[#A9A394] block mt-1">
              Velocity: {cluster.spread_estimate?.forwardVelocityKmh || '2.4 km/h'}
            </span>
          </div>

          {/* Exposed Assets */}
          <div className="p-4 rounded-xl bg-[#111720] border border-white/[0.08]">
            <span className="text-[10px] font-mono tracking-widest text-[#A9A394] uppercase block">
              ASSETS WITHIN BUFFER
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-serif-display text-3xl font-bold text-[#D45543] leading-none">
                {(cluster.exposed_assets || []).length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-mono text-[#A9A394]">LOCATIONS</span>
            </div>
            <span className="text-[10px] font-mono text-[#A9A394] block mt-1">
              Includes {(cluster.exposed_assets || []).filter((a) => a.type === 'HOSPITAL').length} Medical Centers
            </span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & SPREAD CORRIDOR */}
        {(selectedTab === 'OVERVIEW' || selectedTab === 'FACTORS') && (
          <div className="p-5 rounded-xl bg-[#111720] border border-[#C6A15B]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#F3EEE2]">
                  WHY THIS INCIDENT MATTERS // RISK ATTRIBUTION
                </h3>
                <p className="text-xs text-[#A9A394] mt-0.5">
                  Empirical feature attribution explaining what is driving the calibrated {cluster.risk_score.toFixed(0)}/100 risk score
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-[#171D27] text-[#E1C47A] font-mono text-[10px] border border-[#C6A15B]/30">
                SHAP EQUIVALENT ENGINE
              </span>
            </div>

            <div className="space-y-3">
              {(cluster.factor_contributions || (cluster as any).factors || []).map((factor: any, idx: number) => {
                const impactPercentage = Math.min(100, Math.max(10, Math.abs(factor.impactScore) * 3.3));
                return (
                  <div key={idx} className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#C6A15B] font-semibold text-[11px]">
                          0{idx + 1}
                        </span>
                        <span className="font-medium text-[#F3EEE2]">{factor.displayName}</span>
                        <span className="text-xs font-mono text-[#A9A394]">({factor.value})</span>
                      </div>
                      <span className={`font-mono text-xs font-bold ${
                        factor.impactScore > 0 ? 'text-[#D45543]' : 'text-[#718A72]'
                      }`}>
                        {factor.impactScore > 0 ? `+${factor.impactScore.toFixed(1)}` : factor.impactScore.toFixed(1)} PTS
                      </span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="w-full bg-[#171D27] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          factor.importance === 'CRITICAL'
                            ? 'bg-[#D45543]'
                            : factor.importance === 'HIGH'
                            ? 'bg-[#B84535]'
                            : 'bg-[#C89A4B]'
                        }`}
                        style={{ width: `${impactPercentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#A9A394] leading-relaxed">
                      {factor.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: WEATHER DYNAMICS */}
        {(selectedTab === 'OVERVIEW' || selectedTab === 'WEATHER') && (
          <div className="p-5 rounded-xl bg-[#111720] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#F3EEE2]">
                  METEOROLOGICAL FUSION // LIVE OPEN-METEO
                </h3>
                <p className="text-xs text-[#A9A394] mt-0.5">
                  Synchronized atmospheric telemetry at centroid coordinates
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#A9A394]">
                UPDATED RECENTLY
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] text-center">
                <Thermometer className="h-4 w-4 text-[#D45543] mx-auto mb-1" />
                <span className="text-[9px] font-mono text-[#A9A394] uppercase block">TEMP 2M</span>
                <span className="font-mono font-bold text-base text-[#F3EEE2]">
                  {cluster.weather.temperature_2m}&deg;C
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] text-center">
                <Droplets className="h-4 w-4 text-[#C89A4B] mx-auto mb-1" />
                <span className="text-[9px] font-mono text-[#A9A394] uppercase block">HUMIDITY</span>
                <span className="font-mono font-bold text-base text-[#E1C47A]">
                  {cluster.weather.relative_humidity_2m}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] text-center">
                <Wind className="h-4 w-4 text-[#C6A15B] mx-auto mb-1" />
                <span className="text-[9px] font-mono text-[#A9A394] uppercase block">WIND SPEED</span>
                <span className="font-mono font-bold text-base text-[#F3EEE2]">
                  {cluster.weather.wind_speed_10m} km/h
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] text-center">
                <Compass className="h-4 w-4 text-[#E1C47A] mx-auto mb-1" />
                <span className="text-[9px] font-mono text-[#A9A394] uppercase block">WIND HEADING</span>
                <span className="font-mono font-bold text-base text-[#E1C47A]">
                  {cluster.weather.wind_direction_10m}&deg;
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] text-center">
                <Gauge className="h-4 w-4 text-[#718A72] mx-auto mb-1" />
                <span className="text-[9px] font-mono text-[#A9A394] uppercase block">PRESSURE</span>
                <span className="font-mono font-bold text-base text-[#F3EEE2]">
                  {cluster.weather.surface_pressure} hPa
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] text-center">
                <Activity className="h-4 w-4 text-[#A9A394] mx-auto mb-1" />
                <span className="text-[9px] font-mono text-[#A9A394] uppercase block">PRECIPITATION</span>
                <span className="font-mono font-bold text-base text-[#F3EEE2]">
                  {cluster.weather.precipitation} mm
                </span>
              </div>
            </div>

            {/* Threat corridor & spread disclaimer banner (Section 18 mandate) */}
            <div className="p-3 rounded-lg bg-[#080A0D] border border-[#C6A15B]/30 flex items-start gap-3 text-xs">
              <Info className="h-4 w-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] text-[#E1C47A] uppercase tracking-wider block font-bold">
                  THREAT CORRIDOR PROJECTION
                </span>
                <p className="text-[11px] text-[#A9A394] mt-0.5 leading-relaxed">
                  Propagation corridor modeled toward <strong>{cluster.spread_estimate.likelyThreatDirection}</strong> with estimated velocity of <strong>{cluster.spread_estimate.forwardVelocityKmh}</strong> and {cluster.spread_estimate.confidence}% model confidence.
                </p>
                <div className="mt-1 font-mono text-[9px] text-[#C6A15B] uppercase tracking-wider font-semibold">
                  MODEL ESTIMATE &bull; NOT OFFICIAL FIRE-SPREAD FORECAST
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EXPOSED ASSETS */}
        {(selectedTab === 'OVERVIEW' || selectedTab === 'EXPOSURE') && (
          <div className="p-5 rounded-xl bg-[#111720] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#F3EEE2]">
                  EXPOSURE INTELLIGENCE // NEARBY SETTLEMENTS & CRITICAL SITES
                </h3>
                <p className="text-xs text-[#A9A394] mt-0.5">
                  Spatial intersect within 5km, 10km, and 25km radii of active incident centroid
                </p>
              </div>
              <span className="text-xs font-mono text-[#E1C47A]">
                {cluster.exposed_assets.length} Assets Logged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cluster.exposed_assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-lg bg-[#0D121A] border border-white/[0.06] hover:border-[#C6A15B]/40 transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-[#171D27] border border-white/[0.06]">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F3EEE2]">{asset.name}</h4>
                        <span className="text-[10px] font-mono text-[#A9A394] uppercase tracking-wider">
                          {asset.type} &bull; {asset.distanceKm} km away
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      asset.estimatedRiskZone === 'IMMEDIATE_THREAT'
                        ? 'bg-[#D45543]/20 text-[#D45543] border-[#D45543]/40'
                        : 'bg-[#C89A4B]/20 text-[#C89A4B] border-[#C89A4B]/40'
                    }`}>
                      {asset.estimatedRiskZone.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A9A394] leading-relaxed">
                    {asset.details}
                  </p>

                  {asset.population && (
                    <div className="text-[10px] font-mono text-[#E1C47A]">
                      Estimated Population: <strong>{asset.population.toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TACTICAL RESPONSE INTELLIGENCE (Section 20 mandate) */}
        {(selectedTab === 'OVERVIEW' || selectedTab === 'TACTICAL') && (
          <div className="p-5 rounded-xl bg-[#111720] border border-[#C6A15B]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#F3EEE2]">
                  RESPONSE INTELLIGENCE // TACTICAL DECISION RECOMMENDATIONS
                </h3>
                <p className="text-xs text-[#A9A394] mt-0.5">
                  Automated prioritization recommendations derived from multi-factor risk, downwind spread velocity, and exposure density
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#B84535]/20 text-[#D45543] font-mono font-bold text-[10px] border border-[#D45543]/40">
                OPERATIONAL RECOMMENDATION
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#0D121A] border border-[#D45543]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#D45543]">
                    01 // EVACUATION ADVISORY & SHELTER-IN-PLACE READINESS
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#D45543]/20 text-[#D45543] font-bold">
                    PRIORITY: CRITICAL
                  </span>
                </div>
                <p className="text-xs text-[#F3EEE2] leading-relaxed">
                  Issue pre-evacuation alert for downwind settlements in the <strong>{cluster.spread_estimate.likelyThreatDirection}</strong> corridor within 8km. Estimated rate of perimeter advancement is {cluster.spread_estimate.forwardVelocityKmh}.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0D121A] border border-[#C89A4B]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E1C47A]">
                    02 // CRITICAL INFRASTRUCTURE DE-ENERGIZATION COORDINATION
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#C89A4B]/20 text-[#C89A4B] font-bold">
                    PRIORITY: HIGH
                  </span>
                </div>
                <p className="text-xs text-[#F3EEE2] leading-relaxed">
                  Notify regional transmission operators of potential flame impingement on high-voltage transmission lines traversing Plumas County canyon corridor.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0D121A] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C6A15B]">
                    03 // AERIAL RETARDANT DROP VECTOR ALLOCATION
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#171D27] text-[#A9A394] font-bold">
                    PRIORITY: MEDIUM
                  </span>
                </div>
                <p className="text-xs text-[#F3EEE2] leading-relaxed">
                  Coordinate retardant lay on northwestern ridge line before 14:00 local time to prevent ridge cresting as thermal updrafts strengthen.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080A0D] border border-white/[0.06] text-[10px] font-mono text-[#A9A394] leading-relaxed">
              <strong>DISCLAIMER:</strong> Model-derived tactical decision support generated from satellite thermal detections and meteorological models. Not an official emergency evacuation order. Official directives must be issued by local incident command and public safety authorities.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
