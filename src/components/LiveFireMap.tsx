import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Eye,
  EyeOff,
  Crosshair,
  Compass,
  AlertTriangle,
  Flame,
  Shield,
  Hospital,
  GraduationCap,
  Zap,
  Building2,
  TreePine,
  Maximize2
} from 'lucide-react';
import { FireCluster, FireObservation, ExposedAsset } from '../types/emberwatch.js';

interface LiveFireMapProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  selectedCluster: FireCluster | null;
  onSelectCluster: (c: FireCluster) => void;
  timeFilterOffsetHours?: number;
  onOpenIncidentView?: () => void;
}

export const LiveFireMap: React.FC<LiveFireMapProps> = ({
  clusters,
  hotspots,
  selectedCluster,
  onSelectCluster,
  timeFilterOffsetHours = 0,
  onOpenIncidentView
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [baseLayerType, setBaseLayerType] = useState<'DARK' | 'OSM' | 'SATELLITE'>('DARK');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showThreatCones, setShowThreatCones] = useState(true);
  const [showBuffers, setShowBuffers] = useState(true);
  const [showExposedAssets, setShowExposedAssets] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // React StrictMode safety guard: clear any previous leaflet id on remount
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Default center around Northern Sierra Nevada (Plumas / Butte / Lassen corridor)
    const initialCenter: [number, number] = [39.95, -121.25];
    const initialZoom = 9;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseTileLayers = {
      DARK: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
          attribution: '&copy; Esri'
        }
      ),
      SATELLITE: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: '&copy; Esri'
        }
      ),
      OSM: L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }
      )
    };

    baseTileLayers.DARK.addTo(map);
    (map as any)._baseTiles = baseTileLayers;

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Resize observer & multiple invalidate calls to prevent blank map
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    invalidate();
    const t1 = setTimeout(invalidate, 50);
    const t2 = setTimeout(invalidate, 200);
    const t3 = setTimeout(invalidate, 600);
    const t4 = setTimeout(invalidate, 1200);

    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !(map as any)._baseTiles) return;
    const tiles = (map as any)._baseTiles;

    Object.values(tiles).forEach((layer: any) => map.removeLayer(layer));
    tiles[baseLayerType].addTo(map);
  }, [baseLayerType]);

  // Render Overlays: Clusters, Hotspots, Cones, Buffers, and Assets
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;
    if (!map || !lg) return;

    lg.clearLayers();

    // Color helpers aligned with Deep Obsidian & Antique Gold luxury palette
    const getRiskColor = (level: string) => {
      switch (level) {
        case 'CRITICAL':
          return '#D45543'; // Critical Deep Ember
        case 'HIGH':
          return '#B84535'; // Danger Red
        case 'MODERATE':
          return '#C89A4B'; // Warning Amber
        default:
          return '#718A72'; // Safe Muted Sage
      }
    };

    // 1. Draw Clusters with Soft Halos, Boundaries, and Threat Cones
    if (showClusters) {
      clusters.forEach((cluster) => {
        const isSelected = selectedCluster?.id === cluster.id;
        const color = getRiskColor(cluster.risk_level);

        // Exposure buffer concentric rings if selected or critical
        if (showBuffers && (isSelected || cluster.risk_score >= 70)) {
          // 5km inner zone
          const buf5 = L.circle([cluster.center_lat, cluster.center_lon], {
            radius: 5000,
            color: '#D45543',
            weight: 1,
            fill: false,
            dashArray: '2, 6',
            opacity: 0.4
          });
          lg.addLayer(buf5);

          // 10km tactical buffer
          const buf10 = L.circle([cluster.center_lat, cluster.center_lon], {
            radius: 10000,
            color: '#C6A15B',
            weight: 1,
            fill: false,
            dashArray: '3, 8',
            opacity: 0.35
          });
          lg.addLayer(buf10);

          // 25km regional monitoring envelope
          const buf25 = L.circle([cluster.center_lat, cluster.center_lon], {
            radius: 25000,
            color: '#A9A394',
            weight: 0.75,
            fill: false,
            dashArray: '4, 10',
            opacity: 0.2
          });
          lg.addLayer(buf25);
        }

        // Clustered boundary circle / halo
        const clusterCircle = L.circle([cluster.center_lat, cluster.center_lon], {
          radius: Math.max(1500, cluster.radius_km * 1000),
          color: isSelected ? '#E1C47A' : color,
          weight: isSelected ? 2.5 : 1.5,
          fillColor: color,
          fillOpacity: isSelected ? 0.25 : 0.12,
          dashArray: isSelected ? '4, 4' : undefined
        });

        clusterCircle.on('click', () => {
          onSelectCluster(cluster);
          if (onOpenIncidentView) onOpenIncidentView();
        });

        // Centroid intelligent object marker
        const centroidIcon = L.divIcon({
          className: 'cluster-centroid-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
              <div class="absolute inset-0 rounded-full border ${isSelected ? 'border-[#E1C47A] ring-2 ring-[#E1C47A]/30' : 'border-[#C6A15B]/50'} bg-[#080A0D]/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span class="font-bold text-[12px] tracking-wide ${isSelected ? 'text-[#E1C47A]' : 'text-[#F3EEE2]'}">
                  ${cluster.risk_score.toFixed(0)}
                </span>
              </div>
              <div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style="background-color: ${color}; border: 1px solid #080A0D;"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const centroidMarker = L.marker([cluster.center_lat, cluster.center_lon], { icon: centroidIcon });
        centroidMarker.on('click', () => {
          onSelectCluster(cluster);
          if (onOpenIncidentView) onOpenIncidentView();
        });

        const tooltipContent = `
          <div style="background-color: #111720; border: 1px solid rgba(198, 161, 91, 0.35); padding: 8px 12px; border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px; margin-bottom: 6px;">
              <span style="font-size: 14px; font-weight: 700; color: #F3EEE2; letter-spacing: 0.05em;">
                CLUSTER #${cluster.cluster_number}: ${cluster.name}
              </span>
              <span style="font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background: rgba(${cluster.risk_score >= 70 ? '212,85,67' : '200,154,75'}, 0.2); color: ${color};">
                ${cluster.risk_level}
              </span>
            </div>
            <div style="font-size: 11px; color: #A9A394; line-height: 1.5;">
              <div>Risk Score: <strong style="color: #F3EEE2;">${cluster.risk_score} / 100</strong></div>
              <div>Hotspots: <strong style="color: #F3EEE2;">${cluster.hotspot_count}</strong> &bull; Max FRP: <strong style="color: #E1C47A;">${cluster.max_frp} MW</strong></div>
              <div>Wind: <strong style="color: #F3EEE2;">${cluster.weather.wind_speed_10m} km/h</strong> &bull; Threat: <strong style="color: #E1C47A;">${cluster.spread_estimate.likelyThreatDirection}</strong></div>
              <div>Exposed Assets: <strong style="color: #F3EEE2;">${cluster.exposed_assets.length}</strong> within buffer</div>
            </div>
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 9px; color: #C6A15B; text-transform: uppercase;">
              Click to inspect incident intelligence &rarr;
            </div>
          </div>
        `;

        clusterCircle.bindTooltip(tooltipContent, { sticky: true });
        centroidMarker.bindTooltip(tooltipContent, { sticky: true });

        lg.addLayer(clusterCircle);
        lg.addLayer(centroidMarker);

        // 2. Draw Threat Vector / Spread Cone
        if (showThreatCones && cluster.risk_score >= 30) {
          const originLat = cluster.center_lat;
          const originLon = cluster.center_lon;
          const headingDeg = cluster.spread_estimate.headingDegrees;
          const coneLengthKm = Math.min(24, Math.max(7, (cluster.weather.wind_speed_10m / 30) * 16));
          const halfAngle = 22; // 44 degree spread arc

          const rad = Math.PI / 180;
          const R = 6371;

          const projectPoint = (bearingDeg: number, distKm: number): [number, number] => {
            const bRad = bearingDeg * rad;
            const oLatRad = originLat * rad;
            const oLonRad = originLon * rad;
            const dR = distKm / R;

            const destLat = Math.asin(
              Math.sin(oLatRad) * Math.cos(dR) + Math.cos(oLatRad) * Math.sin(dR) * Math.cos(bRad)
            );
            const destLon =
              oLonRad +
              Math.atan2(
                Math.sin(bRad) * Math.sin(dR) * Math.cos(oLatRad),
                Math.cos(dR) - Math.sin(oLatRad) * Math.sin(destLat)
              );
            return [destLat / rad, destLon / rad];
          };

          const ptLeft = projectPoint(headingDeg - halfAngle, coneLengthKm);
          const ptApex = projectPoint(headingDeg, coneLengthKm * 1.15);
          const ptRight = projectPoint(headingDeg + halfAngle, coneLengthKm);

          const conePolygon = L.polygon([[originLat, originLon], ptLeft, ptApex, ptRight], {
            color: color,
            weight: 1.5,
            dashArray: '3, 5',
            fillColor: color,
            fillOpacity: isSelected ? 0.16 : 0.08
          });

          conePolygon.bindTooltip(
            `<div style="background: #111720; border: 1px solid rgba(198, 161, 91, 0.4); padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #F3EEE2;">
              <strong style="color: #E1C47A;">ESTIMATED THREAT CORRIDOR</strong><br/>
              <span>Direction: <strong>${cluster.spread_estimate.likelyThreatDirection}</strong></span><br/>
              <span>Forward Velocity: <strong>${cluster.spread_estimate.forwardVelocityKmh}</strong></span><br/>
              <span>Confidence: <strong>${cluster.spread_estimate.confidence}%</strong></span><br/>
              <div style="font-size: 9px; color: #A9A394; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
                MODEL ESTIMATE &bull; NOT OFFICIAL FIRE-SPREAD FORECAST
              </div>
            </div>`,
            { sticky: true }
          );

          lg.addLayer(conePolygon);
        }
      });
    }

    // 3. Draw Individual Satellite Hotspots with Thermal Pulse Animation
    if (showHotspots) {
      const activeHotspots = hotspots.filter((_, idx) => {
        if (timeFilterOffsetHours === 0) return true;
        const keepRatio = 1 - Math.abs(timeFilterOffsetHours) * 0.2;
        return idx < hotspots.length * Math.max(0.25, keepRatio);
      });

      activeHotspots.forEach((h) => {
        const isHighFRP = h.frp > 200;
        const isMedFRP = h.frp > 100;
        const centerColor = isHighFRP ? '#D45543' : isMedFRP ? '#B84535' : '#C89A4B';
        const haloColor = isHighFRP ? 'rgba(212, 85, 67, 0.45)' : 'rgba(200, 154, 75, 0.35)';
        const pointSize = Math.max(6, Math.min(12, Math.sqrt(h.frp) * 0.55));
        const markerSize = pointSize * 2.8;

        const hotspotIcon = L.divIcon({
          className: 'custom-thermal-marker',
          html: `
            <div class="relative flex items-center justify-center" style="width: ${markerSize}px; height: ${markerSize}px;">
              <div class="absolute inset-0 rounded-full animate-thermal-halo" style="background-color: ${haloColor}; opacity: ${h.confidence / 100};"></div>
              <div class="relative rounded-full shadow-md" style="width: ${pointSize}px; height: ${pointSize}px; background-color: ${centerColor}; border: 1px solid rgba(243, 238, 226, 0.9);"></div>
            </div>
          `,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2]
        });

        const hotspotMarker = L.marker([h.latitude, h.longitude], { icon: hotspotIcon });

        hotspotMarker.bindTooltip(
          `<div style="background-color: #111720; border: 1px solid rgba(198, 161, 91, 0.3); padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #F3EEE2;">
            <div style="font-weight: 700; color: #E1C47A; font-size: 11px;">
              SATELLITE THERMAL OBSERVATION
            </div>
            <div style="margin-top: 4px; color: #A9A394; line-height: 1.4;">
              Sensor: <strong style="color: #F3EEE2;">${h.satellite} (${h.instrument})</strong><br/>
              Radiative Power: <strong style="color: #D45543;">${h.frp} MW</strong><br/>
              Brightness Temp: <strong style="color: #F3EEE2;">${h.brightness} K</strong><br/>
              Confidence: <strong style="color: #718A72;">${h.confidence}%</strong><br/>
              Detection: <span>${h.acq_date} ${h.acq_time} UTC</span>
            </div>
          </div>`,
          { sticky: true }
        );

        lg.addLayer(hotspotMarker);
      });
    }

    // 4. Draw Potentially Exposed Assets
    if (showExposedAssets && selectedCluster) {
      selectedCluster.exposed_assets.forEach((asset) => {
        let assetColor = '#C6A15B';
        let assetSymbol = '&#9670;';

        if (asset.type === 'HOSPITAL') {
          assetColor = '#D45543';
          assetSymbol = '&#10010;';
        } else if (asset.type === 'SETTLEMENT') {
          assetColor = '#E1C47A';
          assetSymbol = '&#9632;';
        } else if (asset.type === 'POWER_INFRASTRUCTURE') {
          assetColor = '#C89A4B';
          assetSymbol = '&#9889;';
        } else if (asset.type === 'PROTECTED_AREA') {
          assetColor = '#718A72';
          assetSymbol = '&#9650;';
        }

        const assetIcon = L.divIcon({
          className: 'exposed-asset-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group" style="width: 20px; height: 20px;">
              <div class="w-4 h-4 rounded-sm flex items-center justify-center shadow-lg" style="background-color: #080A0D; border: 1.5px solid ${assetColor}; color: ${assetColor}; font-size: 10px;">
                ${assetSymbol}
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const assetMarker = L.marker([asset.latitude, asset.longitude], { icon: assetIcon });

        assetMarker.bindTooltip(
          `<div style="background-color: #111720; border: 1px solid rgba(198, 161, 91, 0.4); padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #F3EEE2;">
            <div style="font-weight: 700; color: #F3EEE2;">${asset.name}</div>
            <div style="font-size: 10px; color: ${assetColor}; text-transform: uppercase;">
              ${asset.type} &bull; ${asset.estimatedRiskZone.replace('_', ' ')}
            </div>
            <div style="margin-top: 4px; color: #A9A394; line-height: 1.4;">
              Distance to Incident: <strong style="color: #F3EEE2;">${asset.distanceKm} km</strong><br/>
              ${asset.population ? `Estimated Population: <strong style="color: #F3EEE2;">${asset.population.toLocaleString()}</strong><br/>` : ''}
              <span style="font-size: 10px; color: #A9A394;">${asset.details || ''}</span>
            </div>
          </div>`,
          { sticky: true }
        );

        lg.addLayer(assetMarker);
      });
    }
  }, [
    clusters,
    hotspots,
    selectedCluster,
    showHotspots,
    showClusters,
    showThreatCones,
    showBuffers,
    showExposedAssets,
    timeFilterOffsetHours,
    onSelectCluster,
    onOpenIncidentView
  ]);

  // Center on selected cluster smoothly
  useEffect(() => {
    if (selectedCluster && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedCluster.center_lat, selectedCluster.center_lon],
        10,
        { duration: 1.2 }
      );
    }
  }, [selectedCluster]);

  const handleResetExtent = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([39.95, -121.25], 9, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[640px] rounded-2xl overflow-hidden border border-[#D8B86A]/30 bg-[#070809] shadow-2xl">
      {/* Tactical Grid Background behind map to prevent any blankness */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#171D24_1px,transparent_1px),linear-gradient(to_bottom,#171D24_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Map Container - Absolute inset-0 guarantees full coverage */}
      <div
        ref={mapContainerRef}
        id="leaflet-map-root"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1, minHeight: '640px', width: '100%', height: '100%' }}
      />

      {/* Floating Map Controls HUD (Top-Right of Map) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Basemap Toggle (Dark vs Satellite) */}
        <div className="flex items-center p-1 rounded-lg bg-[#0D121A]/90 backdrop-blur-md border border-[#171D27] shadow-xl text-xs">
          <button
            onClick={() => setBaseLayerType('DARK')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition cursor-pointer ${
              baseLayerType === 'DARK'
                ? 'bg-[#171D27] text-[#E1C47A] border border-[#C6A15B]/40'
                : 'text-[#A9A394] hover:text-[#F3EEE2]'
            }`}
          >
            Dark Grid
          </button>
          <button
            onClick={() => setBaseLayerType('OSM')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition cursor-pointer ${
              baseLayerType === 'OSM'
                ? 'bg-[#171D27] text-[#E1C47A] border border-[#C6A15B]/40'
                : 'text-[#A9A394] hover:text-[#F3EEE2]'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setBaseLayerType('SATELLITE')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition cursor-pointer ${
              baseLayerType === 'SATELLITE'
                ? 'bg-[#171D27] text-[#E1C47A] border border-[#C6A15B]/40'
                : 'text-[#A9A394] hover:text-[#F3EEE2]'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Tactical Overlays Filter Toggle Box */}
        <div className="p-2 rounded-lg bg-[#0D121A]/90 backdrop-blur-md border border-[#171D27] shadow-xl text-xs space-y-1.5 min-w-[150px]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#A9A394] block border-b border-white/[0.06] pb-1">
            Tactical Overlays
          </span>

          <label className="flex items-center justify-between gap-2 text-[11px] text-[#F3EEE2] hover:text-[#E1C47A] cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-[#D45543]" /> Hotspots
            </span>
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="accent-[#C6A15B] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-[11px] text-[#F3EEE2] hover:text-[#E1C47A] cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-[#C6A15B]" /> Clusters (DBSCAN)
            </span>
            <input
              type="checkbox"
              checked={showClusters}
              onChange={(e) => setShowClusters(e.target.checked)}
              className="accent-[#C6A15B] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-[11px] text-[#F3EEE2] hover:text-[#E1C47A] cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3 w-3 text-[#E1C47A]" /> Threat Cones
            </span>
            <input
              type="checkbox"
              checked={showThreatCones}
              onChange={(e) => setShowThreatCones(e.target.checked)}
              className="accent-[#C6A15B] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-[11px] text-[#F3EEE2] hover:text-[#E1C47A] cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Crosshair className="h-3 w-3 text-[#A9A394]" /> Buffer Rings
            </span>
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="accent-[#C6A15B] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-[11px] text-[#F3EEE2] hover:text-[#E1C47A] cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-[#718A72]" /> Exposed Assets
            </span>
            <input
              type="checkbox"
              checked={showExposedAssets}
              onChange={(e) => setShowExposedAssets(e.target.checked)}
              className="accent-[#C6A15B] cursor-pointer"
            />
          </label>
        </div>

        {/* Reset Extent Button */}
        <button
          onClick={handleResetExtent}
          className="flex items-center justify-center gap-1 p-2 rounded-lg bg-[#0D121A]/90 hover:bg-[#171D27] text-[#A9A394] hover:text-[#E1C47A] border border-[#171D27] transition cursor-pointer text-xs"
          title="Recenter Map Extent"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono uppercase tracking-wider">Reset View</span>
        </button>
      </div>

      {/* Map Scale / Geospatial Coordinate Badge (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-3">
        <div className="px-2.5 py-1 rounded bg-[#080A0D]/85 backdrop-blur-sm border border-[#171D27] text-[10px] font-mono text-[#A9A394]">
          REGION: <span className="text-[#F3EEE2]">NORTHERN SIERRA // CASCADE TRANSITION</span>
        </div>
      </div>
    </div>
  );
};
