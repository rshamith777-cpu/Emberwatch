import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Mountain, Play, Pause, RotateCcw, Compass, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface TerrainFire3DProps {
  windHeading?: number;
  windSpeed?: number;
}

export const TerrainFire3D: React.FC<TerrainFire3DProps> = ({
  windHeading = 34,
  windSpeed = 28
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [timelineHour, setTimelineHour] = useState<number>(2.5); // 0 to 6 hours
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [windAngle, setWindAngle] = useState<number>(windHeading);
  const [slopeSteepness, setSlopeSteepness] = useState<number>(28); // degrees slope

  const paramsRef = useRef({
    timelineHour,
    windAngle,
    slopeSteepness
  });

  useEffect(() => {
    paramsRef.current = {
      timelineHour,
      windAngle,
      slopeSteepness
    };
  }, [timelineHour, windAngle, slopeSteepness]);

  // Play/pause simulation timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineHour((prev) => {
        if (prev >= 6.0) return 0.2;
        return +(prev + 0.1).toFixed(1);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 11);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // 2. Lighting: Warm sun + ambient fill
    const ambientLight = new THREE.AmbientLight(0xfff5eb, 0.8);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.8);
    sun.position.set(8, 12, 6);
    scene.add(sun);

    const fireGlowLight = new THREE.PointLight(0xff5500, 2.5, 8);
    fireGlowLight.position.set(0, 1.2, 0);
    scene.add(fireGlowLight);

    // 3. 3D Mountain Terrain Mesh with Elevation Contours
    const terrainSize = 9.0;
    const segments = 64;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    const vertexCount = pos.count;

    // Height displacement function (mountain ridge + canyon + saddle)
    function getElevation(x: number, z: number): number {
      const ridge1 = Math.exp(-Math.pow(x - 0.8, 2) / 3.0) * 1.8 * Math.cos(z * 0.4);
      const ridge2 = Math.exp(-Math.pow(z + 1.2, 2) / 4.0) * 1.4;
      const hills = Math.sin(x * 0.9) * Math.cos(z * 0.9) * 0.5;
      return Math.max(0, ridge1 + ridge2 + hills);
    }

    const baseElevations = new Float32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getElevation(x, z);
      baseElevations[i] = y;
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    // Custom vertex colors for Terrain: Unburned green/tan -> Active flame orange -> Burnt dark charcoal
    const colors = new Float32Array(vertexCount * 3);
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.1,
      wireframe: false
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);

    // Wireframe overlay to emphasize 3D topographic contour lines
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const wireframeMesh = new THREE.Mesh(terrainGeo, wireframeMat);
    wireframeMesh.position.y = 0.02;
    scene.add(wireframeMesh);

    // 4. 3D Active Fire Perimeter Flame Particles
    const fireParticleCount = 300;
    const fireGeo = new THREE.BufferGeometry();
    const firePositions = new Float32Array(fireParticleCount * 3);
    const fireLife = new Float32Array(fireParticleCount);

    for (let i = 0; i < fireParticleCount; i++) {
      firePositions[i * 3] = 0;
      firePositions[i * 3 + 1] = 0;
      firePositions[i * 3 + 2] = 0;
      fireLife[i] = Math.random();
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));

    function createFlameDiscTexture(): THREE.Texture {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 240, 180, 1)');
      grad.addColorStop(0.35, 'rgba(255, 110, 20, 0.9)');
      grad.addColorStop(0.8, 'rgba(216, 60, 10, 0.3)');
      grad.addColorStop(1, 'rgba(180, 20, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    }

    const fireParticleMat = new THREE.PointsMaterial({
      size: 0.55,
      map: createFlameDiscTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xff6600
    });
    const firePoints = new THREE.Points(fireGeo, fireParticleMat);
    scene.add(firePoints);

    // 5. Interactive Mouse Drag to Rotate 3D Terrain
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    let rotY = 0.5;
    let rotX = 0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - previousMouse.x;
      const dy = e.clientY - previousMouse.y;
      rotY += dx * 0.007;
      rotX = Math.max(0.1, Math.min(1.1, rotX + dy * 0.007));
      previousMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const { timelineHour: tHour, windAngle: wAngle } = paramsRef.current;

      // Calculate Fire Front Spread Radius & Elliptical Expansion
      // Ignition point at (-1.5, 0.5, -1.0)
      const ignX = -1.2;
      const ignZ = -0.8;
      const spreadDist = Math.max(0.2, tHour * 0.65);
      const radWind = THREE.MathUtils.degToRad(wAngle);
      const windDirX = Math.cos(radWind);
      const windDirZ = Math.sin(radWind);

      // Center of active fire perimeter shifts downwind
      const frontCenterX = ignX + windDirX * (spreadDist * 0.6);
      const frontCenterZ = ignZ + windDirZ * (spreadDist * 0.6);

      // Light position tracks the flame front
      fireGlowLight.position.set(frontCenterX, 1.5, frontCenterZ);
      fireGlowLight.intensity = 2.0 + Math.sin(time * 12) * 0.6;

      // Update Terrain Vertex Colors
      const colorAttr = terrainGeo.attributes.color as THREE.BufferAttribute;
      const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
      const cArr = colorAttr.array as Float32Array;

      // Colors: Unburned (warm forest gold/green), Active Flame (white/orange), Burnt (charcoal/ash)
      for (let i = 0; i < vertexCount; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);

        // Vector from ignition point
        const dx = vx - ignX;
        const dz = vz - ignZ;

        // Elliptical distance based on wind heading
        const projOnWind = dx * windDirX + dz * windDirZ;
        const perpToWind = -dx * windDirZ + dz * windDirX;
        const ellipseDist = Math.sqrt(
          Math.pow(projOnWind - spreadDist * 0.4, 2) / Math.pow(spreadDist, 2) +
          Math.pow(perpToWind, 2) / Math.pow(spreadDist * 0.55, 2)
        );

        if (ellipseDist < 0.85) {
          // Burnt scar: Dark charcoal ash
          cArr[i * 3] = 0.16;
          cArr[i * 3 + 1] = 0.12;
          cArr[i * 3 + 2] = 0.10;
        } else if (ellipseDist >= 0.85 && ellipseDist <= 1.15) {
          // Active Fire Perimeter: Blazing vermilion flame
          cArr[i * 3] = 1.0;
          cArr[i * 3 + 1] = 0.38 + Math.sin(time * 8 + vx) * 0.15;
          cArr[i * 3 + 2] = 0.05;
        } else {
          // Unburned Fuel: Warm ochre / chaparral amber
          const elev = baseElevations[i];
          cArr[i * 3] = 0.82 - elev * 0.08;
          cArr[i * 3 + 1] = 0.72 - elev * 0.05;
          cArr[i * 3 + 2] = 0.54 - elev * 0.1;
        }
      }
      colorAttr.needsUpdate = true;

      // Update 3D Flame Particles along the active perimeter
      const fPos = fireGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < fireParticleCount; i++) {
        fireLife[i] += delta * 1.5;
        if (fireLife[i] > 1.0) {
          fireLife[i] = 0;
          // Place particle around perimeter
          const angle = Math.random() * Math.PI * 2;
          const rX = spreadDist * (0.9 + Math.random() * 0.2);
          const rZ = spreadDist * 0.55 * (0.9 + Math.random() * 0.2);

          const localX = Math.cos(angle) * rX;
          const localZ = Math.sin(angle) * rZ;

          // Rotate to wind heading
          const rotatedX = localX * windDirX - localZ * windDirZ;
          const rotatedZ = localX * windDirZ + localZ * windDirX;

          const wx = ignX + windDirX * (spreadDist * 0.4) + rotatedX;
          const wz = ignZ + windDirZ * (spreadDist * 0.4) + rotatedZ;
          const wy = getElevation(wx, wz);

          fPos[i * 3] = wx;
          fPos[i * 3 + 1] = wy + 0.1;
          fPos[i * 3 + 2] = wz;
        } else {
          fPos[i * 3 + 1] += delta * (0.8 + Math.random() * 1.2);
          fPos[i * 3] += windDirX * delta * 0.35;
          fPos[i * 3 + 2] += windDirZ * delta * 0.35;
        }
      }
      fireGeo.attributes.position.needsUpdate = true;

      // Update camera orbit
      const dist = 12.0;
      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * dist;
      camera.position.y = Math.sin(rotX) * dist + 1.5;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * dist;
      camera.lookAt(0, 0.8, 0);

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
  }, []);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#11161D] to-[#070809] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Mountain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#F5F0E6]">
                3D Topographic Wildfire Spread Model
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#C6A15B]/20 text-[#D8B86A] text-[10px] font-mono-tech font-bold uppercase tracking-wider border border-[#C6A15B]/30">
                SLOPE & WIND COUPLING
              </span>
            </div>
            <p className="text-xs text-[#D1CBC0] mt-0.5">
              Rothermel rate-of-spread across 3D elevation contours with ash scar, active flame front, and unburned timber canopy
            </p>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#B6402F]/20 border border-[#B6402F]/40 text-[#F5F0E6] font-bold">
            TIMELINE: +{timelineHour.toFixed(1)} HRS PROJECTION
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-[#D85B35] hover:bg-[#B6402F] text-[#F5F0E6] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY SPREAD'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative h-[340px] sm:h-[400px] rounded-xl bg-gradient-to-b from-[#050505] to-[#0D1117] border border-white/[0.08] shadow-inner overflow-hidden cursor-grab active:cursor-grabbing mb-4">
        <div ref={mountRef} className="w-full h-full" />

        {/* Floating Legend */}
        <div className="absolute top-3 left-3 p-3 rounded-xl bg-[#11161D]/90 backdrop-blur-sm border border-white/[0.08] text-xs font-mono-tech space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-orange-500 inline-block shadow-sm" />
            <span className="text-[#F5F0E6] font-bold">ACTIVE FLAME PERIMETER (3D PARTICLES)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#2D211B] inline-block" />
            <span className="text-[#D1CBC0]">BURNT ASH & CHARCOAL SCAR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#D4AF37] inline-block" />
            <span className="text-[#D1CBC0]">UNBURNED CHAPARRAL / TIMBER FUELS</span>
          </div>
        </div>

        {/* Drag badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-[#11161D]/90 border border-white/[0.08] text-[10px] font-mono-tech text-[#F5F0E6] shadow-sm">
          DRAG TO ROTATE 3D MOUNTAIN RIDGE &bull; ELEVATION PRE-HEATING EFFECT ACTIVE
        </div>
      </div>

      {/* Interactive Time-Scrubber & Wind Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 font-ui">
        {/* Timeline Scrubber */}
        <div className="p-3 rounded-xl bg-[#171D24] border border-white/[0.08] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-[#F5F0E6] font-bold">FLAME ADVANCE TIME</span>
            <span className="font-bold text-[#D85B35]">T+{timelineHour.toFixed(1)} Hours</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="6.0"
            step="0.1"
            value={timelineHour}
            onChange={(e) => setTimelineHour(+e.target.value)}
            className="w-full accent-[#D85B35] cursor-pointer h-1.5 bg-[#11161D] rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono-tech text-[#858078]">
            <span>Ignition (T+0h)</span>
            <span>Mid-Spread (+3h)</span>
            <span>Maximum (+6h)</span>
          </div>
        </div>

        {/* Wind Heading Angle */}
        <div className="p-3 rounded-xl bg-[#171D24] border border-white/[0.08] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-[#F5F0E6] font-bold flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#C6A15B]" />
              SURFACE WIND HEADING
            </span>
            <span className="font-bold text-[#D8B86A]">{windAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={windAngle}
            onChange={(e) => setWindAngle(+e.target.value)}
            className="w-full accent-[#C6A15B] cursor-pointer h-1.5 bg-[#11161D] rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono-tech text-[#858078]">
            <span>North (0°)</span>
            <span>East (90°)</span>
            <span>South (180°)</span>
          </div>
        </div>

        {/* Calculated Terrain Slope Rate */}
        <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-orange-900 font-bold">UPSLOPE SPREAD FACTOR</span>
            <span className="font-bold text-red-600">+185% ACCELERATION</span>
          </div>
          <p className="text-[11px] text-[#7C2D12] mt-1">
            Flame radiation pre-heats timber canopy on steep grades, doubling forward rate of spread compared to flat ground.
          </p>
        </div>
      </div>
    </div>
  );
};
