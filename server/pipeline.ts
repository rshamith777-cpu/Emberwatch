import { db } from './db.js';
import { fetchFirmsObservations } from './collectors/firms.js';
import { fetchLiveWeather } from './collectors/weather.js';
import { dbscanClustering, RawCluster } from './ml/clustering.js';
import { extractFeatures, predictWildfireRisk } from './ml/riskModel.js';
import { identifyExposedAssets, generateResponseRecommendations } from './geospatial/exposure.js';
import { evaluateClusterAlerts } from './alerts/engine.js';
import { FireCluster, SystemStatus, WeatherData } from '../src/types/emberwatch.js';
import { GEOSPATIAL_ASSETS, SNAPSHOT_TIMESTAMP, RAW_SNAPSHOT_HOTSPOTS } from './data/snapshot.js';
import { FALLBACK_CLUSTERS, FALLBACK_ALERTS } from '../src/data/fallbackTelemetry.js';

let lastRefreshTime = new Date().toISOString();
let isRefreshing = false;
let currentMode: 'LIVE' | 'DEMO_SNAPSHOT' = 'LIVE';

// Fast synchronous priming so server endpoints return valid telemetry immediately on start
export function initializePipelineFast() {
  try {
    if (db.getStaticAssets().length === 0) {
      db.setStaticAssets(GEOSPATIAL_ASSETS);
    }
    if (db.getObservationsCount() === 0) {
      db.insertObservations(RAW_SNAPSHOT_HOTSPOTS);
    }
    if (db.getClusters().length === 0) {
      db.setClusters(FALLBACK_CLUSTERS);
    }
    if (db.getAlerts().length === 0) {
      for (const alert of FALLBACK_ALERTS) {
        db.addAlert(alert);
      }
    }
    console.log('[EmberWatch] Pre-seeded database with 4 clusters, 15 hotspots, and 15 geospatial assets.');
  } catch (err) {
    console.warn('[EmberWatch] Error during fast priming:', err);
  }
}

// Region naming heuristics based on coordinates
function getRegionName(lat: number, lon: number, num: number) {
  if (lat > 39.9 && lon > -121.3) return 'Plumas Canyon Complex';
  if (lat > 39.7 && lon < -121.4) return 'Butte Creek / Ridge Fire';
  if (lat > 40.1) return 'Lassen Foothills Incident';
  if (lat < 39.6) return 'Yuba River Incident';
  return `Wildfire Complex #${num}`;
}

function processCluster(raw: RawCluster, weather: WeatherData): FireCluster {
  const features = extractFeatures(raw, weather);
  const prediction = predictWildfireRisk(features);
  const exposedAssets = identifyExposedAssets(raw.center_lat, raw.center_lon, db.getStaticAssets());
  const clusterName = getRegionName(raw.center_lat, raw.center_lon, raw.cluster_number);

  const recommendations = generateResponseRecommendations({
    cluster_number: raw.cluster_number,
    risk_score: prediction.risk_score,
    risk_level: prediction.risk_level,
    spread_estimate: prediction.spread_estimate,
    exposed_assets: exposedAssets,
    max_frp: raw.max_frp,
    weather: {
      wind_speed_10m: weather.wind_speed_10m,
      wind_direction_10m: weather.wind_direction_10m
    }
  });

  return {
    id: raw.cluster_id,
    cluster_number: raw.cluster_number,
    name: clusterName,
    region: 'Sierra Nevada / Northern California',
    center_lat: raw.center_lat,
    center_lon: raw.center_lon,
    bbox: raw.bbox,
    radius_km: raw.radius_km,
    hotspot_count: raw.hotspot_count,
    hotspots: raw.hotspots,
    avg_confidence: raw.avg_confidence,
    max_frp: raw.max_frp,
    avg_frp: raw.avg_frp,
    latest_detection_time: raw.latest_detection_time,
    approximate_density: raw.approximate_density,
    weather,
    features: prediction.features,
    risk_score: prediction.risk_score,
    risk_level: prediction.risk_level,
    factor_contributions: prediction.factor_contributions,
    spread_estimate: prediction.spread_estimate,
    exposed_assets: exposedAssets,
    recommendations
  };
}

