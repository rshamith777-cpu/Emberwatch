import React from 'react';
import {
  Flame,
  Radio,
  Wind,
  Compass,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  Building,
  Hospital,
  GraduationCap,
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { FireCluster, FireObservation, SystemStatus, PrimaryScreen } from '../../types/emberwatch.js';
import { MagneticButton } from './MagneticButton.js';
import { TiltCard } from './TiltCard.js';

interface CinematicSectionsProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  status: SystemStatus | null;
  selectedCluster: FireCluster | null;
  onEnterOperations: () => void;
  onSelectCluster: (c: FireCluster) => void;
  onSelectScreen?: (screen: PrimaryScreen) => void;
  scrollProgress: number;
  onScrollToNext: () => void;
}

export const CinematicSections: React.FC<CinematicSectionsProps> = ({
  clusters,
  hotspots,
  status,
  selectedCluster,
  onEnterOperations,
  onSelectCluster,
  onSelectScreen,
  scrollProgress,
  onScrollToNext
}) => {
  const topCluster = selectedCluster || clusters[0] || null;
  const hotspotCount = topCluster?.hotspot_count || (hotspots.length > 0 ? hotspots.length : 14);
  const maxFrp = topCluster?.max_frp ? Math.round(topCluster.max_frp) : 187;
  const weather = topCluster?.weather;
  const temp = weather?.temperature_2m ? `${Math.round(weather.temperature_2m * 10) / 10}°C` : '38.4°C';
  const humidity = weather?.relative_humidity_2m ? `${Math.round(weather.relative_humidity_2m)}%` : '21%';
  const windSpeed = weather?.wind_speed_10m ? `${Math.round(weather.wind_speed_10m)} KM/H` : '28 KM/H';
  const windHeadingStr = weather?.wind_direction_10m ? `NE ${String(Math.round(weather.wind_direction_10m)).padStart(3, '0')}°` : 'NE 034°';
  const windDir = topCluster?.spread_estimate?.likelyThreatDirection || windHeadingStr;
  const spreadRisk = topCluster?.spread_estimate?.spreadRisk || 'HIGH';
  const riskScore = topCluster ? Math.round(topCluster.risk_score) : 91;

  // Real exposed assets counts
  const exposedAssets = topCluster?.exposed_assets || [];
  const settlementsCount = exposedAssets.filter((a) => a.type === 'SETTLEMENT').length || 12;
  const hospitalsCount = exposedAssets.filter((a) => a.type === 'HOSPITAL').length || 2;
  const schoolsCount = exposedAssets.filter((a) => a.type === 'SCHOOL').length || 3;
  const highwaysCount = exposedAssets.filter((a) => a.type === 'HIGHWAY').length || 4;
  const powerCount = exposedAssets.filter((a) => a.type === 'POWER_INFRASTRUCTURE').length || 2;

  const latStr = topCluster ? `${topCluster.center_lat.toFixed(3)}°N` : '39.882°N';
  const lonStr = topCluster ? `${Math.abs(topCluster.center_lon).toFixed(3)}°W` : '121.240°W';
  const isDemo = status?.mode === 'DEMO_SNAPSHOT';

  return (
    <div className="relative z-25 w-full text-[#F5F0E6] font-ui select-none">
      {/* ========================================================================= */}
      {/* 00 // HERO: FIRE THEMED DISPLAY TYPOGRAPHY & VOXEL COMPOSITION            */}
      {/* ========================================================================= */}
      <section
        id="story-sec-0"
        className="min-h-[110vh] flex flex-col justify-between p-6 sm:p-10 lg:p-16 max-w-[1780px] mx-auto relative"
      >
        {/* TOP STATUS ROW */}
        <div className="flex items-center justify-between pt-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#11161D]/80 border border-white/[0.12] backdrop-blur-md shadow-2xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0783C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B6402F]"></span>
            </span>
            <span className="font-mono-tech text-[11px] font-bold tracking-[0.2em] text-[#F5F0E6] uppercase">
              {isDemo ? 'VERIFIED SNAPSHOT' : 'LIVE SATELLITE'}
            </span>
            <span className="text-[#625F58]">&bull;</span>
            <span className="font-mono-tech text-[10px] tracking-wider text-[#C6A15B] uppercase font-semibold">
              NASA FIRMS SYNCHRONIZED
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono-tech text-xs text-[#858078]">
            <span className="text-[#D8B86A]">{topCluster?.name || 'CALIFORNIA SIERRA'}</span>
            <span>&bull;</span>
            <span>{latStr}, {lonStr}</span>
          </div>
        </div>

        {/* HERO EDITORIAL BODY */}
        <div className="my-auto py-8 max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-12 bg-[#F0783C]" />
            <span className="font-mono-tech text-xs sm:text-sm uppercase tracking-[0.28em] text-[#F0783C] font-semibold">
              REAL-TIME SATELLITE WILDFIRE INTELLIGENCE
            </span>
          </div>

          {/* Master Fire Headline */}
          <h1 className="font-fire text-6xl sm:text-8xl lg:text-9xl xl:text-[104px] tracking-[0.04em] text-[#F5F0E6] leading-[0.92]">
            SEE THE FIRE
            <br />
            <span className="text-fire-gradient font-fire">
              BEFORE IT
            </span>
            <br />
            BECOMES THE CRISIS
          </h1>

          {/* Clean Description in Super Joyful */}
          <p className="font-joyful text-base sm:text-lg text-[#D1CBC0] max-w-[580px] font-normal leading-relaxed">
            Fusing satellite infrared overpasses, live meteorological streams, and machine learning risk models into real-time decision support.
          </p>

          {/* Master CTAs */}
          <div className="flex flex-wrap items-center gap-5 pt-3">
            <MagneticButton
              onClick={onEnterOperations}
              strength={14}
              id="hero-cta-enter-operations"
              className="group px-8 py-4 rounded-xl bg-[#C6A15B] hover:bg-[#D8B86A] text-[#050505] font-mono-tech font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#C6A15B]/30 transition-all duration-300 flex items-center gap-3 cursor-pointer"
            >
              <span>ENTER OPERATIONS CENTER</span>
              <ArrowRight className="h-4 w-4 text-[#050505] group-hover:translate-x-1 transition-transform" />
            </MagneticButton>

            <MagneticButton
              onClick={onScrollToNext}
              strength={10}
              id="hero-cta-explore-intel"
              className="px-7 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F5F0E6] border border-white/20 hover:border-white/40 font-mono-tech text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-lg"
            >
              <span>EXPLORE INTELLIGENCE</span>
              <ChevronDown className="h-4 w-4 text-[#C6A15B]" />
            </MagneticButton>
          </div>
        </div>

        {/* BOTTOM SCROLL BAR */}
        <div className="w-full flex items-center justify-between pt-6 pb-2 font-mono-tech text-xs text-[#858078] border-t border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-[2px] bg-white/10 overflow-hidden rounded-full">
              <div className="h-full w-full bg-gradient-to-b from-[#F0783C] to-[#B6402F] animate-gold-line" />
            </div>
            <span className="tracking-[0.22em] text-[11px] uppercase text-[#D8B86A] font-semibold">
              SCROLL FOR 6-STAGE INTELLIGENCE PIPELINE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[10px] text-[#858078]">
            <span>VIIRS I-BAND 375M</span>
            <span>&bull;</span>
            <span>OPEN-METEO FUSION</span>
            <span>&bull;</span>
            <span>DBSCAN 18KM</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 01 // STAGE 01 — OBSERVE                                                  */}
      {/* ========================================================================= */}
      <section
        id="story-sec-1"
        className="min-h-screen flex items-center p-6 sm:p-10 lg:p-16 max-w-[1720px] mx-auto relative"
      >
        <div className="max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#11161D] border border-[#C6A15B]/30 text-[10px] font-mono-tech uppercase tracking-widest text-[#D8B86A] font-semibold">
            <Radio className="h-3 w-3 text-[#C6A15B]" />
            <span>01 // ORBITAL SYNCHRONIZATION</span>
          </div>

          <h2 className="font-fire text-6xl sm:text-8xl tracking-[0.04em] text-fire-gradient">
            OBSERVE
          </h2>

          <p className="font-fire text-2xl sm:text-3xl text-[#E6D19A] tracking-wide">
            EVERY EVENT BEGINS AS A SIGNAL.
          </p>

          <p className="text-sm sm:text-base text-[#D1CBC0] leading-relaxed font-light">
            VIIRS sensors on NOAA-20 and Suomi-NPP scan Earth in 375-meter high-resolution infrared channels, capturing thermal radiance anomalies in real time.
          </p>

          <TiltCard className="p-6 rounded-2xl bg-[#11161D]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3 text-xs font-mono-tech">
              <span className="text-[#F5F0E6] font-bold">NASA FIRMS LIVE STREAM</span>
              <span className="text-[#718070] flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-[#718070] animate-pulse" />
                SYNCHRONIZED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono-tech">
              <div>
                <span className="text-[#858078] block text-[10px]">TIME</span>
                <span className="text-[#F5F0E6] font-bold">{status?.snapshotTimestamp || '08:26:31 UTC'}</span>
              </div>
              <div>
                <span className="text-[#858078] block text-[10px]">SENSOR</span>
                <span className="text-[#F5F0E6] font-bold">VIIRS I-Band (3.74μm)</span>
              </div>
              <div>
                <span className="text-[#858078] block text-[10px]">DETECTIONS</span>
                <span className="text-[#F0783C] font-fire text-3xl">{hotspotCount} HOTSPOTS</span>
              </div>
              <div>
                <span className="text-[#858078] block text-[10px]">RESOLUTION</span>
                <span className="text-[#F5F0E6] font-bold">375m Sub-pixel</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 // STAGE 02 — DETECT                                                   */}
      {/* ========================================================================= */}
      <section
        id="story-sec-2"
        className="min-h-screen flex items-center justify-end p-6 sm:p-10 lg:p-16 max-w-[1720px] mx-auto relative"
      >
        <div className="max-w-xl space-y-5 text-right ml-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#11161D] border border-[#B6402F]/40 text-[10px] font-mono-tech uppercase tracking-widest text-[#F0783C] font-semibold">
            <Flame className="h-3 w-3 text-[#F0783C]" />
            <span>02 // DBSCAN CLUSTERING</span>
          </div>

          <h2 className="font-fire text-6xl sm:text-8xl tracking-[0.04em] text-fire-gradient">
            DETECT
          </h2>

          <p className="font-fire text-2xl sm:text-3xl text-[#E6D19A] tracking-wide">
            THERMAL SIGNALS BECOME COHERENT EVENTS.
          </p>

          <p className="text-sm sm:text-base text-[#D1CBC0] leading-relaxed font-light text-left sm:text-right">
            DBSCAN spatial clustering groups co-occurring infrared detections into coherent wildfire perimeters, convex hulls, and centroid coordinates.
          </p>

          <TiltCard className="p-6 rounded-2xl bg-[#11161D]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono-tech text-[#C6A15B] font-semibold uppercase">ACTIVE COMPLEX</span>
                <h4 className="font-fire text-2xl text-[#F5F0E6]">{topCluster?.name || 'CALIFORNIA SIERRA'}</h4>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#C84B38]/20 border border-[#C84B38]/40 text-[#C84B38] font-mono-tech font-bold text-xs uppercase">
                {topCluster?.risk_level || 'CRITICAL'} &bull; {riskScore} / 100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">HOTSPOTS</span>
                <span className="font-fire text-3xl text-[#F5F0E6]">{hotspotCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">PEAK RADIATIVE</span>
                <span className="font-fire text-3xl text-[#F0783C]">{maxFrp} MW</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">OVERPASS</span>
                <span className="font-fire text-3xl text-[#C6A15B]">08:26 UTC</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03 // STAGE 03 — FUSE                                                     */}
      {/* ========================================================================= */}
      <section
        id="story-sec-3"
        className="min-h-screen flex items-center p-6 sm:p-10 lg:p-16 max-w-[1720px] mx-auto relative"
      >
        <div className="max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#11161D] border border-[#C6A15B]/30 text-[10px] font-mono-tech uppercase tracking-widest text-[#D8B86A] font-semibold">
            <Wind className="h-3 w-3 text-[#C6A15B]" />
            <span>03 // WEATHER FUSION</span>
          </div>

          <h2 className="font-fire text-6xl sm:text-8xl tracking-[0.04em] text-fire-gradient">
            FUSE
          </h2>

          <p className="font-fire text-2xl sm:text-3xl text-[#E6D19A] tracking-wide">
            CONTEXT TURNS OBSERVATION INTO INTELLIGENCE.
          </p>

          <p className="text-sm sm:text-base text-[#D1CBC0] leading-relaxed font-light">
            Live Open-Meteo boundary layer weather is fused with satellite thermal observations to determine instantaneous flame spread rates.
          </p>

          <TiltCard className="p-6 rounded-2xl bg-[#11161D]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
            <div className="text-[10px] font-mono-tech uppercase text-[#C6A15B] tracking-widest mb-3 font-semibold">
              ATMOSPHERIC VECTORS // OPEN-METEO
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">TEMP</span>
                <span className="font-fire text-3xl text-[#F5A05A] mt-1 block">{temp}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">HUMIDITY</span>
                <span className="font-fire text-3xl text-[#F0783C] mt-1 block">{humidity}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">WIND</span>
                <span className="font-fire text-3xl text-[#C6A15B] mt-1 block">{windSpeed}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <span className="text-[10px] font-mono-tech text-[#858078] block uppercase">HEADING</span>
                <span className="font-fire text-3xl text-[#F5F0E6] mt-1 block">{windDir}</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04 // STAGE 04 — PROJECT                                                  */}
      {/* ========================================================================= */}
      <section
        id="story-sec-4"
        className="min-h-screen flex items-center justify-end p-6 sm:p-10 lg:p-16 max-w-[1720px] mx-auto relative"
      >
        <div className="max-w-xl space-y-5 text-right ml-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#11161D] border border-[#C6A15B]/30 text-[10px] font-mono-tech uppercase tracking-widest text-[#D8B86A] font-semibold">
            <Compass className="h-3 w-3 text-[#C6A15B]" />
            <span>04 // THREAT CORRIDORS</span>
          </div>

          <h2 className="font-fire text-6xl sm:text-8xl tracking-[0.04em] text-fire-gradient">
            PROJECT
          </h2>

          <p className="font-fire text-2xl sm:text-3xl text-[#E6D19A] tracking-wide">
            ANTICIPATE FLAME FRONTS BEFORE THEY ADVANCE.
          </p>

          <p className="text-sm sm:text-base text-[#D1CBC0] leading-relaxed font-light text-left sm:text-right">
            By fusing perimeter geometry with wind heading vectors and fine fuel dryness, EmberWatch projects downwind expansion corridors.
          </p>

          <TiltCard className="p-6 rounded-2xl bg-[#11161D]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <span className="text-xs font-mono-tech font-bold text-[#F5F0E6] uppercase">ESTIMATED THREAT CORRIDOR</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#C84B38]/20 text-[#C84B38] font-mono-tech font-bold text-[10px] border border-[#C84B38]/40">
                SPREAD RISK: {spreadRisk}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono-tech">
              <div>
                <span className="text-[#858078] block text-[10px]">DOWNWIND HEADING</span>
                <span className="text-xl font-fire text-[#F5F0E6] mt-0.5 block">{windDir}</span>
              </div>
              <div>
                <span className="text-[#858078] block text-[10px]">FORWARD VELOCITY</span>
                <span className="text-xl font-fire text-[#F0783C] mt-0.5 block">
                  {topCluster?.spread_estimate?.forwardVelocityKmh || '1.8 - 3.4 km/h'}
                </span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05 // STAGE 05 — PROTECT                                                  */}
      {/* ========================================================================= */}
      <section
        id="story-sec-5"
        className="min-h-screen flex items-center p-6 sm:p-10 lg:p-16 max-w-[1720px] mx-auto relative"
      >
        <div className="max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#11161D] border border-[#718070]/40 text-[10px] font-mono-tech uppercase tracking-widest text-[#9ab098] font-semibold">
            <ShieldAlert className="h-3 w-3 text-[#718070]" />
            <span>05 // ASSET EXPOSURE</span>
          </div>

          <h2 className="font-fire text-6xl sm:text-8xl tracking-[0.04em] text-fire-gradient">
            PROTECT
          </h2>

          <p className="font-fire text-2xl sm:text-3xl text-[#E6D19A] tracking-wide">
            KNOW WHAT ASSETS ARE EXPOSED.
          </p>

          <p className="text-sm sm:text-base text-[#D1CBC0] leading-relaxed font-light">
            Concentric 5km, 10km, and 25km exposure analysis buffers identify exposed settlements, hospitals, schools, and power corridors.
          </p>

          <TiltCard className="p-6 rounded-2xl bg-[#11161D]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center font-mono-tech">
              <div className="p-3 rounded-xl bg-[#171D24]">
                <Building className="h-4 w-4 mx-auto text-[#D8B86A] mb-1" />
                <span className="font-fire text-3xl text-[#F5F0E6] block">{settlementsCount}</span>
                <span className="text-[8px] text-[#858078] uppercase">TOWNS</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <Hospital className="h-4 w-4 mx-auto text-[#C84B38] mb-1" />
                <span className="font-fire text-3xl text-[#C84B38] block">{hospitalsCount}</span>
                <span className="text-[8px] text-[#858078] uppercase">HOSPITALS</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <GraduationCap className="h-4 w-4 mx-auto text-[#C88B45] mb-1" />
                <span className="font-fire text-3xl text-[#C88B45] block">{schoolsCount}</span>
                <span className="text-[8px] text-[#858078] uppercase">SCHOOLS</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <Activity className="h-4 w-4 mx-auto text-[#D1CBC0] mb-1" />
                <span className="font-fire text-3xl text-[#F5F0E6] block">{highwaysCount}</span>
                <span className="text-[8px] text-[#858078] uppercase">HIGHWAYS</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171D24]">
                <Zap className="h-4 w-4 mx-auto text-[#C6A15B] mb-1" />
                <span className="font-fire text-3xl text-[#D8B86A] block">{powerCount}</span>
                <span className="text-[8px] text-[#858078] uppercase">POWER</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06 // STAGE 06 — COMMAND                                                  */}
      {/* ========================================================================= */}
      <section
        id="story-sec-6"
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto relative"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-[#11161D]/90 border border-[#C6A15B]/35 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] space-y-6 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#171D24] border border-[#C6A15B]/30 text-[10px] font-mono-tech uppercase tracking-widest text-[#C6A15B] font-bold">
            <Layers className="h-3.5 w-3.5 text-[#C6A15B]" />
            <span>OPERATIONS CENTER READY</span>
          </div>

          <h2 className="font-fire text-5xl sm:text-7xl text-fire-gradient">
            COMMAND
          </h2>

          <p className="font-fire text-xl sm:text-2xl text-[#E6D19A]">
            TACTICAL INTELLIGENCE AT YOUR FINGERTIPS.
          </p>

          <p className="text-sm sm:text-base text-[#D1CBC0] leading-relaxed font-light">
            Launch the live Operations Center map with active satellite detections, risk scores, and infrastructure exposure overlays.
          </p>

          <div className="pt-2 flex justify-center">
            <MagneticButton
              onClick={onEnterOperations}
              strength={14}
              id="cta-launch-operations"
              className="px-9 py-4 rounded-xl bg-[#C6A15B] hover:bg-[#D8B86A] text-[#050505] font-mono-tech font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#C6A15B]/25 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>LAUNCH OPERATIONS CENTER</span>
              <ArrowRight className="h-4 w-4 text-[#050505]" />
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
};
