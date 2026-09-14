import { FireObservation } from '../../src/types/emberwatch.js';

export interface RawCluster {
  cluster_id: string;
  cluster_number: number;
  center_lat: number;
  center_lon: number;
  bbox: [number, number, number, number];
  radius_km: number;
  hotspots: FireObservation[];
  hotspot_count: number;
  avg_confidence: number;
  max_frp: number;
  avg_frp: number;
  latest_detection_time: string;
  approximate_density: number; // count per 100 km²
}

// Great-circle distance calculation via Haversine formula
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Density-Based Spatial Clustering of Applications with Noise (DBSCAN)
 * Adapted specifically for geographic coordinates with haversine distance.
 */
export function dbscanClustering(
  observations: FireObservation[],
  epsKm: number = 18.0,
  minSamples: number = 2
): RawCluster[] {
  if (observations.length === 0) return [];

  const n = observations.length;
  const visited = new Array(n).fill(false);
  const clusterAssignments = new Array(n).fill(-1); // -1 = noise/unassigned
  let clusterIdCounter = 0;

  // Compute neighbor list for each point
  const regionQuery = (pointIdx: number): number[] => {
    const neighbors: number[] = [];
    const p1 = observations[pointIdx];
    for (let j = 0; j < n; j++) {
      const p2 = observations[j];
      const dist = haversineDistanceKm(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
      if (dist <= epsKm) {
        neighbors.push(j);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = regionQuery(i);

    if (neighbors.length < minSamples) {
      // Noise or solitary hotspot (still trackable if significant FRP)
      clusterAssignments[i] = -1;
    } else {
      // Start a new cluster
      const currentCluster = clusterIdCounter++;
      clusterAssignments[i] = currentCluster;

      const queue = [...neighbors];
      let qIdx = 0;

      while (qIdx < queue.length) {
        const neighborIdx = queue[qIdx++];
        if (!visited[neighborIdx]) {
          visited[neighborIdx] = true;
          const subNeighbors = regionQuery(neighborIdx);
          if (subNeighbors.length >= minSamples) {
            for (const sn of subNeighbors) {
              if (!queue.includes(sn)) {
                queue.push(sn);
              }
            }
          }
        }
        if (clusterAssignments[neighborIdx] === -1) {
          clusterAssignments[neighborIdx] = currentCluster;
        }
      }
    }
  }

  // Handle high-energy solitary hotspots as single-point clusters so they aren't ignored
  for (let i = 0; i < n; i++) {
    if (clusterAssignments[i] === -1 && observations[i].frp > 35.0) {
      clusterAssignments[i] = clusterIdCounter++;
    }
  }

  // Aggregate clustered observations
  const clusterMap = new Map<number, FireObservation[]>();
  for (let i = 0; i < n; i++) {
    const cId = clusterAssignments[i];
    if (cId !== -1) {
      if (!clusterMap.has(cId)) {
        clusterMap.set(cId, []);
      }
      clusterMap.get(cId)!.push(observations[i]);
    }
  }

  const clusters: RawCluster[] = [];

  let num = 1;
  for (const [_, hotspots] of clusterMap.entries()) {
    let sumLat = 0;
    let sumLon = 0;
    let sumConf = 0;
    let sumFrp = 0;
    let maxFrp = 0;
    let minLat = 90;
    let maxLat = -90;
    let minLon = 180;
    let maxLon = -180;
    let latestTime = '';

    for (const h of hotspots) {
      sumLat += h.latitude;
      sumLon += h.longitude;
      sumConf += h.confidence;
      sumFrp += h.frp;
      if (h.frp > maxFrp) maxFrp = h.frp;

      if (h.latitude < minLat) minLat = h.latitude;
      if (h.latitude > maxLat) maxLat = h.latitude;
      if (h.longitude < minLon) minLon = h.longitude;
      if (h.longitude > maxLon) maxLon = h.longitude;

      if (!latestTime || h.timestamp > latestTime) {
        latestTime = h.timestamp;
      }
    }

    const centerLat = sumLat / hotspots.length;
    const centerLon = sumLon / hotspots.length;

    // Calculate maximum radius from center to any hotspot in cluster
    let maxRadiusKm = 1.5;
    for (const h of hotspots) {
      const d = haversineDistanceKm(centerLat, centerLon, h.latitude, h.longitude);
      if (d > maxRadiusKm) maxRadiusKm = d;
    }

    // Approximate area (circle with maxRadiusKm or 10 km²)
    const areaSqKm = Math.max(10, Math.PI * Math.pow(maxRadiusKm, 2));
    const densityPer100Km2 = (hotspots.length / areaSqKm) * 100;

    clusters.push({
      cluster_id: `CLUSTER-${num.toString().padStart(3, '0')}`,
      cluster_number: num,
      center_lat: centerLat,
      center_lon: centerLon,
      bbox: [minLat, minLon, maxLat, maxLon],
      radius_km: parseFloat(maxRadiusKm.toFixed(2)),
      hotspots,
      hotspot_count: hotspots.length,
      avg_confidence: parseFloat((sumConf / hotspots.length).toFixed(1)),
      max_frp: parseFloat(maxFrp.toFixed(1)),
      avg_frp: parseFloat((sumFrp / hotspots.length).toFixed(1)),
      latest_detection_time: latestTime,
      approximate_density: parseFloat(densityPer100Km2.toFixed(2))
    });

    num++;
  }

  return clusters;
}
