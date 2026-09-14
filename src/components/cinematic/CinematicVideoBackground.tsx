import React, { useEffect, useRef, useState } from 'react';

interface CinematicVideoBackgroundProps {
  scrollProgress: number; // 0.00 to 1.00
}

export const CinematicVideoBackground: React.FC<CinematicVideoBackgroundProps> = ({
  scrollProgress
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Smooth lerped scroll position for silky 60fps parallax
  const smoothScrollRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Smooth lerp loop for parallax camera drift
  useEffect(() => {
    let animId: number;
    const updateSmoothScroll = () => {
      // Lerp factor 0.08 for buttery-smooth transition
      smoothScrollRef.current += (scrollProgress - smoothScrollRef.current) * 0.08;

      if (videoRef.current && !reducedMotion) {
        const sp = smoothScrollRef.current;
        const scale = 1.06 + sp * 0.08;
        const translateY = sp * -35;
        const translateX = Math.sin(sp * Math.PI) * 10;
        videoRef.current.style.transform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`;
      }

      animId = requestAnimationFrame(updateSmoothScroll);
    };

    animId = requestAnimationFrame(updateSmoothScroll);
    return () => cancelAnimationFrame(animId);
  }, [scrollProgress, reducedMotion]);

  // Atmospheric micro-embers & haze canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Micro ember motes that gently drift upward with convective air currents
    interface Ember {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      maxAlpha: number;
      hue: 'gold' | 'flame';
      wobbleSpeed: number;
      wobbleOffset: number;
    }

    const embers: Ember[] = [];
    const count = reducedMotion ? 20 : 45;

    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.45;
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 1.0,
        vx: (Math.random() - 0.5) * 0.35 + 0.15,
        vy: -Math.random() * 0.6 - 0.25,
        alpha: Math.random() * 0.4 + 0.2,
        maxAlpha: Math.random() * 0.5 + 0.3,
        hue: isGold ? 'gold' : 'flame',
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleOffset: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y += e.vy;
        e.x += e.vx + Math.sin(time + e.wobbleOffset) * 0.3;

        // Wrap around boundaries
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
        if (e.x < -10) e.x = width + 10;
        if (e.x > width + 10) e.x = -10;

        // Draw soft glowing ember point
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius * 3.5);
        if (e.hue === 'gold') {
          // Royal Gold (#C6A15B)
          grad.addColorStop(0, `rgba(216, 184, 106, ${e.alpha})`);
          grad.addColorStop(0.4, `rgba(198, 161, 91, ${e.alpha * 0.5})`);
          grad.addColorStop(1, 'transparent');
        } else {
          // Ember Flame (#F0783C)
          grad.addColorStop(0, `rgba(240, 120, 60, ${e.alpha})`);
          grad.addColorStop(0.4, `rgba(182, 64, 47, ${e.alpha * 0.5})`);
          grad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Hot bright core
        ctx.fillStyle = e.hue === 'gold' ? `rgba(245, 240, 230, ${e.alpha * 0.9})` : `rgba(255, 240, 220, ${e.alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050505]">
      {/* 1. High-Performance Filtered Cinematic Video (Section 18 & 19) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1200 ease-out will-change-transform"
        style={{
          // Premium Cinematic Film Grade Filter:
          // Deepens contrast, enriches warm flame tones, and adds subtle filmic density
          filter: 'brightness(0.62) contrast(1.18) saturate(1.15) hue-rotate(-4deg)',
          opacity: isVideoLoaded ? 1 : 0.7,
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Source 1: High-Definition Aerial Smoke & Atmosphere */}
        <source
          src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/nexo-hero-bg-video.webm"
          type="video/webm"
        />
        {/* Source 2: Dark Cloud & Thermal Atmosphere Stream */}
        <source
          src="https://cdn.pixabay.com/video/2020/05/25/40149-425126830_large.mp4"
          type="video/mp4"
        />
      </video>

      {/* 2. Editorial Scrim: Deep Obsidian Left Fade for Perfect Text Contrast */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.72) 36%, rgba(5,5,5,0.32) 70%, rgba(5,5,5,0.65) 100%)'
        }}
      />

      {/* 3. Top & Bottom Filmic Vignette (Soft letterbox gradient) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,5,0.85) 0%, transparent 18%, transparent 75%, rgba(5,5,5,0.96) 100%)'
        }}
      />

      {/* 4. Subtle Royal Gold Atmosphere Wash (warm ambient radiance) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 75% 25%, rgba(198,161,91,0.09) 0%, transparent 65%)'
        }}
      />

      {/* 5. Delicate Micro-Embers & Smoke Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none opacity-85"
      />

      {/* 6. Analog Film Grain Texture (Removes digital banding) */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 7. Deep Radial Vignette Edge Frame */}
      <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.88)] pointer-events-none z-10" />
    </div>
  );
};
