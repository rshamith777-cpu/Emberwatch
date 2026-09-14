import React, { useState } from 'react';
import { Flame, Mountain, Globe, Sliders, ArrowRight, ShieldCheck, Activity, Compass, Wind } from 'lucide-react';
import { FireSimulation3D } from './FireSimulation3D.js';
import { TerrainFire3D } from './TerrainFire3D.js';
import { FireGlobe3D } from './FireGlobe3D.js';
import { FireCluster, FireObservation } from '../../types/emberwatch.js';

interface FireStudio3DProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  selectedCluster: FireCluster | null;
  onEnterOperations: () => void;
}

export const FireStudio3D: React.FC<FireStudio3DProps> = ({
  clusters,
  hotspots,
  selectedCluster,
  onEnterOperations
}) => {
  const [active3dTab, setActive3dTab] = useState<'flame' | 'terrain' | 'globe'>('flame');
  const [liveMetrics, setLiveMetrics] = useState({
    flameLength: 3.8,
    fireIntensity: 4620,
    spottingKm: 1.45
  });

  const topCluster = selectedCluster || clusters[0] || null;
  const windSpeed = topCluster?.weather?.wind_speed_10m || 28;
  const windHeading = topCluster?.weather?.wind_direction_10m || 34;

  return (
    <div className="w-full space-y-6">
      {/* 3D Component Selector Tabs (Warm Fire Theme) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#11161D]/80 backdrop-blur-md border border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActive3dTab('flame')}
            className={`px-4 py-2.5 rounded-xl font-mono-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              active3dTab === 'flame'
                ? 'bg-[#C6A15B]/20 border border-[#C6A15B]/40 text-[#F5F0E6] shadow-md shadow-[#C6A15B]/10'
                : 'text-[#858078] hover:text-[#F5F0E6] hover:bg-[#11161D]'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>3D Convection & Flame Core</span>
          </button>

          <button
            onClick={() => setActive3dTab('terrain')}
            className={`px-4 py-2.5 rounded-xl font-mono-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              active3dTab === 'terrain'
                ? 'bg-[#C6A15B]/20 border border-[#C6A15B]/40 text-[#F5F0E6] shadow-md shadow-[#C6A15B]/10'
                : 'text-[#858078] hover:text-[#F5F0E6] hover:bg-[#11161D]'
            }`}
          >
            <Mountain className="h-4 w-4" />
            <span>3D Topographic Ridge Spread</span>
          </button>

          <button
            onClick={() => setActive3dTab('globe')}
            className={`px-4 py-2.5 rounded-xl font-mono-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              active3dTab === 'globe'
                ? 'bg-[#C6A15B]/20 border border-[#C6A15B]/40 text-[#F5F0E6] shadow-md shadow-[#C6A15B]/10'
                : 'text-[#858078] hover:text-[#F5F0E6] hover:bg-[#11161D]'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>3D Global Radiative Globe</span>
          </button>
        </div>

        {/* Quick Launch Button */}
        <button
          onClick={onEnterOperations}
          className="px-5 py-2.5 rounded-xl bg-[#0D1117] hover:bg-[#11161D] text-[#D8B86A] hover:text-[#F5F0E6] font-mono-tech text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span>OPEN OPERATIONS MAP</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#C6A15B]" />
        </button>
      </div>

      {/* Active 3D Component Display */}
      {active3dTab === 'flame' && (
        <FireSimulation3D
          initialWindSpeed={windSpeed}
          initialWindDir={windHeading}
          initialFrp={topCluster?.max_frp || 187}
          onMetricsChange={setLiveMetrics}
        />
      )}

      {active3dTab === 'terrain' && (
        <TerrainFire3D
          windSpeed={windSpeed}
          windHeading={windHeading}
        />
      )}

      {active3dTab === 'globe' && (
        <FireGlobe3D
          clusters={clusters}
          hotspots={hotspots}
          selectedCluster={topCluster}
        />
      )}
    </div>
  );
};
