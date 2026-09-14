import React, { useEffect, useState } from 'react';
import {
  Radio,
  RefreshCw,
  Sparkles,
  Bell,
  Play,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { SystemStatus, EmberAlert, PrimaryScreen } from '../types/emberwatch.js';
import { EmberWatchLogo } from './EmberWatchLogo.js';

interface HeaderProps {
  status: SystemStatus | null;
  alerts: EmberAlert[];
  isRefreshing: boolean;
  activeScreen: PrimaryScreen;
  onSelectScreen: (screen: PrimaryScreen) => void;
  onRefresh: () => void;
  onToggleMode: () => void;
  onOpenAgent: () => void;
  onOpenAlerts: () => void;
  onStartDemoTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  alerts,
  isRefreshing,
  activeScreen,
  onSelectScreen,
  onRefresh,
  onToggleMode,
  onOpenAgent,
  onOpenAlerts,
  onStartDemoTour
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const isDemo = status?.mode === 'DEMO_SNAPSHOT';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(`${timeStr} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full h-[76px] px-6 lg:px-10 flex items-center justify-between border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-xl transition-all select-none">
      {/* LEFT: EMBERWATCH Brand (Section 10 & 11) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onSelectScreen('CINEMATIC')}
          className="flex items-center gap-3.5 group text-left cursor-pointer transition-opacity hover:opacity-90"
        >
          <EmberWatchLogo size={34} variant="gold" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-fire text-2xl tracking-[0.16em] text-[#F5F0E6] leading-none">
                EMBER<span className="text-fire-gradient font-fire">WATCH</span>
              </span>
            </div>
            <span className="font-mono-tech text-[9px] tracking-[0.26em] text-[#858078] uppercase mt-1">
              REAL-TIME WILDFIRE INTELLIGENCE
            </span>
          </div>
        </button>

        {isDemo ? (
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono-tech tracking-widest uppercase bg-[#C6A15B]/15 text-[#D8B86A] border border-[#C6A15B]/30">
            VERIFIED SNAPSHOT
          </span>
        ) : (
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono-tech tracking-widest uppercase bg-[#718070]/15 text-[#9ab098] border border-[#718070]/30">
            FIRMS SYNCHRONIZED
          </span>
        )}
      </div>

      {/* CENTER: Minimal Editorial Navigation (Section 10, 12, 13) */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        <button
          onClick={() => onSelectScreen('CINEMATIC')}
          id="nav-screen-story"
          className={`px-3.5 py-2 font-mono-tech text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-250 cursor-pointer ${
            activeScreen === 'CINEMATIC'
              ? 'text-[#C6A15B] border-b border-[#C6A15B]'
              : 'text-[#858078] hover:text-[#F5F0E6]'
          }`}
        >
          OVERVIEW
        </button>

        <button
          onClick={() => onSelectScreen('OPERATIONS')}
          id="nav-screen-operations"
          className={`px-3.5 py-2 font-mono-tech text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-250 cursor-pointer ${
            activeScreen === 'OPERATIONS'
              ? 'text-[#C6A15B] border-b border-[#C6A15B]'
              : 'text-[#858078] hover:text-[#F5F0E6]'
          }`}
        >
          OPERATIONS
        </button>

        <button
          onClick={() => onSelectScreen('INCIDENT')}
          id="nav-screen-incident"
          className={`px-3.5 py-2 font-mono-tech text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-250 cursor-pointer ${
            activeScreen === 'INCIDENT'
              ? 'text-[#C6A15B] border-b border-[#C6A15B]'
              : 'text-[#858078] hover:text-[#F5F0E6]'
          }`}
        >
          INTELLIGENCE
        </button>

        <button
          onClick={() => onSelectScreen('SYSTEM')}
          id="nav-screen-system"
          className={`px-3.5 py-2 font-mono-tech text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-250 cursor-pointer ${
            activeScreen === 'SYSTEM'
              ? 'text-[#C6A15B] border-b border-[#C6A15B]'
              : 'text-[#858078] hover:text-[#F5F0E6]'
          }`}
        >
          SYSTEM
        </button>
      </nav>

      {/* RIGHT: Operational Telemetry + CTAs (Section 10 & 14) */}
      <div className="flex items-center gap-3">
        {/* Live Satellite Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#11161D] border border-white/[0.08] shadow-sm font-mono-tech text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDemo ? 'bg-[#C6A15B]' : 'bg-[#D85B35]'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDemo ? 'bg-[#C6A15B]' : 'bg-[#B6402F]'}`}></span>
          </span>
          <span className="tracking-widest font-semibold text-[#F5F0E6]">
            {isDemo ? 'SNAPSHOT' : 'LIVE'}
          </span>
          <span className="text-[#625F58] hidden sm:inline">|</span>
          <span className="text-[#858078] hidden sm:inline">{currentTime || '08:26 UTC'}</span>
        </div>

        {/* Ask EmberWatch AI Button */}
        <button
          onClick={onOpenAgent}
          id="btn-ask-emberwatch"
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#171D24] hover:bg-[#1f2730] text-[#F5F0E6] border border-white/[0.08] hover:border-[#C6A15B]/40 font-mono-tech text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer"
          title="Open Intelligence Agent Terminal"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#C6A15B]" />
          <span>Ask EmberWatch</span>
        </button>

        {/* Alerts Badge */}
        <button
          onClick={onOpenAlerts}
          id="btn-alerts-drawer"
          className="relative p-2 rounded-lg bg-[#11161D] hover:bg-[#171D24] border border-white/[0.08] text-[#D1CBC0] hover:text-[#F5F0E6] transition cursor-pointer"
          title="Active Wildfire Alerts"
        >
          <Bell className="h-4 w-4" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#C84B38] text-white text-[9px] font-mono-tech font-bold ring-2 ring-[#050505]">
              {criticalCount}
            </span>
          )}
        </button>

        {/* Manual Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-[#11161D] hover:bg-[#171D24] border border-white/[0.08] text-[#858078] hover:text-[#F5F0E6] transition cursor-pointer disabled:opacity-50"
          title="Sync Real-Time Satellite Feed"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#C6A15B]' : ''}`} />
        </button>

        {/* Quick Demo Script Runner */}
        {onStartDemoTour && (
          <button
            onClick={onStartDemoTour}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6A15B]/15 hover:bg-[#C6A15B]/25 text-[#D8B86A] border border-[#C6A15B]/40 font-mono-tech text-xs font-semibold tracking-wider transition cursor-pointer"
            title="Launch 2-Minute Judge Walkthrough"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>TOUR</span>
          </button>
        )}

        {/* ENTER OPERATIONS CTA (Primary Button) */}
        {activeScreen !== 'OPERATIONS' && (
          <button
            onClick={() => onSelectScreen('OPERATIONS')}
            id="header-cta-enter-operations"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C6A15B] hover:bg-[#D8B86A] text-[#050505] font-mono-tech text-xs font-bold tracking-[0.16em] uppercase shadow-lg shadow-[#C6A15B]/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <span>OPERATIONS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
