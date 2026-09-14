import React, { useState, useEffect, useRef } from 'react';
import { FireCluster, FireObservation, SystemStatus } from '../../types/emberwatch.js';
import { CinematicVideoBackground } from './CinematicVideoBackground.js';
import { WindVectorField } from './WindVectorField.js';
import { ScrollStoryNavigation } from './ScrollStoryNavigation.js';
import { CinematicSections } from './CinematicSections.js';
import { CustomCursor } from './CustomCursor.js';

interface CinematicExperienceProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  status: SystemStatus | null;
  selectedCluster: FireCluster | null;
  onEnterOperations: () => void;
  onSelectCluster: (c: FireCluster) => void;
  onSelectScreen?: (screen: any) => void;
}

export const CinematicExperience: React.FC<CinematicExperienceProps> = ({
  clusters,
  hotspots,
  status,
  selectedCluster,
  onEnterOperations,
  onSelectCluster,
  onSelectScreen
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  // Monitor scroll within container or window
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
      setScrollProgress(progress);

      // 6 key milestones (0: Hero/Observe, 1: Detect, 2: Understand, 3: Project, 4: Protect, 5: Command)
      const secIndex = Math.min(5, Math.floor(progress * 5.95));
      setCurrentSection(secIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJumpToSection = (sectionIndex: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targetElement = document.getElementById(`story-sec-${sectionIndex}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToNext = () => {
    handleJumpToSection(1);
  };

  // Weather parameters from current top cluster
  const activeCluster = selectedCluster || clusters[0] || null;
  const windSpeedKmh = activeCluster?.weather?.wind_speed_10m || 28;
  const windDirectionDeg = activeCluster?.weather?.wind_direction_10m || 34;

  // Calculation of clustering & threat cone progress
  // Section 01 (Observe) -> 0.0 to 0.20
  // Section 02 (Detect: clustering morph) -> 0.20 to 0.40
  // Section 03 (Understand: wind) -> 0.40 to 0.60
  // Section 04 (Project: threat cone) -> 0.60 to 0.80
  // Section 05 (Protect: buffers) -> 0.80 to 0.95
  // Section 06 (Command) -> 0.95 to 1.00
  const clusteringProgress = Math.min(1, Math.max(0, (scrollProgress - 0.15) / 0.25));
  const threatConeProgress = Math.min(1, Math.max(0, (scrollProgress - 0.45) / 0.25));

  // Wind field is visible throughout but stronger in sections 2 & 3
  const isWindVisible = scrollProgress > 0.18 && scrollProgress < 0.92;
  const windOpacity =
    scrollProgress > 0.35 && scrollProgress < 0.75
      ? 0.85
      : 0.35;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-[#050505] text-[#F5F0E6] scroll-smooth selection:bg-[#B6402F] selection:text-[#050505]"
    >
      {/* Custom Refined Luxury Cursor */}
      <CustomCursor />

      {/* Layer 01 & 02: Cinematic Video & Atmospheric Simulation Background */}
      <CinematicVideoBackground scrollProgress={scrollProgress} />

      {/* Layer 06: Wind Vector Field simulation */}
      <WindVectorField
        windSpeedKmh={windSpeedKmh}
        windDirectionDeg={windDirectionDeg}
        visible={isWindVisible}
        opacity={windOpacity}
      />

      {/* Layer 08 & 09: Editorial Content Sections */}
      <CinematicSections
        clusters={clusters}
        hotspots={hotspots}
        status={status}
        selectedCluster={activeCluster}
        onEnterOperations={onEnterOperations}
        onSelectCluster={onSelectCluster}
        onSelectScreen={onSelectScreen}
        scrollProgress={scrollProgress}
        onScrollToNext={handleScrollToNext}
      />

      {/* Layer 10: Vertical Scroll Progress Story Navigation */}
      <ScrollStoryNavigation
        currentSection={currentSection}
        scrollProgress={scrollProgress}
        onJumpToSection={handleJumpToSection}
      />
    </div>
  );
};
