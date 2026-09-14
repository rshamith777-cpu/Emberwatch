import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Flame, Wind, Gauge, Sparkles, RotateCcw, ShieldAlert, Sliders } from 'lucide-react';

interface FireSimulation3DProps {
  initialWindSpeed?: number;
  initialWindDir?: number;
  initialFrp?: number;
  onMetricsChange?: (metrics: { flameLength: number; fireIntensity: number; spottingKm: number }) => void;
  compact?: boolean;
}

export const FireSimulation3D: React.FC<FireSimulation3DProps> = ({
  initialWindSpeed = 28,
  initialWindDir = 34,
  initialFrp = 187,
  onMetricsChange,
  compact = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interactive Fire Behavior Parameters
  const [fuelLoad, setFuelLoad] = useState<number>(3.2); // kg/m^2
  const [fuelMoisture, setFuelMoisture] = useState<number>(7.5); // % (critically dry < 8%)
  const [windSpeed, setWindSpeed] = useState<number>(initialWindSpeed); // km/h
  const [flameIntensity, setFlameIntensity] = useState<number>(1.2); // scalar multiplier
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'perspective' | 'top' | 'cross-wind'>('perspective');

  // Calculated Wildfire Behavior Metrics (Rothermel & Byram Equations)
  // Byram's Flame Length: F_L = 0.0775 * (I)^0.46
  // Byram's Fire Intensity: I = H * w * r
  const effectiveWind = windSpeed * 0.2778; // m/s
  const drynessFactor = Math.max(0.4, (20 - fuelMoisture) / 13);
  const rateOfSpread = Math.max(0.1, (0.05 + 0.015 * Math.pow(effectiveWind, 1.4)) * fuelLoad * drynessFactor * flameIntensity); // m/min
  const flameLength = Math.min(12, Math.max(0.8, 0.45 * Math.pow(rateOfSpread * fuelLoad * 450, 0.46))); // meters
  const firelineIntensity = Math.round(260 * Math.pow(flameLength, 2.17)); // kW/m
  const maxSpottingDistKm = +(0.15 * Math.pow(effectiveWind, 0.9) * (flameLength / 3.0)).toFixed(2);

  // Notify parent of metric changes
  useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange({
        flameLength: +flameLength.toFixed(1),
        fireIntensity: firelineIntensity,
        spottingKm: maxSpottingDistKm
      });
    }
  }, [flameLength, firelineIntensity, maxSpottingDistKm, onMetricsChange]);

  // Reference hooks to update Three.js scene without full re-mount
  const paramsRef = useRef({
    fuelLoad,
    windSpeed,
    windDir: initialWindDir,
    flameIntensity,
    flameLength,
    isAutoRotate
  });

  useEffect(() => {
    paramsRef.current = {
      fuelLoad,
      windSpeed,
      windDir: initialWindDir,
      flameIntensity,
      flameLength,
      isAutoRotate
    };
  }, [fuelLoad, windSpeed, initialWindDir, flameIntensity, flameLength, isAutoRotate]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null; // transparent canvas

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);

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

    // 2. Lighting: Warm incandescent fire glow & ambient fill
    const ambientLight = new THREE.AmbientLight(0xffecd6, 0.6);
    scene.add(ambientLight);

    const fireLight = new THREE.PointLight(0xff6a00, 3.5, 15);
    fireLight.position.set(0, 1.8, 0);
    scene.add(fireLight);

    const coreLight = new THREE.PointLight(0xfff7d6, 4.0, 8);
    coreLight.position.set(0, 0.8, 0);
    scene.add(coreLight);

    // 3. Ground Terrain Disc (Charred ember ring & warm soil)
    const groundGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.25, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x241710,
      roughness: 0.9,
      metalness: 0.1
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.12;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Glowing ember coals on the ground
    const coalGeo = new THREE.RingGeometry(0.2, 2.6, 32);
    const coalMat = new THREE.MeshBasicMaterial({
      color: 0xff3b00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });
    const coalMesh = new THREE.Mesh(coalGeo, coalMat);
    coalMesh.rotation.x = -Math.PI / 2;
    coalMesh.position.y = 0.02;
    scene.add(coalMesh);

    // 4. Procedural 3D Multi-Layer Fire Particles
    // Layer A: Incandescent Inner Combustion Flame Core (Yellow/White Hot)
    const coreCount = 180;
    const coreGeo = new THREE.BufferGeometry();
    const corePositions = new Float32Array(coreCount * 3);
    const coreVelocities = new Float32Array(coreCount * 3);
    const coreLife = new Float32Array(coreCount);
    const coreMaxLife = new Float32Array(coreCount);

    for (let i = 0; i < coreCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.45;
      corePositions[i * 3] = Math.cos(angle) * r;
      corePositions[i * 3 + 1] = Math.random() * 0.5;
      corePositions[i * 3 + 2] = Math.sin(angle) * r;

      coreVelocities[i * 3] = (Math.random() - 0.5) * 0.15;
      coreVelocities[i * 3 + 1] = 1.2 + Math.random() * 2.2;
      coreVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

      coreLife[i] = Math.random();
      coreMaxLife[i] = 0.6 + Math.random() * 0.6;
    }
    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));

    // Custom Canvas Circular Glow Texture for particles
    function createGlowTexture(colorStr: string): THREE.Texture {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, colorStr);
      grad.addColorStop(0.35, colorStr);
      grad.addColorStop(0.7, 'rgba(255, 120, 0, 0.4)');
      grad.addColorStop(1, 'rgba(255, 60, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    }

    const coreTexture = createGlowTexture('rgba(255, 255, 220, 1)');
    const coreMat = new THREE.PointsMaterial({
      size: 0.65,
      map: coreTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xfffae0
    });
    const corePoints = new THREE.Points(coreGeo, coreMat);
    scene.add(corePoints);

    // Layer B: Main Body Flame Tongues (Bright Orange / Vermilion)
    const flameCount = 420;
    const flameGeo = new THREE.BufferGeometry();
    const flamePositions = new Float32Array(flameCount * 3);
    const flameVelocities = new Float32Array(flameCount * 3);
    const flameLife = new Float32Array(flameCount);
    const flameMaxLife = new Float32Array(flameCount);
    const flameSizes = new Float32Array(flameCount);

    for (let i = 0; i < flameCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.95;
      flamePositions[i * 3] = Math.cos(angle) * r;
      flamePositions[i * 3 + 1] = Math.random() * 1.0;
      flamePositions[i * 3 + 2] = Math.sin(angle) * r;

      flameVelocities[i * 3] = (Math.random() - 0.5) * 0.3;
      flameVelocities[i * 3 + 1] = 1.6 + Math.random() * 3.0;
      flameVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      flameLife[i] = Math.random();
      flameMaxLife[i] = 0.9 + Math.random() * 0.9;
      flameSizes[i] = 0.6 + Math.random() * 0.8;
    }
    flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePositions, 3));

    const flameTexture = createGlowTexture('rgba(255, 110, 20, 1)');
    const flameMat = new THREE.PointsMaterial({
      size: 0.9,
      map: flameTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xff5a15
    });
    const flamePoints = new THREE.Points(flameGeo, flameMat);
    scene.add(flamePoints);

    // Layer C: Hot Flying Embers & Firebrands (Crackling sparks rising and drifting downwind)
    const sparkCount = 260;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = new Float32Array(sparkCount * 3);
    const sparkLife = new Float32Array(sparkCount);
    const sparkMaxLife = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.6;
      sparkPositions[i * 3] = Math.cos(angle) * r;
      sparkPositions[i * 3 + 1] = 0.1 + Math.random() * 1.5;
      sparkPositions[i * 3 + 2] = Math.sin(angle) * r;

      sparkVelocities[i * 3] = (Math.random() - 0.5) * 0.6;
      sparkVelocities[i * 3 + 1] = 2.0 + Math.random() * 4.0;
      sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

      sparkLife[i] = Math.random();
      sparkMaxLife[i] = 1.4 + Math.random() * 1.6;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkTexture = createGlowTexture('rgba(255, 230, 140, 1)');
    const sparkMat = new THREE.PointsMaterial({
      size: 0.22,
      map: sparkTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffdc88
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    // Layer D: 3D Wind Vector Arrow (Dynamic 3D compass arrow showing direction)
    const arrowDir = new THREE.Vector3(1, 0, 0).normalize();
    const arrowOrigin = new THREE.Vector3(0, 0.05, 0);
    const windArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 2.2, 0xd97706, 0.45, 0.25);
    scene.add(windArrow);

    // 5. Mouse Drag Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationAngleY = 0;
    let rotationAngleX = 0.25;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rotationAngleY += deltaX * 0.008;
      rotationAngleX = Math.max(-0.1, Math.min(0.8, rotationAngleX + deltaY * 0.008));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const p = paramsRef.current;

      // Wind tilt angle calculation (tilt flame column downwind)
      const windTiltX = (p.windSpeed / 50) * 0.9;
      const flameHeightFactor = Math.max(0.6, p.flameLength / 3.0);

      // Light flicker
      fireLight.intensity = 3.0 + Math.sin(time * 18) * 0.8 + Math.cos(time * 26) * 0.5;
      coreLight.intensity = 3.5 + Math.sin(time * 22) * 0.6;

      // Update Wind Arrow
      const radWind = THREE.MathUtils.degToRad(p.windDir);
      windArrow.setDirection(new THREE.Vector3(Math.cos(radWind), 0, Math.sin(radWind)));
      windArrow.setLength(1.4 + (p.windSpeed / 60) * 1.5);

      // Animate Core Particles
      const cPos = coreGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < coreCount; i++) {
        coreLife[i] += delta;
        if (coreLife[i] > coreMaxLife[i]) {
          coreLife[i] = 0;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.45;
          cPos[i * 3] = Math.cos(a) * r;
          cPos[i * 3 + 1] = 0;
          cPos[i * 3 + 2] = Math.sin(a) * r;
        } else {
          // Turbulent rise + wind drift
          cPos[i * 3] += coreVelocities[i * 3] * delta + windTiltX * delta * 0.5;
          cPos[i * 3 + 1] += coreVelocities[i * 3 + 1] * delta * flameHeightFactor;
          cPos[i * 3 + 2] += coreVelocities[i * 3 + 2] * delta;
        }
      }
      coreGeo.attributes.position.needsUpdate = true;

      // Animate Main Flame Body
      const fPos = flameGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < flameCount; i++) {
        flameLife[i] += delta;
        if (flameLife[i] > flameMaxLife[i]) {
          flameLife[i] = 0;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.85;
          fPos[i * 3] = Math.cos(a) * r;
          fPos[i * 3 + 1] = 0;
          fPos[i * 3 + 2] = Math.sin(a) * r;
        } else {
          // Swirling vortex physics
          const swirl = Math.sin(time * 3 + fPos[i * 3 + 1] * 2) * 0.25;
          fPos[i * 3] += (flameVelocities[i * 3] + swirl) * delta + windTiltX * delta * 1.2;
          fPos[i * 3 + 1] += flameVelocities[i * 3 + 1] * delta * flameHeightFactor;
          fPos[i * 3 + 2] += flameVelocities[i * 3 + 2] * delta;
        }
      }
      flameGeo.attributes.position.needsUpdate = true;

      // Animate Sparks / Embers
      const sPos = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        sparkLife[i] += delta;
        if (sparkLife[i] > sparkMaxLife[i]) {
          sparkLife[i] = 0;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.5;
          sPos[i * 3] = Math.cos(a) * r;
          sPos[i * 3 + 1] = 0.2;
          sPos[i * 3 + 2] = Math.sin(a) * r;
        } else {
          // Floating ember aerodynamics
          const airNoise = Math.sin(time * 5 + i) * 0.3;
          sPos[i * 3] += (sparkVelocities[i * 3] + airNoise) * delta + windTiltX * delta * 1.8;
          sPos[i * 3 + 1] += sparkVelocities[i * 3 + 1] * delta * flameHeightFactor;
          sPos[i * 3 + 2] += sparkVelocities[i * 3 + 2] * delta;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // Orbit camera position
      if (p.isAutoRotate && !isDragging) {
        rotationAngleY += 0.003;
      }

      const dist = 9.5;
      camera.position.x = Math.sin(rotationAngleY) * Math.cos(rotationAngleX) * dist;
      camera.position.y = Math.sin(rotationAngleX) * dist + 1.8;
      camera.position.z = Math.cos(rotationAngleY) * Math.cos(rotationAngleX) * dist;
      camera.lookAt(0, 1.8, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#11161D] to-[#070809] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-4 sm:p-6 overflow-hidden">
      {/* Top Banner: Fire Behavior Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#F5F0E6]">
                3D Convective Flame & Heat Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#D85B35]/20 text-[#F5F0E6] text-[10px] font-mono-tech font-bold uppercase tracking-wider border border-[#D85B35]/40">
                REAL-TIME THREE.JS
              </span>
            </div>
            <p className="text-xs text-[#D1CBC0] mt-0.5">
              Thermodynamic flame column modeling: Byram fireline intensity, convective ember lift & wind deflection
            </p>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono-tech text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-center">
            <span className="text-[10px] text-orange-600 block uppercase">FLAME LENGTH</span>
            <span className="font-bold text-orange-950 text-sm">{flameLength.toFixed(1)} m</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <span className="text-[10px] text-amber-700 block uppercase">BYRAM INTENSITY</span>
            <span className="font-bold text-amber-950 text-sm">{firelineIntensity.toLocaleString()} kW/m</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-center">
            <span className="text-[10px] text-red-700 block uppercase">MAX SPOTTING</span>
            <span className="font-bold text-red-950 text-sm">{maxSpottingDistKm} km</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas Viewport + Live Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D WebGL Canvas */}
        <div className="lg:col-span-8 relative h-[360px] sm:h-[420px] rounded-xl bg-gradient-to-b from-[#050505] to-[#0D1117] border border-white/[0.08] shadow-inner overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
          {/* Mount point for Three.js */}
          <div ref={mountRef} className="w-full h-full" />

          {/* Canvas Floating Guidance Badge */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-[#11161D]/90 backdrop-blur-sm border border-white/[0.08] text-[11px] font-mono-tech text-[#F5F0E6] shadow-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <span>DRAG TO ORBIT 360° &bull; WATCH FLAME TILT</span>
          </div>

          {/* Toggle Auto-Rotation */}
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#11161D]/90 hover:bg-[#171D24] border border-white/[0.08] text-xs font-mono-tech text-[#F5F0E6] transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            <span>{isAutoRotate ? 'AUTO-ORBIT: ON' : 'AUTO-ORBIT: PAUSED'}</span>
          </button>
        </div>

        {/* Tactical Parameters Control Sidebar */}
        <div className="lg:col-span-4 space-y-4 font-ui">
          <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-orange-800 tracking-wider">
            <Sliders className="h-4 w-4 text-orange-600" />
            <span>LIVE FIRE ENVIRONMENT CONTROLS</span>
          </div>

          {/* Wind Speed Slider */}
          <div className="p-3 rounded-xl bg-[#171D24] border border-white/[0.08] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="text-[#D1CBC0] flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-[#D85B35]" />
                10M SURFACE WIND
              </span>
              <span className="font-bold text-[#F5F0E6]">{windSpeed} KM/H</span>
            </div>
            <input
              type="range"
              min="0"
              max="65"
              step="1"
              value={windSpeed}
              onChange={(e) => setWindSpeed(+e.target.value)}
              className="w-full accent-[#D85B35] cursor-pointer h-1.5 bg-[#11161D] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono-tech text-[#858078]">
              <span>Calm (0)</span>
              <span>Moderate (30)</span>
              <span>Gale (65 km/h)</span>
            </div>
          </div>

          {/* Fuel Load Slider */}
          <div className="p-3 rounded-xl bg-[#171D24] border border-white/[0.08] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="text-[#D1CBC0] flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-[#C6A15B]" />
                AVAILABLE FUEL LOAD
              </span>
              <span className="font-bold text-[#F5F0E6]">{fuelLoad.toFixed(1)} KG/M²</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="6.0"
              step="0.2"
              value={fuelLoad}
              onChange={(e) => setFuelLoad(+e.target.value)}
              className="w-full accent-[#C6A15B] cursor-pointer h-1.5 bg-[#11161D] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono-tech text-[#858078]">
              <span>Grass (1.0)</span>
              <span>Chaparral (3.2)</span>
              <span>Heavy Timber (6.0)</span>
            </div>
          </div>

          {/* Dead Fuel Moisture Deficit */}
          <div className="p-3 rounded-xl bg-[#171D24] border border-white/[0.08] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="text-[#D1CBC0] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#B6402F]" />
                FINE FUEL MOISTURE (1-HR)
              </span>
              <span className={`font-bold ${fuelMoisture < 8 ? 'text-[#B6402F]' : 'text-[#F5F0E6]'}`}>
                {fuelMoisture.toFixed(1)}% {fuelMoisture < 8 && '⚠ CRITICAL DRY'}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="0.5"
              value={fuelMoisture}
              onChange={(e) => setFuelMoisture(+e.target.value)}
              className="w-full accent-[#B6402F] cursor-pointer h-1.5 bg-[#11161D] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono-tech text-[#858078]">
              <span>Extreme (3%)</span>
              <span>Red Flag (8%)</span>
              <span>Moist (20%)</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono-tech text-xs">
            <button
              onClick={() => {
                setWindSpeed(45);
                setFuelMoisture(5.0);
                setFuelLoad(4.8);
              }}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-center transition cursor-pointer shadow-sm shadow-red-500/20"
            >
              🔥 CROWN FIRE RUN
            </button>
            <button
              onClick={() => {
                setWindSpeed(12);
                setFuelMoisture(14.0);
                setFuelLoad(1.8);
              }}
              className="px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-center transition cursor-pointer"
            >
              🌿 GROUND CREEP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