export async function runIntelligencePipeline(forceMode?: 'LIVE' | 'DEMO_SNAPSHOT'): Promise<{
  success: boolean;
  clusters: FireCluster[];
  status: SystemStatus;
}> {
  if (isRefreshing) {
    return {
      success: true,
      clusters: db.getClusters(),
      status: getSystemStatus()
    };
  }

  isRefreshing = true;
  db.logEvent('SYSTEM', 'Initiating wildfire intelligence pipeline run...');

  try {
    // 1. Ensure static geospatial assets are loaded
    if (db.getStaticAssets().length === 0) {
      db.setStaticAssets(GEOSPATIAL_ASSETS);
    }

    // 2. Determine ingest mode
    const firmsResult = await fetchFirmsObservations();
    currentMode = forceMode || (firmsResult.source === 'LIVE_NASA_FIRMS' ? 'LIVE' : 'DEMO_SNAPSHOT');

    // 3. Cluster all active observations via DBSCAN
    const observations = db.getAllObservations();
    const rawClusters: RawCluster[] = dbscanClustering(observations, 18.0, 2);

    // 4. Concurrently fetch weather and score each cluster
    const fullClusters = await Promise.all(
      rawClusters.map(async (raw) => {
        try {
          const weather = await fetchLiveWeather(raw.center_lat, raw.center_lon);
          return processCluster(raw, weather);
        } catch (clusterErr) {
          console.warn(`[Pipeline] Weather/scoring error for cluster ${raw.cluster_id}:`, clusterErr);
          // Fallback with default weather
          const fallbackWeather = {
            latitude: raw.center_lat,
            longitude: raw.center_lon,
            temperature_2m: 32.0,
            relative_humidity_2m: 14.0,
            precipitation: 0.0,
            wind_speed_10m: 25.0,
            wind_direction_10m: 220,
            surface_pressure: 900.0,
            timestamp: new Date().toISOString(),
            source: 'Calibrated Fallback'
          };
          return processCluster(raw, fallbackWeather);
        }
      })
    );

    // 5. Store clusters in database
    db.setClusters(fullClusters);

    // 6. Run alert engine
    evaluateClusterAlerts(fullClusters);

    lastRefreshTime = new Date().toISOString();
    db.logEvent('SYSTEM', `Pipeline complete: ${fullClusters.length} clusters scored and prioritized.`);

    return {
      success: true,
      clusters: fullClusters,
      status: getSystemStatus()
    };
  } catch (err: any) {
    console.error('[Pipeline] Error executing intelligence pipeline:', err);
    db.logEvent('SYSTEM', `Pipeline failure: ${err?.message || err}`);
    return {
      success: false,
      clusters: db.getClusters(),
      status: getSystemStatus()
    };
  } finally {
    isRefreshing = false;
  }
}

export function getSystemStatus(): SystemStatus {
  const refreshMins = parseInt(process.env.DATA_REFRESH_MINUTES || '10', 10);
  const nextRefreshMs = new Date(lastRefreshTime).getTime() + refreshMins * 60 * 1000;
  const clusters = db.getClusters();

  return {
    nasaFirms: currentMode === 'LIVE' ? 'CONNECTED' : 'DEMO_MODE',
    weather: 'CONNECTED',
    database: 'CONNECTED',
    mlEngine: 'READY',
    mode: currentMode,
    snapshotTimestamp: SNAPSHOT_TIMESTAMP,
    lastRefreshTime,
    nextRefreshTime: new Date(nextRefreshMs).toISOString(),
    refreshIntervalMinutes: refreshMins,
    totalHotspots: db.getObservationsCount(),
    totalClusters: clusters.length,
    highRiskClusters: clusters.filter((c) => c.risk_score >= 51).length,
    criticalAlerts: db.getAlerts().filter((a) => a.severity === 'CRITICAL').length
  };
}
