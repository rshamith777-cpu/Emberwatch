import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FireCluster, FireObservation } from '../../types/emberwatch.js';

interface EarthGlobe3DProps {
  scrollProgress: number; // 0.00 to 1.00
  clusters: FireCluster[];
  hotspots: FireObservation[];
  selectedCluster: FireCluster | null;
  onSelectCluster?: (c: FireCluster) => void;
}

// Convert geographic lat/lon to 3D Cartesian coordinates on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({
  scrollProgress,
  clusters,
  hotspots,
  selectedCluster
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 12.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // 2. Lighting: Soft Royal Gold key + warm ember rim + restrained neutral fill (Section 33)
    const sunLight = new THREE.DirectionalLight(0xf5e6c8, 2.2);
    sunLight.position.set(16, 9, 12);
    scene.add(sunLight);

    const goldRimLight = new THREE.DirectionalLight(0xd8b86a, 1.4);
    goldRimLight.position.set(-16, -3, -12);
    scene.add(goldRimLight);

    const ambientLight = new THREE.AmbientLight(0x1a212d, 1.1);
    scene.add(ambientLight);

    // 3. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 3.8;

    // 3A. Premium Obsidian Earth Texture (Section 27: Dark, Cinematic, Minimal, Realistic)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 2048;
    earthCanvas.height = 1024;
    const eCtx = earthCanvas.getContext('2d');
    if (eCtx) {
      // Deep obsidian ocean base
      const oceanGrad = eCtx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#040608');
      oceanGrad.addColorStop(0.5, '#070b10');
      oceanGrad.addColorStop(1, '#040608');
      eCtx.fillStyle = oceanGrad;
      eCtx.fillRect(0, 0, 2048, 1024);

      // Deep obsidian continents with subtle elevation contrast
      eCtx.fillStyle = '#111720';
      // North America & California
      eCtx.beginPath();
      eCtx.ellipse(460, 310, 270, 190, 0.18, 0, Math.PI * 2);
      eCtx.fill();
      // South America
      eCtx.beginPath();
      eCtx.ellipse(660, 690, 160, 250, -0.22, 0, Math.PI * 2);
      eCtx.fill();
      // Eurasia
      eCtx.beginPath();
      eCtx.ellipse(1360, 290, 380, 170, 0.05, 0, Math.PI * 2);
      eCtx.fill();
      // Africa
      eCtx.beginPath();
      eCtx.ellipse(1240, 530, 190, 230, 0, 0, Math.PI * 2);
      eCtx.fill();
      // Australia
      eCtx.beginPath();
      eCtx.ellipse(1710, 730, 130, 95, 0, 0, Math.PI * 2);
      eCtx.fill();

      // Delicate gold coastline & terrain contour tracer
      eCtx.strokeStyle = 'rgba(198, 161, 91, 0.16)';
      eCtx.lineWidth = 1.2;
      for (let y = 120; y < 960; y += 70) {
        eCtx.beginPath();
        eCtx.moveTo(0, y);
        for (let x = 0; x <= 2048; x += 80) {
          eCtx.lineTo(x, y + Math.sin(x * 0.025) * 8);
        }
        eCtx.stroke();
      }

      // Micro settlement radiance clusters (night lights)
      eCtx.fillStyle = 'rgba(230, 209, 154, 0.35)';
      const seedPoints = [
        [430, 320], [450, 335], [420, 290], [480, 310], [510, 330],
        [640, 640], [670, 720], [1280, 270], [1320, 260], [1360, 310],
        [1690, 720], [1740, 740]
      ];
      seedPoints.forEach(([px, py]) => {
        for (let j = 0; j < 12; j++) {
          const rx = px + (Math.random() - 0.5) * 35;
          const ry = py + (Math.random() - 0.5) * 25;
          eCtx.fillRect(rx, ry, 1.5, 1.5);
        }
      });
    }

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.85,
      metalness: 0.25,
      color: 0xffffff
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 3B. Subtle Cloud Sphere (Soft atmospheric depth, Section 31)
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cCtx = cloudCanvas.getContext('2d');
    if (cCtx) {
      cCtx.clearRect(0, 0, 1024, 512);
      cCtx.fillStyle = 'rgba(245, 240, 230, 0.04)';
      for (let i = 0; i < 40; i++) {
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const cr = Math.random() * 80 + 30;
        cCtx.beginPath();
        cCtx.arc(cx, cy, cr, 0, Math.PI * 2);
        cCtx.fill();
      }
    }
    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    cloudTexture.wrapS = THREE.RepeatWrapping;
    const cloudGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 48, 48);
    const cloudMat = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // 3C. Gold Atmospheric Rim Glow Shell (Section 27 & 31)
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.032, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          // Royal Gold atmospheric rim
          gl_FragColor = vec4(0.85, 0.72, 0.41, intensity * 0.72);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 3D. Precision Coordinate Lat/Lon Rings (Section 5)
    const gridMat = new THREE.LineBasicMaterial({
      color: 0xc6a15b,
      transparent: true,
      opacity: 0.12
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const radiusAtLat = GLOBE_RADIUS * 1.002 * Math.cos((lat * Math.PI) / 180);
      const yAtLat = GLOBE_RADIUS * 1.002 * Math.sin((lat * Math.PI) / 180);
      const circleGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radiusAtLat, yAtLat, Math.sin(theta) * radiusAtLat));
      }
      circleGeo.setFromPoints(points);
      const circleLine = new THREE.Line(circleGeo, gridMat);
      globeGroup.add(circleLine);
    }

    // 4. Hotspots directly from NASA FIRMS mapped to 3D Sphere (Section 28 & 29)
    const hotspotGroup = new THREE.Group();
    globeGroup.add(hotspotGroup);

    const hotspotMeshes: { mesh: THREE.Mesh; halo: THREE.Mesh; lat: number; lon: number; baseScale: number }[] = [];
    const effectiveHotspots = hotspots.length > 0 ? hotspots : (clusters[0]?.hotspots || []);

    effectiveHotspots.forEach((h) => {
      const pos = latLonToVector3(h.latitude, h.longitude, GLOBE_RADIUS * 1.008);
      const normal = pos.clone().normalize();

      // Size scaled by Fire Radiative Power (FRP)
      const frpScale = Math.min(0.065, Math.max(0.02, (h.frp || 40) / 1800));

      // Core thermal point (White-hot core)
      const coreGeo = new THREE.SphereGeometry(frpScale, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: h.frp > 150 ? 0xfff0e0 : 0xf0783c,
        toneMapped: false
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pos);
      hotspotGroup.add(coreMesh);

      // Pulsing thermal ember halo disk (Section 29)
      const haloGeo = new THREE.RingGeometry(frpScale * 1.2, frpScale * 3.0, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xb6402f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.005)));
      haloMesh.lookAt(pos.clone().add(normal));
      hotspotGroup.add(haloMesh);

      hotspotMeshes.push({ mesh: coreMesh, halo: haloMesh, lat: h.latitude, lon: h.longitude, baseScale: frpScale });
    });

    // 5. Cluster Centroid Beacons & Threat Buffer Rings
    const clusterGroup = new THREE.Group();
    globeGroup.add(clusterGroup);

    const clusterRingMeshes: { ring: THREE.Mesh; beam: THREE.Line; baseRadius: number }[] = [];

    clusters.forEach((c) => {
      const pos = latLonToVector3(c.center_lat, c.center_lon, GLOBE_RADIUS * 1.01);
      const normal = pos.clone().normalize();

      // Cluster centroid beacon line
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        pos,
        pos.clone().add(normal.clone().multiplyScalar(0.75))
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: c.risk_score >= 85 ? 0xc84b38 : 0xc6a15b,
        transparent: true,
        opacity: 0.85
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      clusterGroup.add(beam);

      // Buffer concentric rings in royal gold
      [0.08, 0.16, 0.28].forEach((r) => {
        const ringGeo = new THREE.RingGeometry(r - 0.006, r, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xc6a15b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.008)));
        ring.lookAt(pos.clone().add(normal));
        clusterGroup.add(ring);
        clusterRingMeshes.push({ ring, beam, baseRadius: r });
      });
    });

    // 6. Satellite & Orbit Track (Section 30)
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const ORBIT_RADIUS = GLOBE_RADIUS * 1.55;
    const orbitCurve = new THREE.EllipseCurve(0, 0, ORBIT_RADIUS, ORBIT_RADIUS * 0.92, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitLine = new THREE.Line(
      orbitGeo,
      new THREE.LineBasicMaterial({ color: 0xc6a15b, transparent: true, opacity: 0.35 })
    );
    orbitLine.rotation.x = Math.PI * 0.28;
    orbitLine.rotation.z = Math.PI * 0.14;
    orbitGroup.add(orbitLine);

    // Minimalist Satellite Model
    const satGroup = new THREE.Group();
    const satBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf5f0e6, metalness: 0.85, roughness: 0.2 })
    );
    const satPanels = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.015, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0d1117, metalness: 0.9, roughness: 0.1 })
    );
    satGroup.add(satBody);
    satGroup.add(satPanels);
    orbitGroup.add(satGroup);

    // Subtle Restrained Particles (Section 32)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = GLOBE_RADIUS * (1.1 + Math.random() * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc6a15b,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Initial orientation focused on California Sierra Corridor
    globeGroup.rotation.y = -Math.PI * 0.35;
    globeGroup.rotation.x = 0.25;

    // 8. Render & Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const sp = scrollRef.current;

      // Globe rotation dynamics with scroll response
      if (sp < 0.25) {
        globeGroup.rotation.y += delta * 0.035;
      } else {
        const targetRotY = -Math.PI * 0.45;
        const targetRotX = 0.35;
        globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.06;
        globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.06;
      }

      // Cloud sphere slow drift
      cloudMesh.rotation.y += delta * 0.015;

      // Restrained particles slow orbit
      particles.rotation.y += delta * 0.02;

      // Satellite orbital traversal
      const satAngle = elapsed * 0.32;
      satGroup.position.x = Math.cos(satAngle) * ORBIT_RADIUS;
      satGroup.position.z = Math.sin(satAngle) * (ORBIT_RADIUS * 0.92);
      satGroup.position.y = Math.sin(satAngle * 1.4) * 0.7;
      satGroup.lookAt(0, 0, 0);

      // Camera dolly zoom according to scroll progress (Section 35 & 40)
      const targetCamZ = 12.5 - sp * 4.5;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      // Pulse hotspot thermal halos
      hotspotMeshes.forEach((h, i) => {
        const pulse = 1 + Math.sin(elapsed * 4 + i * 0.8) * 0.35;
        h.halo.scale.set(pulse, pulse, 1);
        (h.halo.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(elapsed * 4 + i) * 0.3;
      });

      // Pulse cluster buffer rings
      clusterRingMeshes.forEach((c, idx) => {
        const factor = 1 + Math.sin(elapsed * 2 + idx * 0.5) * 0.08;
        c.ring.scale.set(factor, factor, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [clusters, hotspots]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full select-none"
    />
  );
};
