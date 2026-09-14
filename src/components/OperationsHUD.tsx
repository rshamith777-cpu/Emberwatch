import React, { useEffect, useState, useMemo } from 'react';
import {
  Flame,
  AlertTriangle,
  Compass,
  Building2,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Layers,
  Radio,
  Clock,
  Wind,
  Thermometer,
  Droplets,
  Crosshair,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Shield,
  Activity,
  LayoutGrid,
  Map,
  RefreshCw,
  Zap,
  Hospital,
  ArrowRight,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { FireCluster, FireObservation } from '../types/emberwatch.js';

interface OperationsHUDProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  selectedCluster: FireCluster | null;
  onSelectCluster: (c: FireCluster) => void;
  onInspectIncident: (c: FireCluster) => void;
  timeOffsetHours: number;
  onTimeOffsetChange: (offset: number) => void;
  newObservationToast: {
    visible: boolean;
    satellite: string;
    time: string;
    frp: number;
    prevRisk: number;
    newRisk: number;
  } | null;
  onDismissToast?: () => void;
  onRefreshTelemetry?: () => void;
  isRefreshing?: boolean;
  onTriggerNewObservation?: () => void;
}

export const OperationsHUD: React.FC<OperationsHUDProps> = ({
  clusters,
  hotspots,
  selectedCluster,
  onSelectCluster,
  onInspectIncident,
  timeOffsetHours,
  onTimeOffsetChange,
  newObservationToast,
  onDismissToast,
  onRefreshTelemetry,
  isRefreshing = false,
  onTriggerNewObservation
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideDockMinimized, setIsSlideDockMinimized] = useState(false);
  const [isThreatsMinimized, setIsThreatsMinimized] = useState(false);

  // View Mode: 'MAP' (Map with Slide Card) vs 'ALL_FIRES' (Full Real-Time Multi-Fire Grid)
  const [viewMode, setViewMode] = useState<'MAP' | 'ALL_FIRES'>('MAP');

  // Filter & Search in All Fires Monitor
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Auto-Refresh Countdown (12 seconds cycle)
  const [syncCountdown, setSyncCountdown] = useState(12);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);

  // Countdown timer for live auto-sync
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    const interval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          if (onRefreshTelemetry) onRefreshTelemetry();
          return 12;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoSyncEnabled, onRefreshTelemetry]);

  // Sync current slide index when selectedCluster changes externally
  useEffect(() => {
    if (selectedCluster && clusters.length > 0) {
      const idx = clusters.findIndex((c) => c.id === selectedCluster.id);
      if (idx !== -1) {
        setCurrentSlideIndex(idx);
      }
    }
  }, [selectedCluster, clusters]);

  // Global Multi-Fire Aggregations
  const totalHotspots = hotspots.length;
  const criticalCount = clusters.filter((c) => c.risk_level === 'CRITICAL').length;
  const highCount = clusters.filter((c) => c.risk_level === 'HIGH').length;
  const moderateCount = clusters.filter((c) => c.risk_level === 'MODERATE').length;
  const totalFRP = Math.round(clusters.reduce((sum, c) => sum + (c.max_frp || 0), 0));
  const totalAtRiskAssets = clusters.reduce((sum, c) => sum + (c.exposed_assets ? c.exposed_assets.length : 0), 0);

  // Active Cluster from slide index
  const activeCluster = clusters[currentSlideIndex] || selectedCluster || clusters[0];

  const handlePrevSlide = () => {
    if (clusters.length === 0) return;
    const prevIdx = (currentSlideIndex - 1 + clusters.length) % clusters.length;
    setCurrentSlideIndex(prevIdx);
    onSelectCluster(clusters[prevIdx]);
  };

  const handleNextSlide = () => {
    if (clusters.length === 0) return;
    const nextIdx = (currentSlideIndex + 1) % clusters.length;
    setCurrentSlideIndex(nextIdx);
    onSelectCluster(clusters[nextIdx]);
  };

  // Timeline playback simulation timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onTimeOffsetChange((prev) => {
          if (prev >= 0) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(0, prev + 1);
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, onTimeOffsetChange]);

  // Filtered clusters for All Fires Monitor
  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      const matchesSeverity = filterSeverity === 'ALL' || c.risk_level === filterSeverity;
      const matchesSearch =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [clusters, filterSeverity, searchQuery]);

  return (
    <>
      {/* 1. TOP LIVE REAL-TIME TELEMETRY MONITOR BAR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-auto">
        <div className="bg-[#070809]/95 backdrop-blur-xl border border-[#D8B86A]/40 px-4 py-2.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4ADE80]"></span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-black tracking-widest text-[#D8B86A] uppercase">
                REAL-TIME FIRE MONITOR
              </span>
              <span className="text-xs text-[#858078] hidden sm:inline">
                &bull; Next satellite sync in <strong className="text-[#4ADE80]">{syncCountdown}s</strong>
              </span>
            </div>
          </div>

          {/* Center Mode Switcher (Map View vs All Fires Monitor) */}
          <div className="flex items-center p-1 rounded-xl bg-[#11161D] border border-white/[0.08]">
            <button
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-[#171D24] text-[#D8B86A] border border-[#D8B86A]/40 shadow-sm'
                  : 'text-[#858078] hover:text-[#F5F0E6]'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map & Slide</span>
            </button>

            <button
              onClick={() => setViewMode('ALL_FIRES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                viewMode === 'ALL_FIRES'
                  ? 'bg-[#171D24] text-[#D8B86A] border border-[#D8B86A]/40 shadow-sm'
                  : 'text-[#858078] hover:text-[#F5F0E6]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>All Fires Grid ({clusters.length})</span>
            </button>
          </div>

          {/* Quick Actions: Simulate New Pass & Refresh */}
          <div className="flex items-center gap-2">
            {onTriggerNewObservation && (
              <button
                onClick={onTriggerNewObservation}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D8B86A]/15 hover:bg-[#D8B86A]/25 text-[#D8B86A] border border-[#D8B86A]/40 text-xs font-bold transition cursor-pointer"
                title="Simulate Real-Time Satellite Pass with New Detection"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Simulate Pass</span>
              </button>
            )}

            {onRefreshTelemetry && (
              <button
                onClick={onRefreshTelemetry}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-[#171D24] hover:bg-[#202735] text-[#D1CBC0] hover:text-[#FFFFFF] border border-white/[0.08] transition cursor-pointer disabled:opacity-50"
                title="Sync Live Telemetry Now"
              >
                <RefreshCw className={`h-4 w-4 text-[#D8B86A] ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TOP-CENTER TOAST ALERT (SATELLITE PASS) */}
      {newObservationToast && newObservationToast.visible && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto">
          <div className="bg-[#070809]/95 backdrop-blur-xl border border-[#D8B86A]/80 p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4 text-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#C84B38]/25 border border-[#C84B38]/60 flex items-center justify-center animate-pulse shrink-0">
                <Flame className="h-6 w-6 text-[#F0783C]" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#D8B86A] uppercase tracking-wider">
                  <span>REAL-TIME SATELLITE DETECTION</span>
                  <span>&bull;</span>
                  <span>{newObservationToast.satellite}</span>
                </div>
                <div className="text-[#F5F0E6] font-medium text-sm mt-0.5">
                  Peak Radiative Output <strong className="text-[#F0783C] text-base font-black">{newObservationToast.frp} MW</strong> &bull; Risk Recalculated:{' '}
                  <span className="text-[#858078] line-through">{newObservationToast.prevRisk}</span> &rarr;{' '}
                  <strong className="text-[#C84B38] text-base font-black">{newObservationToast.newRisk}/100</strong>
                </div>
              </div>
            </div>
            {onDismissToast && (
              <button
                onClick={onDismissToast}
                className="text-xs font-bold text-[#D1CBC0] hover:text-[#FFFFFF] px-3 py-1.5 rounded-lg bg-[#171D24] hover:bg-[#202735] border border-white/[0.1] cursor-pointer shrink-0 transition"
              >
                DISMISS
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. FULL "ALL FIRES REAL-TIME MONITOR" GRID (TRIGGERED VIA VIEW MODE) */}
      {viewMode === 'ALL_FIRES' ? (
        <div className="absolute inset-4 top-20 z-20 pointer-events-auto overflow-y-auto bg-[#070809]/95 backdrop-blur-2xl border border-[#D8B86A]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-6 lg:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#D8B86A] uppercase tracking-widest">
                <Radio className="h-4 w-4 text-[#4ADE80] animate-pulse" />
                <span>REAL-TIME MULTI-FIRE FLEET INTELLIGENCE</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-[#F5F0E6] mt-1 tracking-tight">
                ALL ACTIVE WILDFIRE COMPLEXES ({clusters.length})
              </h2>
              <p className="text-sm text-[#858078] mt-1">
                Live continuous monitoring of all active fire perimeters, thermal intensity, weather vectors, and critical asset exposure.
              </p>
            </div>

            {/* Global Aggregation Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0">
              <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.08]">
                <span className="text-[11px] font-bold text-[#858078] uppercase block">ACTIVE FIRES</span>
                <span className="text-2xl font-black text-[#F5F0E6] block mt-0.5">{clusters.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#C84B38]/40">
                <span className="text-[11px] font-bold text-[#858078] uppercase block">CRITICAL</span>
                <span className="text-2xl font-black text-[#C84B38] block mt-0.5">{criticalCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#F0783C]/40">
                <span className="text-[11px] font-bold text-[#858078] uppercase block">TOTAL FRP</span>
                <span className="text-2xl font-black text-[#F0783C] block mt-0.5">{totalFRP} MW</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#D8B86A]/40">
                <span className="text-[11px] font-bold text-[#858078] uppercase block">AT-RISK SITES</span>
                <span className="text-2xl font-black text-[#D8B86A] block mt-0.5">{totalAtRiskAssets}</span>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#11161D] border border-white/[0.08] overflow-x-auto w-full sm:w-auto">
              {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                    filterSeverity === sev
                      ? 'bg-[#171D24] text-[#D8B86A] border border-[#D8B86A]/40'
                      : 'text-[#858078] hover:text-[#F5F0E6]'
                  }`}
                >
                  {sev} {sev === 'ALL' ? `(${clusters.length})` : ''}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-[#858078] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fire name or region..."
                className="w-full bg-[#11161D] border border-white/[0.08] focus:border-[#D8B86A] text-xs text-[#F5F0E6] pl-9 pr-3 py-2 rounded-xl focus:outline-none placeholder-[#858078]"
              />
            </div>
          </div>

          {/* ALL FIRES MULTI-CARD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
            {filteredClusters.map((cluster) => {
              const isCritical = cluster.risk_level === 'CRITICAL';
              const isHigh = cluster.risk_level === 'HIGH';
              return (
                <div
                  key={cluster.id}
                  className="bg-[#0D1117] border border-white/[0.08] hover:border-[#D8B86A]/50 rounded-2xl p-6 shadow-xl space-y-4 transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#D8B86A] uppercase tracking-wider">
                        <span>CLUSTER #{cluster.cluster_number}</span>
                        <span>&bull;</span>
                        <span>{cluster.region}</span>
                      </div>
                      <h3 className="text-2xl font-black text-[#F5F0E6] mt-1 tracking-tight">
                        {cluster.name}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 ${
                        isCritical
                          ? 'bg-[#C84B38]/25 text-[#C84B38] border border-[#C84B38]/50'
                          : isHigh
                          ? 'bg-[#D85B35]/25 text-[#D85B35] border border-[#D85B35]/50'
                          : 'bg-[#C6A15B]/25 text-[#D8B86A] border border-[#C6A15B]/50'
                      }`}
                    >
                      {cluster.risk_level} RISK
                    </span>
                  </div>

                  {/* Big Metrics Split */}
                  <div className="grid grid-cols-3 gap-3 bg-[#11161D] p-3.5 rounded-xl border border-white/[0.06]">
                    <div>
                      <span className="text-[11px] font-bold text-[#858078] uppercase block">PREDICTED RISK</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-3xl font-black leading-none ${
                          cluster.risk_score >= 70 ? 'text-[#C84B38]' : cluster.risk_score >= 50 ? 'text-[#D85B35]' : 'text-[#D8B86A]'
                        }`}>
                          {cluster.risk_score.toFixed(0)}
                        </span>
                        <span className="text-xs text-[#858078]">/100</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#858078] uppercase block">PEAK FRP</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black text-[#F0783C] leading-none">
                          {cluster.max_frp ? cluster.max_frp.toFixed(0) : '0'}
                        </span>
                        <span className="text-xs text-[#858078]">MW</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-[#858078] uppercase block">HOTSPOTS</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black text-[#F5F0E6] leading-none">
                          {cluster.hotspot_count || (cluster as any).observations_count || 0}
                        </span>
                        <span className="text-xs text-[#858078]">VIIRS</span>
                      </div>
                    </div>
                  </div>

                  {/* Tactical Parameters Row */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.04] space-y-1">
                      <span className="text-[10px] font-bold text-[#858078] uppercase block">SPREAD PROPAGATION</span>
                      <span className="text-sm font-bold text-[#D8B86A] block">
                        {cluster.spread_estimate?.likelyThreatDirection || 'NORTHEAST'}
                      </span>
                      <span className="text-xs text-[#D1CBC0]">
                        Forward Velocity: {cluster.spread_estimate?.forwardVelocityKmh || '2.4 km/h'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.04] space-y-1">
                      <span className="text-[10px] font-bold text-[#858078] uppercase block">EXPOSED INFRASTRUCTURE</span>
                      <span className="text-sm font-bold text-[#C84B38] block">
                        {(cluster.exposed_assets || []).length} ASSETS LOGGED
                      </span>
                      <span className="text-xs text-[#D1CBC0]">
                        Includes {(cluster.exposed_assets || []).filter((a) => a.type === 'HOSPITAL').length} Medical Centers
                      </span>
                    </div>
                  </div>

                  {/* Atmospheric Weather Strip */}
                  <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.04] flex items-center justify-between text-xs font-semibold text-[#D1CBC0]">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="h-4 w-4 text-[#F0783C]" />
                      <span>{cluster.weather?.temperature_2m}&deg;C Temp</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-[#4ADE80]" />
                      <span>{cluster.weather?.relative_humidity_2m}% Humidity</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-[#D8B86A]" />
                      <span>{cluster.weather?.wind_speed_10m} km/h Wind</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        onSelectCluster(cluster);
                        setViewMode('MAP');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#171D24] hover:bg-[#202735] text-[#D8B86A] border border-[#D8B86A]/40 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      <Crosshair className="h-4 w-4" />
                      <span>FOCUS ON MAP</span>
                    </button>

                    <button
                      onClick={() => onInspectIncident(cluster)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#D8B86A] to-[#C6A15B] hover:from-[#E6D19A] hover:to-[#D8B86A] text-[#050505] text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
                    >
                      <span>INSPECT INTELLIGENCE</span>
                      <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 4. MAP VIEW: SLIDE CARD & THREATS SUMMARY */
        <>
          {/* Floating Left: Active Threats Intelligence HUD */}
          <div className="absolute top-20 left-4 z-20 w-80 max-w-[calc(100vw-32px)] pointer-events-auto">
            <div className="bg-[#070809]/95 backdrop-blur-xl border border-[#C6A15B]/40 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300">
              {/* Header */}
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#D8B86A]" />
                  <span className="text-xs font-bold tracking-[0.16em] text-[#D8B86A] uppercase">
                    ACTIVE THREATS
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode('ALL_FIRES')}
                    className="px-2 py-0.5 rounded bg-[#171D24] hover:bg-[#202735] text-[10px] font-bold text-[#D8B86A] border border-white/[0.08] cursor-pointer transition"
                    title="Open All Fires Fleet Grid"
                  >
                    VIEW ALL ({clusters.length})
                  </button>
                  <button
                    onClick={() => setIsThreatsMinimized(!isThreatsMinimized)}
                    className="p-1 rounded text-[#858078] hover:text-[#F5F0E6] hover:bg-white/[0.05] cursor-pointer transition"
                    title={isThreatsMinimized ? 'Expand Threats Panel' : 'Minimize Threats Panel'}
                  >
                    {isThreatsMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isThreatsMinimized && (
                <div className="p-4 space-y-4">
                  {/* Main Count Badge */}
                  <div className="flex items-baseline justify-between bg-[#11161D]/80 p-3 rounded-xl border border-white/[0.06]">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#858078] block font-medium">
                        INCIDENT CLUSTERS
                      </span>
                      <span className="text-3xl font-black text-[#F5F0E6] leading-none mt-1 block">
                        {clusters.length.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase tracking-wider text-[#858078] block font-medium">
                        SATELLITE HOTSPOTS
                      </span>
                      <span className="text-2xl font-bold text-[#F0783C] leading-none mt-1 block">
                        {totalHotspots}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown Grid: Big Bold Numbers */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-[#171D24]/80 border border-[#C84B38]/40">
                      <span className="text-[11px] font-semibold text-[#858078] uppercase block">CRITICAL</span>
                      <span className="text-2xl font-black text-[#C84B38] block mt-0.5">
                        {criticalCount.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#171D24]/80 border border-[#D85B35]/40">
                      <span className="text-[11px] font-semibold text-[#858078] uppercase block">HIGH</span>
                      <span className="text-2xl font-black text-[#D85B35] block mt-0.5">
                        {highCount.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#171D24]/80 border border-[#C6A15B]/40">
                      <span className="text-[11px] font-semibold text-[#858078] uppercase block">MODERATE</span>
                      <span className="text-2xl font-black text-[#D8B86A] block mt-0.5">
                        {moderateCount.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Quick Incident Jumper */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-[#858078] uppercase block">
                      SELECT FIRE TO MONITOR
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {clusters.map((c, idx) => {
                        const isSelected = activeCluster?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCurrentSlideIndex(idx);
                              onSelectCluster(c);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition cursor-pointer text-sm ${
                              isSelected
                                ? 'bg-[#171D24] border border-[#D8B86A] text-[#F5F0E6] shadow-md font-semibold'
                                : 'bg-[#11161D]/70 hover:bg-[#171D24] border border-white/[0.04] text-[#D1CBC0] hover:text-[#FFFFFF]'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-bold text-[#D8B86A]">#{c.cluster_number}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  c.risk_score >= 70
                                    ? 'bg-[#C84B38]/20 text-[#C84B38]'
                                    : c.risk_score >= 50
                                    ? 'bg-[#D85B35]/20 text-[#D85B35]'
                                    : 'bg-[#C6A15B]/20 text-[#D8B86A]'
                                }`}
                              >
                                {c.risk_score.toFixed(0)}
                              </span>
                              <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-[#D8B86A]' : 'text-zinc-600'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Slide Card: Big, Bold, Interactive Incident Deck */}
          {activeCluster && (
            <div className="absolute top-20 right-4 z-20 w-96 max-w-[calc(100vw-32px)] pointer-events-auto">
              <div className="bg-[#070809]/95 backdrop-blur-xl border border-[#D8B86A]/50 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300">
                {/* Slide Navigation Header */}
                <div className="bg-[#11161D] p-3 border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#D8B86A]/15 border border-[#D8B86A]/40 text-xs font-bold text-[#D8B86A] tracking-wider uppercase">
                      SLIDE {currentSlideIndex + 1} OF {clusters.length}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        activeCluster.risk_level === 'CRITICAL'
                          ? 'bg-[#C84B38]/25 text-[#C84B38] border border-[#C84B38]/50'
                          : activeCluster.risk_level === 'HIGH'
                          ? 'bg-[#D85B35]/25 text-[#D85B35] border border-[#D85B35]/50'
                          : 'bg-[#C6A15B]/25 text-[#D8B86A] border border-[#C6A15B]/50'
                      }`}
                    >
                      {activeCluster.risk_level} THREAT
                    </span>
                  </div>

                  {/* Slider Arrows & Minimize */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevSlide}
                      className="p-1.5 rounded-lg bg-[#171D24] hover:bg-[#202735] text-[#D8B86A] hover:text-[#FFFFFF] border border-white/[0.08] transition cursor-pointer"
                      title="Previous Incident Card"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="p-1.5 rounded-lg bg-[#171D24] hover:bg-[#202735] text-[#D8B86A] hover:text-[#FFFFFF] border border-white/[0.08] transition cursor-pointer"
                      title="Next Incident Card"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsSlideDockMinimized(!isSlideDockMinimized)}
                      className="p-1.5 rounded-lg bg-[#171D24] hover:bg-[#202735] text-[#858078] hover:text-[#FFFFFF] border border-white/[0.08] transition cursor-pointer ml-1"
                      title={isSlideDockMinimized ? 'Expand Slide Card' : 'Minimize Slide Card'}
                    >
                      {isSlideDockMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isSlideDockMinimized && (
                  <div className="p-5 space-y-4">
                    {/* Fire Incident Title (Big, Clear, Beautiful) */}
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#D8B86A] uppercase tracking-wider">
                        <span>INCIDENT #{activeCluster.cluster_number}</span>
                        <span>&bull;</span>
                        <span>{activeCluster.observations_count || activeCluster.hotspot_count || 0} OBSERVATIONS</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-black text-[#F5F0E6] mt-1 leading-tight tracking-tight">
                        {activeCluster.name}
                      </h3>
                      <p className="text-sm font-medium text-[#D1CBC0] mt-1 flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-[#D8B86A]" />
                        <span>{activeCluster.region}</span>
                      </p>
                    </div>

                    {/* Big Bold ML Risk Score Display */}
                    <div className="bg-gradient-to-br from-[#11161D] to-[#171D24] p-4 rounded-xl border border-white/[0.08] shadow-inner flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#858078] font-bold block">
                          PREDICTED RISK SCORE
                        </span>
                        <span className="text-xs text-[#D8B86A] mt-0.5 block font-medium">
                          Calibrated Ensemble ML
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-5xl font-black leading-none ${
                            activeCluster.risk_score >= 70
                              ? 'text-[#C84B38]'
                              : activeCluster.risk_score >= 50
                              ? 'text-[#D85B35]'
                              : 'text-[#D8B86A]'
                          }`}
                        >
                          {activeCluster.risk_score.toFixed(0)}
                        </span>
                        <span className="text-xl font-bold text-[#858078]">/100</span>
                      </div>
                    </div>

                    {/* Tactical Parameters Grid (Clear, Spacious, Big) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Threat Propagation */}
                      <div className="p-3 rounded-xl bg-[#11161D]/90 border border-white/[0.06] space-y-1">
                        <span className="text-[11px] font-bold text-[#858078] uppercase tracking-wider block">
                          SPREAD VECTOR
                        </span>
                        <span className="text-sm font-bold text-[#D8B86A] block">
                          {activeCluster.spread_estimate?.likelyThreatDirection || 'NORTHEAST'}
                        </span>
                        <span className="text-xs text-[#D1CBC0] font-medium block">
                          {activeCluster.spread_estimate?.forwardVelocityKmh || '2.4 km/h'}
                        </span>
                      </div>

                      {/* Infrastructure Exposure */}
                      <div className="p-3 rounded-xl bg-[#11161D]/90 border border-white/[0.06] space-y-1">
                        <span className="text-[11px] font-bold text-[#858078] uppercase tracking-wider block">
                          INFRASTRUCTURE
                        </span>
                        <span className="text-sm font-bold text-[#C84B38] block">
                          {(activeCluster.exposed_assets || []).length} AT-RISK ASSETS
                        </span>
                        <span className="text-xs text-[#D1CBC0] font-medium block">
                          Within 10km Buffer
                        </span>
                      </div>
                    </div>

                    {/* Weather & Atmospheric Telemetry */}
                    <div className="p-3 rounded-xl bg-[#11161D]/90 border border-white/[0.06] grid grid-cols-3 gap-2 text-center text-xs text-[#F5F0E6]">
                      <div className="flex flex-col items-center">
                        <Thermometer className="h-4 w-4 text-[#F0783C] mb-1" />
                        <span className="text-sm font-bold">{activeCluster.weather?.temperature_2m}&deg;C</span>
                        <span className="text-[10px] text-[#858078] uppercase">Temp</span>
                      </div>
                      <div className="flex flex-col items-center border-x border-white/[0.08]">
                        <Droplets className="h-4 w-4 text-[#4ADE80] mb-1" />
                        <span className="text-sm font-bold">{activeCluster.weather?.relative_humidity_2m}%</span>
                        <span className="text-[10px] text-[#858078] uppercase">Humidity</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Wind className="h-4 w-4 text-[#D8B86A] mb-1" />
                        <span className="text-sm font-bold">{activeCluster.weather?.wind_speed_10m} km/h</span>
                        <span className="text-[10px] text-[#858078] uppercase">Wind</span>
                      </div>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => onInspectIncident(activeCluster)}
                        id="btn-inspect-priority"
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#D8B86A] to-[#C6A15B] hover:from-[#E6D19A] hover:to-[#D8B86A] text-[#050505] text-sm font-black tracking-wide uppercase transition cursor-pointer shadow-[0_4px_20px_rgba(216,184,106,0.35)] hover:shadow-[0_6px_28px_rgba(216,184,106,0.5)]"
                      >
                        <span>INSPECT DEEP INTELLIGENCE</span>
                        <ArrowUpRight className="h-4 w-4 stroke-[3]" />
                      </button>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={handlePrevSlide}
                          className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#171D24] hover:bg-[#202735] text-[#D8B86A] border border-white/[0.08] text-xs font-bold uppercase transition cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>PREV CARD</span>
                        </button>
                        <button
                          onClick={handleNextSlide}
                          className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#171D24] hover:bg-[#202735] text-[#D8B86A] border border-white/[0.08] text-xs font-bold uppercase transition cursor-pointer"
                        >
                          <span>NEXT CARD</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Slide dots indicator */}
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      {clusters.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentSlideIndex(idx);
                            onSelectCluster(clusters[idx]);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            currentSlideIndex === idx
                              ? 'w-6 bg-[#D8B86A]'
                              : 'w-2 bg-white/[0.2] hover:bg-white/[0.4]'
                          }`}
                          title={`Jump to Card ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Bottom: Cinematic Timeline Playback Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-4 pointer-events-auto">
            <div className="bg-[#070809]/95 backdrop-blur-xl border border-[#C6A15B]/40 p-4 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#D8B86A]" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8B86A]">
                    4-HOUR TEMPORAL REPLAY &bull; SATELLITE SCRUB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171D24] hover:bg-[#202735] text-[#D8B86A] hover:text-[#FFFFFF] border border-[#D8B86A]/40 text-xs font-bold tracking-wider transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  <button
                    onClick={() => onTimeOffsetChange(0)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11161D] hover:bg-[#171D24] text-[#D1CBC0] hover:text-[#FFFFFF] border border-white/[0.08] text-xs font-bold tracking-wider transition cursor-pointer"
                    title="Reset to Real-Time Live Stream"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>LIVE NOW</span>
                  </button>
                </div>
              </div>

              {/* Timeline Range Track */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="-4"
                  max="0"
                  step="1"
                  value={timeOffsetHours}
                  onChange={(e) => onTimeOffsetChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[#D8B86A] cursor-pointer h-2 bg-[#171D24] rounded-lg"
                />
                <div className="flex justify-between text-xs font-semibold text-[#858078]">
                  <span className={timeOffsetHours === -4 ? 'text-[#D8B86A] font-bold' : ''}>-4 HOURS (T-4h)</span>
                  <span className={timeOffsetHours === -3 ? 'text-[#D8B86A] font-bold' : ''}>-3 HOURS</span>
                  <span className={timeOffsetHours === -2 ? 'text-[#D8B86A] font-bold' : ''}>-2 HOURS</span>
                  <span className={timeOffsetHours === -1 ? 'text-[#D8B86A] font-bold' : ''}>-1 HOUR</span>
                  <span className={timeOffsetHours === 0 ? 'text-[#4ADE80] font-bold' : ''}>LIVE (NOW)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
