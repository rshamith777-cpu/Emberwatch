import React, { useEffect, useRef } from 'react';
import { FireCluster, FireObservation } from '../../types/emberwatch.js';

interface ThermalFireVisualizationProps {
  cluster: FireCluster | null;
  hotspots: FireObservation[];
  clusteringProgress: number; // 0.0 (spread out) to 1.0 (clustered)
  threatConeProgress: number; // 0.0 to 1.0
  active: boolean;
}

export const ThermalFireVisualization: React.FC<ThermalFireVisualizationProps> = ({
  cluster,
  hotspots,
  clusteringProgress,
  threatConeProgress,
  active
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
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

    // Center focal coordinates for cluster demonstration
    const centerX = width * 0.52;
    const centerY = height * 0.48;

    // Convective ember particles rising
    interface Ember {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
    }

    const embers: Ember[] = [];
    for (let i = 0; i < 40; i++) {
      embers.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 0.8 + 0.4, // Slight drift with wind
        vy: -Math.random() * 1.6 - 0.8,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        life: Math.random() * 60,
        maxLife: Math.random() * 70 + 40
      });
    }

    // Simulated 14 sample hotspot points for the DBSCAN clustering visual demo
    const effectivePointsCount = Math.max(8, Math.min(18, cluster?.hotspot_count || 14));
    const samplePoints = Array.from({ length: effectivePointsCount }).map((_, i) => {
      const angle = (i / effectivePointsCount) * Math.PI * 2 + (i % 3);
      const initialDist = 120 + ((i * 37) % 90);
      const targetDist = 18 + ((i * 19) % 28);
      return {
        initialX: centerX + Math.cos(angle) * initialDist,
        initialY: centerY + Math.sin(angle) * initialDist,
        targetX: centerX + Math.cos(angle) * targetDist,
        targetY: centerY + Math.sin(angle) * targetDist,
        frp: 35 + ((i * 47) % 180),
        confidence: 80 + ((i * 11) % 20)
      };
    });

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const pClust = Math.max(0, Math.min(1, clusteringProgress));
      const pCone = Math.max(0, Math.min(1, threatConeProgress));

      // 1. Draw Downwind Threat Cone (Section 16)
      if (pCone > 0.05) {
        const headingDeg = cluster?.spread_estimate?.headingDegrees ?? 34;
        // Convert heading to canvas coordinate angle (0° = North = -Y)
        const rad = ((headingDeg - 90) * Math.PI) / 180;
        const coneLength = 260 * pCone;
        const halfSpreadAngle = ((cluster?.spread_estimate?.estimatedConeAngle ?? 42) * 0.5 * Math.PI) / 180;

        const leftAngle = rad - halfSpreadAngle;
        const rightAngle = rad + halfSpreadAngle;

        const pLeftX = centerX + Math.cos(leftAngle) * coneLength;
        const pLeftY = centerY + Math.sin(leftAngle) * coneLength;
        const pRightX = centerX + Math.cos(rightAngle) * coneLength;
        const pRightY = centerY + Math.sin(rightAngle) * coneLength;

        // Gradient filled threat corridor
        const coneGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, coneLength);
        coneGrad.addColorStop(0, 'rgba(212, 85, 67, 0.35)');
        coneGrad.addColorStop(0.5, 'rgba(184, 69, 53, 0.18)');
        coneGrad.addColorStop(1, 'rgba(184, 69, 53, 0.0)');

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pLeftX, pLeftY);
        ctx.arc(centerX, centerY, coneLength, leftAngle, rightAngle);
        ctx.closePath();
        ctx.fillStyle = coneGrad;
        ctx.fill();

        // Outer threat vector boundary lines
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pLeftX, pLeftY);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pRightX, pRightY);
        ctx.strokeStyle = 'rgba(225, 196, 122, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Central advance vector
        const headX = centerX + Math.cos(rad) * (coneLength * 0.85);
        const headY = centerY + Math.sin(rad) * (coneLength * 0.85);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = 'rgba(225, 196, 122, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Arrow tip on advance vector
        const arrowAngle = rad;
        const arrowLen = 10;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(
          headX - Math.cos(arrowAngle - 0.4) * arrowLen,
          headY - Math.sin(arrowAngle - 0.4) * arrowLen
        );
        ctx.moveTo(headX, headY);
        ctx.lineTo(
          headX - Math.cos(arrowAngle + 0.4) * arrowLen,
          headY - Math.sin(arrowAngle + 0.4) * arrowLen
        );
        ctx.strokeStyle = '#E1C47A';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 2. Draw Cluster Boundary & DBSCAN Hull as points converge
      if (pClust > 0.4) {
        const clusterAlpha = (pClust - 0.4) / 0.6;
        const clusterRadius = 48 + Math.sin(time * 2) * 3;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, clusterRadius * 1.8);
        glowGrad.addColorStop(0, `rgba(212, 85, 67, ${0.4 * clusterAlpha})`);
        glowGrad.addColorStop(0.6, `rgba(198, 161, 91, ${0.15 * clusterAlpha})`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, clusterRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Outer boundary polygon / dashed ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, clusterRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(225, 196, 122, ${0.75 * clusterAlpha})`;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Internal concentric ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, clusterRadius * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 85, 67, ${0.5 * clusterAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 3. Draw Individual Hotspot Observation Points (interpolating between initial & target clustered)
      samplePoints.forEach((pt, i) => {
        // Interpolate position based on clustering progress
        const curX = pt.initialX + (pt.targetX - pt.initialX) * pClust;
        const curY = pt.initialY + (pt.targetY - pt.initialY) * pClust;

        const pulse = 1 + Math.sin(time * 3 + i * 0.7) * 0.25;
        const pointRadius = (pt.frp > 100 ? 5.5 : 4) * pulse;

        // Thermal Halo ring
        ctx.beginPath();
        ctx.arc(curX, curY, pointRadius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 85, 67, ${0.25 / pulse})`;
        ctx.fill();

        // Core bright hotspot
        ctx.beginPath();
        ctx.arc(curX, curY, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = pt.frp > 120 ? '#FF5E4D' : '#E1C47A';
        ctx.shadowColor = '#FF5E4D';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connective trace lines during DBSCAN clustering
        if (pClust > 0.2 && pClust < 0.95) {
          ctx.beginPath();
          ctx.moveTo(curX, curY);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = `rgba(198, 161, 91, ${0.25 * (1 - Math.abs(pClust - 0.5) * 2)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // 4. Draw Rising Embers & Convective Heat Distortions (Section 25)
      embers.forEach((em) => {
        em.life++;
        em.x += em.vx;
        em.y += em.vy;

        if (em.life >= em.maxLife || em.y < centerY - 160) {
          em.life = 0;
          em.x = centerX + (Math.random() - 0.5) * 70;
          em.y = centerY + (Math.random() - 0.5) * 30;
        }

        const alphaProgress = 1 - em.life / em.maxLife;
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 196, 122, ${em.alpha * alphaProgress})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [cluster, hotspots, clusteringProgress, threatConeProgress, active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 w-full h-full"
    />
  );
};
