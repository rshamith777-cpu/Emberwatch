import React, { useEffect, useRef } from 'react';

interface WindVectorFieldProps {
  windSpeedKmh: number; // e.g. 28
  windDirectionDeg: number; // e.g. 34 (NE)
  visible: boolean;
  opacity?: number;
}

export const WindVectorField: React.FC<WindVectorFieldProps> = ({
  windSpeedKmh = 28,
  windDirectionDeg = 34,
  visible = true,
  opacity = 0.65
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Convert meteorological wind direction (direction wind blows FROM)
    // to vector velocity (direction particles TRAVEL TO):
    // 0 deg = North, 90 deg = East, 180 deg = South, 270 deg = West
    // Mathematical radians: 0 is East (x+), 90 is South (y+) in standard screen coordinates
    // Downwind angle = windDirectionDeg - 90 in degrees:
    const travelAngleRad = ((windDirectionDeg - 90) * Math.PI) / 180;

    // Scale speed (28 km/h -> reasonable screen pixel velocity)
    const baseSpeed = Math.max(1.2, Math.min(6.5, windSpeedKmh * 0.12));

    interface WindStreamline {
      x: number;
      y: number;
      length: number;
      speed: number;
      alpha: number;
      maxAlpha: number;
      life: number;
      maxLife: number;
      width: number;
    }

    const streamlines: WindStreamline[] = [];
    const count = Math.min(140, Math.floor(width / 12));

    for (let i = 0; i < count; i++) {
      streamlines.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 50 + 20,
        speed: baseSpeed * (0.8 + Math.random() * 0.4),
        alpha: 0,
        maxAlpha: Math.random() * 0.45 + 0.15,
        life: Math.random() * 100,
        maxLife: Math.random() * 140 + 80,
        width: Math.random() > 0.8 ? 1.5 : 0.8
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const vx = Math.cos(travelAngleRad);
      const vy = Math.sin(travelAngleRad);

      for (let i = 0; i < streamlines.length; i++) {
        const s = streamlines[i];
        s.life++;

        // Fade in and out along lifespan
        if (s.life < 25) {
          s.alpha = (s.life / 25) * s.maxAlpha;
        } else if (s.life > s.maxLife - 25) {
          s.alpha = ((s.maxLife - s.life) / 25) * s.maxAlpha;
        } else {
          s.alpha = s.maxAlpha;
        }

        s.x += vx * s.speed;
        s.y += vy * s.speed;

        // Wrap around viewport edges
        if (s.x < -s.length) s.x = width + s.length;
        if (s.x > width + s.length) s.x = -s.length;
        if (s.y < -s.length) s.y = height + s.length;
        if (s.y > height + s.length) s.y = -s.length;

        // Reset if reached max life
        if (s.life >= s.maxLife) {
          s.life = 0;
          s.x = Math.random() * width;
          s.y = Math.random() * height;
        }

        // Draw streamline with soft tapered head
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - vx * s.length, s.y - vy * s.length);
        ctx.strokeStyle = `rgba(198, 161, 91, ${s.alpha * opacity})`;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Subtle glowing head dot on select streamlines
        if (s.width > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(225, 196, 122, ${s.alpha * opacity * 1.5})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [windSpeedKmh, windDirectionDeg, visible, opacity]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-15 w-full h-full"
      style={{ opacity }}
    />
  );
};
