import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { LiveFireMap } from './components/LiveFireMap.js';
import { OperationsHUD } from './components/OperationsHUD.js';
import { IncidentIntelligenceDrawer } from './components/IncidentIntelligenceDrawer.js';
import { ModelSystemIntelligenceScreen } from './components/ModelSystemIntelligenceScreen.js';
import { IntelligenceAgentModal } from './components/IntelligenceAgentModal.js';
import { AlertsDrawer } from './components/AlertsDrawer.js';
import { DemoTourGuide } from './components/DemoTourGuide.js';
import { CinematicExperience } from './components/cinematic/CinematicExperience.js';
import {
  FireCluster,
  FireObservation,
  EmberAlert,
  SystemStatus,
  PrimaryScreen
} from './types/emberwatch.js';
import {
  FALLBACK_CLUSTERS,
  RAW_SNAPSHOT_HOTSPOTS,
  FALLBACK_ALERTS,
  FALLBACK_STATUS
} from './data/fallbackTelemetry.js';
import { Flame, RefreshCw } from 'lucide-react';

async function fetchWithRetry(url: string, retries = 3, delay = 500): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (attempt === retries) return res;
    } catch (err) {
      if (attempt === retries) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delay * attempt));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

export default function App() {
  const [clusters, setClusters] = useState<FireCluster[]>(FALLBACK_CLUSTERS);
  const [hotspots, setHotspots] = useState<FireObservation[]>(RAW_SNAPSHOT_HOTSPOTS);
  const [alerts, setAlerts] = useState<EmberAlert[]>(FALLBACK_ALERTS);
  const [status, setStatus] = useState<SystemStatus | null>(FALLBACK_STATUS);
  const [selectedCluster, setSelectedCluster] = useState<FireCluster | null>(FALLBACK_CLUSTERS[0]);

  // Primary Screens Layout State
  const [activeScreen, setActiveScreen] = useState<PrimaryScreen>('CINEMATIC');

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [timeOffsetHours, setTimeOffsetHours] = useState(0);

  // Modals and Drawers
  const [isIncidentDrawerOpen, setIsIncidentDrawerOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);

  // Live satellite observation simulation toast
  const [newObservationToast, setNewObservationToast] = useState<{
    visible: boolean;
    satellite: string;
    time: string;
    frp: number;
    prevRisk: number;
    newRisk: number;
  } | null>(null);

  // Fetch telemetry from server with retry
  const loadTelemetry = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    else setIsRefreshing(true);

    try {
      const [clustersRes, hotspotsRes, alertsRes, statusRes] = await Promise.all([
        fetchWithRetry('/api/clusters'),
        fetchWithRetry('/api/hotspots'),
        fetchWithRetry('/api/alerts'),
        fetchWithRetry('/api/status')
      ]);

      if (!clustersRes.ok || !hotspotsRes.ok || !alertsRes.ok || !statusRes.ok) {
        throw new Error('Telemetry API returned non-OK status');
      }

      const clustersData = await clustersRes.json();
      const hotspotsData = await hotspotsRes.json();
      const alertsData = await alertsRes.json();
      const statusData = await statusRes.json();

      if (Array.isArray(clustersData) && clustersData.length > 0) {
        setClusters(clustersData);
        setSelectedCluster((prev) => {
          if (prev && clustersData.some((c: FireCluster) => c.id === prev.id)) {
            return clustersData.find((c: FireCluster) => c.id === prev.id) || clustersData[0] || null;
          }
          const sorted = [...clustersData].sort((a: FireCluster, b: FireCluster) => b.risk_score - a.risk_score);
          return sorted[0] || null;
        });
      }

      if (Array.isArray(hotspotsData) && hotspotsData.length > 0) {
        setHotspots(hotspotsData);
      }

      if (Array.isArray(alertsData)) {
        setAlerts(alertsData);
      }

      if (statusData && typeof statusData === 'object') {
        setStatus(statusData);
      }

      setConnectionNotice(null);
    } catch (err: any) {
      console.warn('[EmberWatch] Telemetry stream sync notice:', err?.message || err);
      setConnectionNotice('Synchronizing live stream with background satellite feed...');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTelemetry(true);

    // Real-time telemetry synchronization every 12 seconds
    const timer = setInterval(() => {
      loadTelemetry(true);
    }, 12000);

    return () => clearInterval(timer);
  }, [loadTelemetry]);

  // Trigger manual pipeline refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/pipeline/refresh', { method: 'POST' });
      await loadTelemetry(true);
    } catch (err) {
      console.error('Failed to trigger pipeline refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle Mode (Live vs Demo Snapshot)
  const handleToggleMode = async () => {
    const nextMode = status?.mode === 'LIVE' ? 'DEMO_SNAPSHOT' : 'LIVE';
    setIsRefreshing(true);
    try {
      await fetch('/api/pipeline/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode })
      });
      await loadTelemetry(true);
    } catch (err) {
      console.error('Failed to toggle mode:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger satellite detection event simulation (Section 10)
  const handleTriggerNewObservation = () => {
    const topCluster = [...clusters].sort((a, b) => b.risk_score - a.risk_score)[0] || clusters[0];
    const prevScore = Math.max(65, Math.round(topCluster.risk_score - 9));
    const newScore = Math.round(topCluster.risk_score);

    setNewObservationToast({
      visible: true,
      satellite: 'VIIRS NOAA-20',
      time: '08:26 IST',
      frp: Math.round(topCluster.max_frp || 418),
      prevRisk: prevScore,
      newRisk: newScore
    });

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      setNewObservationToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 7000);
  };

  // Switch to incident view with cluster focus inside Operations Center (Spec #44)
  const handleInspectIncident = (cluster: FireCluster) => {
    setSelectedCluster(cluster);
    setIsIncidentDrawerOpen(true);
    setActiveScreen('OPERATIONS');
  };

  const handleSelectScreen = (screen: PrimaryScreen) => {
    setActiveScreen(screen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#F5F0E6]">
        <div className="relative flex items-center justify-center mb-5">
          <div className="h-16 w-16 rounded-2xl bg-[#11161D] border border-[#C6A15B]/40 flex items-center justify-center animate-pulse shadow-xl shadow-[#C6A15B]/10">
            <Flame className="h-8 w-8 text-[#C6A15B] animate-bounce" />
          </div>
        </div>
        <h2 className="font-fire text-4xl tracking-[0.2em] text-[#F5F0E6]">
          EMBER<span className="text-fire-gradient font-fire">WATCH</span>
        </h2>
        <p className="text-xs text-[#858078] font-mono-tech tracking-[0.22em] mt-2 uppercase font-medium">
          CALIBRATING SATELLITE TELEMETRY & ML INFERENCE...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F0E6] flex flex-col font-creamy selection:bg-[#C6A15B] selection:text-[#050505]">
      {/* Top Header */}
      <Header
        status={status}
        alerts={alerts}
        isRefreshing={isRefreshing}
        activeScreen={activeScreen}
        onSelectScreen={handleSelectScreen}
        onRefresh={handleRefresh}
        onToggleMode={handleToggleMode}
        onOpenAgent={() => setIsAgentOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* Sync Notice if Telemetry is syncing in background */}
      {connectionNotice && (
        <div className="bg-[#11161D] border-b border-[#C6A15B]/30 px-4 py-1.5 flex items-center justify-between text-xs text-[#D1CBC0]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#C6A15B]" />
            <span className="font-mono-tech text-[11px] font-semibold">{connectionNotice}</span>
          </div>
          <button
            onClick={() => loadTelemetry(false)}
            className="text-[11px] font-mono-tech font-bold text-[#C6A15B] underline hover:text-[#D8B86A] cursor-pointer"
          >
            Retry Sync Now
          </button>
        </div>
      )}

      {/* PRIMARY SCREENS SWITCHER VIEW CONTAINER */}
      {activeScreen === 'CINEMATIC' ? (
        <div className="flex-1 w-full h-[calc(100vh-76px)] relative">
          <CinematicExperience
            clusters={clusters}
            hotspots={hotspots}
            status={status}
            selectedCluster={selectedCluster}
            onEnterOperations={() => setActiveScreen('OPERATIONS')}
            onSelectScreen={handleSelectScreen}
            onSelectCluster={(c) => {
              setSelectedCluster(c);
              setIsIncidentDrawerOpen(true);
              setActiveScreen('OPERATIONS');
            }}
          />
        </div>
      ) : (
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col font-creamy">
          {/* SCREEN 1: OPERATIONS CENTER (Hero Map View with Overlay Drawer) */}
          {activeScreen === 'OPERATIONS' && (
            <div className="relative flex-1 w-full h-[calc(100vh-130px)] min-h-[640px] overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl font-creamy">
              {/* Full-bleed Hero Map */}
              <LiveFireMap
                clusters={clusters}
                hotspots={hotspots}
                selectedCluster={selectedCluster}
                onSelectCluster={(c) => {
                  setSelectedCluster(c);
                  setIsIncidentDrawerOpen(true);
                }}
                timeFilterOffsetHours={timeOffsetHours}
                onOpenIncidentView={() => setIsIncidentDrawerOpen(true)}
              />

              {/* Overlaid Operations HUD */}
              <OperationsHUD
                clusters={clusters}
                hotspots={hotspots}
                selectedCluster={selectedCluster}
                onSelectCluster={(c) => {
                  setSelectedCluster(c);
                }}
                onInspectIncident={handleInspectIncident}
                timeOffsetHours={timeOffsetHours}
                onTimeOffsetChange={(offset) => setTimeOffsetHours(offset)}
                newObservationToast={newObservationToast}
                onDismissToast={() => setNewObservationToast(null)}
                onRefreshTelemetry={handleRefresh}
                isRefreshing={isRefreshing}
                onTriggerNewObservation={handleTriggerNewObservation}
              />

              {/* Right-Side Incident Intelligence Overlay Drawer (Spec #44) */}
              {isIncidentDrawerOpen && selectedCluster && (
                <aside className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] lg:w-[540px] xl:w-[580px] z-30 shadow-[-16px_0_40px_rgba(0,0,0,0.85)] animate-in slide-in-from-right duration-300 pointer-events-auto font-creamy">
                  <IncidentIntelligenceDrawer
                    cluster={selectedCluster}
                    clusters={clusters}
                    onSelectCluster={(c) => setSelectedCluster(c)}
                    onClose={() => setIsIncidentDrawerOpen(false)}
                    isStandaloneScreen={false}
                  />
                </aside>
              )}
            </div>
          )}

          {/* SCREEN 2: DEDICATED FULL-SCREEN INCIDENT INTELLIGENCE PAGE */}
          {activeScreen === 'INCIDENT' && (
            <div className="flex-1 w-full max-w-7xl mx-auto py-2 font-creamy">
              <IncidentIntelligenceDrawer
                cluster={selectedCluster || clusters[0]}
                clusters={clusters}
                onSelectCluster={(c) => setSelectedCluster(c)}
                isStandaloneScreen={true}
              />
            </div>
          )}

          {/* SCREEN 3: MODEL & SYSTEM INTELLIGENCE */}
          {activeScreen === 'SYSTEM' && (
            <div className="flex-1 w-full font-creamy">
              <ModelSystemIntelligenceScreen
                status={status}
                onRefreshPipeline={handleRefresh}
                isRefreshing={isRefreshing}
              />
            </div>
          )}
        </main>
      )}

      {/* Ask EmberWatch AI Intelligence Agent Terminal */}
      <div className="font-creamy">
        <IntelligenceAgentModal
          isOpen={isAgentOpen}
          onClose={() => setIsAgentOpen(false)}
        />
      </div>

      {/* Automated Alerts Feed Drawer */}
      <div className="font-creamy">
        <AlertsDrawer
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          alerts={alerts}
          clusters={clusters}
          onSelectCluster={(c) => {
            setSelectedCluster(c);
            setActiveScreen('OPERATIONS');
          }}
        />
      </div>

      {/* 2-Minute Hackathon Judge Demo Tour */}
      <DemoTourGuide
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        clusters={clusters}
        onSelectCluster={(c) => setSelectedCluster(c)}
        onSelectScreen={setActiveScreen}
        onTriggerNewObservation={handleTriggerNewObservation}
        onOpenAgent={() => setIsAgentOpen(true)}
        onSetTimeOffset={setTimeOffsetHours}
      />
    </div>
  );
}
