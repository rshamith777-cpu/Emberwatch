import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FireCluster, FireObservation } from '../../types/emberwatch.js';
import { Globe, Flame, Radio } from 'lucide-react';

interface FireGlobe3DProps {
  clusters: FireCluster[];
  hotspots: FireObservation[];
  selectedCluster: FireCluster | null;
  onSelectCluster?: (c: FireCluster) => void;
  scrollProgress?: number;
}

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const FireGlobe3D: React.FC<FireGlobe3DProps> = ({
  clusters,
  hotspots,
  selectedCluster,
  onSelectCluster,
  scrollProgress = 0
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedClusterRef = useRef(selectedCluster);
  selectedClusterRef.current = selectedCluster;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    // 2. Lighting: Warm solar flame illumination
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffa200, 2.5);
    sunLight.position.set(10, 8, 8);
    scene.add(sunLight);

    // 3. Earth Globe Sphere with Warm Fire Theme
    const globeRadius = 3.0;
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Canvas procedural earth texture with warm ochre/terracotta continents and deep amber oceans
    function createFireEarthTexture(): THREE.Texture {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Deep amber/warm terracotta oceans
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#FFE8D6');
      oceanGrad.addColorStop(0.5, '#FFD4B2');
      oceanGrad.addColorStop(1, '#FFC299');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Procedural continents in warm terracotta/umber
      ctx.fillStyle = '#C2410C';
      ctx.beginPath();
      // North America
      ctx.ellipse(250, 160, 140, 90, 0.2, 0, Math.PI * 2);
      // South America
      ctx.ellipse(340, 340, 75, 120, 0.3, 0, Math.PI * 2);
      // Eurasia
      ctx.ellipse(650, 160, 210, 100, -0.1, 0, Math.PI * 2);
      // Africa
      ctx.ellipse(560, 270, 90, 110, 0, 0, Math.PI * 2);
      // Australia
      ctx.ellipse(820, 340, 70, 50, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric latitude grid lines (warm gold)
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
      ctx.lineWidth = 1;
      for (let y = 64; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
      for (let x = 64; x < 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    }

    const earthMat = new THREE.MeshStandardMaterial({
      map: createFireEarthTexture(),
      roughness: 0.7,
      metalness: 0.1
    });
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Warm atmospheric thermal glow halo
    const haloGeo = new THREE.SphereGeometry(globeRadius * 1.05, 48, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    earthGroup.add(haloMesh);

    // 4. 3D Active Wildfire Beacons & Rising Flame Spires
    const fireSpireGroup = new THREE.Group();
    earthGroup.add(fireSpireGroup);

    const activeClusters = clusters.length > 0 ? clusters : [
      { id: '1', center_lat: 39.88, center_lon: -121.24, max_frp: 187, risk_score: 91, name: 'Feather River Complex' },
      { id: '2', center_lat: 34.22, center_lon: -118.05, max_frp: 112, risk_score: 84, name: 'Angeles Ridge Fire' },
      { id: '3', center_lat: 44.12, center_lon: -121.75, max_frp: 74, risk_score: 72, name: 'Cascade Timber Run' }
    ];

    activeClusters.forEach((cl) => {
      const pos3d = latLonToVector3(cl.center_lat, cl.center_lon, globeRadius);
      const normal = pos3d.clone().normalize();

      // Glowing base ring
      const ringGeo = new THREE.RingGeometry(0.08, 0.22, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff3300,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos3d.clone().add(normal.clone().multiplyScalar(0.02)));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      fireSpireGroup.add(ringMesh);

      // Rising 3D Flame Spire (Cone projecting upward into space)
      const spireHeight = 0.45 + (cl.max_frp / 200) * 0.45;
      const spireGeo = new THREE.ConeGeometry(0.07, spireHeight, 16);
      spireGeo.translate(0, spireHeight / 2, 0);
      spireGeo.rotateX(Math.PI / 2);

      const spireMat = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.95
      });
      const spireMesh = new THREE.Mesh(spireGeo, spireMat);
      spireMesh.position.copy(pos3d);
      spireMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      fireSpireGroup.add(spireMesh);

      // Radiative beacon tip
      const tipGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.copy(pos3d.clone().add(normal.clone().multiplyScalar(spireHeight)));
      fireSpireGroup.add(tipMesh);
    });

    // 5. Orbital VIIRS Satellite Scanning Sweep
    const orbitRadius = globeRadius * 1.35;
    const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius * 0.85, 0, 2 * Math.PI, false, 0);
    const points = orbitCurve.getPoints(64);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0, p.y)));
    const orbitMat = new THREE.LineBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0.4 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = 0.45;
    orbitLine.rotation.z = -0.3;
    scene.add(orbitLine);

    // Satellite Model (Small gold instrument)
    const satMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.16),
      new THREE.MeshBasicMaterial({ color: 0xd97706 })
    );
    scene.add(satMesh);

    // 6. Interactive Mouse Drag to Rotate Earth
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotSpeedY = 0.003;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      earthGroup.rotation.y += dx * 0.006;
      earthGroup.rotation.x = Math.max(-0.6, Math.min(0.6, earthGroup.rotation.x + dy * 0.006));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        earthGroup.rotation.y += rotSpeedY;
      }

      // Satellite orbit trajectory
      const satAngle = time * 0.4;
      satMesh.position.x = Math.cos(satAngle) * orbitRadius;
      satMesh.position.y = Math.sin(satAngle) * (orbitRadius * 0.35);
      satMesh.position.z = Math.sin(satAngle) * (orbitRadius * 0.85);
      satMesh.rotation.y = satAngle + Math.PI / 2;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [clusters]);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#11161D] to-[#070809] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#F5F0E6]">
                3D Global Thermal Radiance Globe
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#D85B35]/20 text-[#F5F0E6] text-[10px] font-mono-tech font-bold uppercase tracking-wider border border-[#D85B35]/40">
                NASA FIRMS SYNCED
              </span>
            </div>
            <p className="text-xs text-[#D1CBC0] mt-0.5">
              Active wildfire cluster spires, VIIRS sub-pixel thermal anomalies, and sun-synchronous orbital track
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-[#B6402F]/20 border border-[#B6402F]/40 text-[#F5F0E6] font-bold flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[#D85B35]" />
            {clusters.length} ACTIVE CLUSTERS TRACKED
          </span>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative h-[340px] sm:h-[400px] rounded-xl bg-gradient-to-b from-[#050505] to-[#0D1117] border border-white/[0.08] shadow-inner overflow-hidden cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="w-full h-full" />

        {/* Orbit indicator badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-[#11161D]/90 backdrop-blur-sm border border-white/[0.08] text-xs font-mono-tech text-[#F5F0E6] shadow-sm flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-[#D85B35] animate-pulse" />
          <span>SUOMI-NPP & NOAA-20 SATELLITE TRACK</span>
        </div>

        {/* Drag Instruction */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-[#11161D]/90 border border-white/[0.08] text-[10px] font-mono-tech text-[#F5F0E6] shadow-sm">
          DRAG TO ROTATE 3D GLOBE &bull; FLAME SPIRES INDICATE MEGA-FIRE COMPLEXES
        </div>
      </div>
    </div>
  );
};
