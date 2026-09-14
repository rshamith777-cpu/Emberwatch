import { FireCluster, EmberAlert, SystemStatus } from '../types/emberwatch.js';
import { RAW_SNAPSHOT_HOTSPOTS, SNAPSHOT_TIMESTAMP, GEOSPATIAL_ASSETS, SNAPSHOT_WEATHER } from '../../server/data/snapshot.js';

export { RAW_SNAPSHOT_HOTSPOTS, SNAPSHOT_TIMESTAMP, GEOSPATIAL_ASSETS, SNAPSHOT_WEATHER };

export const FALLBACK_STATUS: SystemStatus = {
  nasaFirms: 'DEMO_MODE',
  weather: 'CONNECTED',
  database: 'CONNECTED',
  mlEngine: 'READY',
  mode: 'DEMO_SNAPSHOT',
  snapshotTimestamp: SNAPSHOT_TIMESTAMP,
  lastRefreshTime: new Date().toISOString(),
  nextRefreshTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  refreshIntervalMinutes: 10,
  totalHotspots: 15,
  totalClusters: 4,
  highRiskClusters: 3,
  criticalAlerts: 1
};

export const FALLBACK_CLUSTERS: FireCluster[] = [
  {
    id: 'CLUSTER-1',
    cluster_number: 1,
    name: 'Plumas Canyon Complex',
    region: 'Sierra Nevada / Northern California',
    center_lat: 39.984,
    center_lon: -121.144,
    bbox: [39.958, -121.182, 40.015, -121.108],
    radius_km: 7.8,
    hotspot_count: 7,
    hotspots: RAW_SNAPSHOT_HOTSPOTS.slice(0, 7),
    avg_confidence: 91.8,
    max_frp: 418.5,
    avg_frp: 269.8,
    latest_detection_time: '2026-09-11T18:15:00.000Z',
    approximate_density: 36.6,
    weather: {
      latitude: 39.98,
      longitude: -121.14,
      temperature_2m: 34.8,
      relative_humidity_2m: 11.2,
      precipitation: 0.0,
      wind_speed_10m: 32.4,
      wind_direction_10m: 220,
      surface_pressure: 895.4,
      timestamp: '2026-09-11T18:15:00.000Z',
      source: 'Open-Meteo'
    },
    features: {
      hotspot_count: 7,
      max_frp: 418.5,
      avg_frp: 269.8,
      hotspot_density: 36.6,
      temperature_2m: 34.8,
      relative_humidity_2m: 11.2,
      wind_speed_10m: 32.4,
      wind_direction_10m: 220,
      precipitation: 0.0,
      surface_pressure: 895.4,
      fine_fuel_moisture_index: 8.8,
      wind_cluster_spread_alignment: 0.94
    },
    risk_score: 92.4,
    risk_level: 'CRITICAL',
    factor_contributions: [
      {
        feature: 'relative_humidity_2m',
        displayName: 'Extreme Humidity Deficit',
        value: '11.2% RH',
        impactScore: 27.6,
        importance: 'CRITICAL',
        direction: 'INCREASES_RISK',
        explanation: 'Relative humidity of 11.2% drops fine dead fuel moisture into explosive ignition ranges.'
      },
      {
        feature: 'wind_speed_10m',
        displayName: 'Canyon Wind Velocity',
        value: '32.4 km/h',
        impactScore: 24.3,
        importance: 'CRITICAL',
        direction: 'INCREASES_RISK',
        explanation: '32.4 km/h gusts funneling through canyon topography amplify flame spread and spotting.'
      },
      {
        feature: 'max_frp',
        displayName: 'Peak Thermal Combustion (FRP)',
        value: '418.5 MW',
        impactScore: 20.8,
        importance: 'HIGH',
        direction: 'INCREASES_RISK',
        explanation: 'Extreme fire radiative power (418.5 MW) signifies high-intensity crown fire behavior.'
      },
      {
        feature: 'hotspot_density',
        displayName: 'Consolidated Fire Front',
        value: '36.6 / 100km²',
        impactScore: 12.5,
        importance: 'HIGH',
        direction: 'INCREASES_RISK',
        explanation: 'High spatial density demonstrates a unified advancing perimeter.'
      }
    ],
    spread_estimate: {
      likelyThreatDirection: 'NORTHEAST (40°)',
      headingDegrees: 40,
      spreadRisk: 'EXTREME',
      confidence: 88,
      forwardVelocityKmh: '3.8 - 5.2 km/h',
      estimatedConeAngle: 45,
      disclaimer: 'Based on prevailing surface wind vectors and fuel moisture proxies.'
    },
    exposed_assets: [
      GEOSPATIAL_ASSETS[0], // Quincy
      GEOSPATIAL_ASSETS[5], // Plumas District Hospital
      GEOSPATIAL_ASSETS[7], // Quincy High School
      GEOSPATIAL_ASSETS[9], // CA Route 70
      GEOSPATIAL_ASSETS[11] // Caribou 230kV
    ],
    recommendations: [
      'Trigger Red Flag Evacuation Warning for Quincy and adjacent canyon corridor settlements.',
      'Deploy Type 1 heavy structural defense strike teams along California State Route 70.',
      'Establish bulldozer anchor lines on northeastern ridge crest to exploit terrain breaks.'
    ]
  },
  {
    id: 'CLUSTER-2',
    cluster_number: 2,
    name: 'Butte Creek / Ridge Fire',
    region: 'Sierra Nevada / Northern California',
    center_lat: 39.818,
    center_lon: -121.578,
    bbox: [39.805, -121.595, 39.832, -121.561],
    radius_km: 4.2,
    hotspot_count: 4,
    hotspots: RAW_SNAPSHOT_HOTSPOTS.slice(7, 11),
    avg_confidence: 87.0,
    max_frp: 198.2,
    avg_frp: 150.2,
    latest_detection_time: '2026-09-11T18:15:00.000Z',
    approximate_density: 72.1,
    weather: {
      latitude: 39.81,
      longitude: -121.57,
      temperature_2m: 33.2,
      relative_humidity_2m: 14.5,
      precipitation: 0.0,
      wind_speed_10m: 24.8,
      wind_direction_10m: 215,
      surface_pressure: 920.1,
      timestamp: '2026-09-11T18:15:00.000Z',
      source: 'Open-Meteo'
    },
    features: {
      hotspot_count: 4,
      max_frp: 198.2,
      avg_frp: 150.2,
      hotspot_density: 72.1,
      temperature_2m: 33.2,
      relative_humidity_2m: 14.5,
      wind_speed_10m: 24.8,
      wind_direction_10m: 215,
      precipitation: 0.0,
      surface_pressure: 920.1,
      fine_fuel_moisture_index: 9.8,
      wind_cluster_spread_alignment: 0.88
    },
    risk_score: 78.6,
    risk_level: 'CRITICAL',
    factor_contributions: [
      {
        feature: 'relative_humidity_2m',
        displayName: 'Low Humidity Deficit',
        value: '14.5% RH',
        impactScore: 22.8,
        importance: 'CRITICAL',
        direction: 'INCREASES_RISK',
        explanation: 'Relative humidity of 14.5% maintains high flammability across dry pine needle litter.'
      },
      {
        feature: 'wind_speed_10m',
        displayName: 'Ridge Wind Speeds',
        value: '24.8 km/h',
        impactScore: 21.0,
        importance: 'CRITICAL',
        direction: 'INCREASES_RISK',
        explanation: '24.8 km/h wind pushing northeast threatens wildland-urban interface perimeters.'
      },
      {
        feature: 'hotspot_density',
        displayName: 'High Cluster Density',
        value: '72.1 / 100km²',
        impactScore: 18.2,
        importance: 'HIGH',
        direction: 'INCREASES_RISK',
        explanation: 'Dense grouping indicates active localized flare-ups on steep slopes.'
      }
    ],
    spread_estimate: {
      likelyThreatDirection: 'NORTHEAST (35°)',
      headingDegrees: 35,
      spreadRisk: 'EXTREME',
      confidence: 84,
      forwardVelocityKmh: '2.5 - 3.8 km/h',
      estimatedConeAngle: 40,
      disclaimer: 'Calculated using terrain canyon slope and wind heading.'
    },
    exposed_assets: [
      GEOSPATIAL_ASSETS[2], // Paradise / Magalia
      GEOSPATIAL_ASSETS[6], // Feather River Health Center
      GEOSPATIAL_ASSETS[8], // Pine Ridge Elementary
      GEOSPATIAL_ASSETS[10] // Skyway / Route 191
    ],
    recommendations: [
      'Issue Evacuation Order for Zone B-4 (Skyway / Magalia Ridge boundary).',
      'Pre-position water tenders at Pine Ridge Elementary campus for structural defense triage.'
    ]
  },
  {
    id: 'CLUSTER-3',
    cluster_number: 3,
    name: 'Lassen Foothills Incident',
    region: 'Sierra Nevada / Northern California',
    center_lat: 40.219,
    center_lon: -121.604,
    bbox: [40.215, -121.610, 40.224, -121.598],
    radius_km: 2.1,
    hotspot_count: 2,
    hotspots: RAW_SNAPSHOT_HOTSPOTS.slice(11, 13),
    avg_confidence: 78.0,
    max_frp: 74.1,
    avg_frp: 68.2,
    latest_detection_time: '2026-09-11T18:15:00.000Z',
    approximate_density: 144.3,
    weather: {
      latitude: 40.22,
      longitude: -121.60,
      temperature_2m: 29.5,
      relative_humidity_2m: 22.0,
      precipitation: 0.0,
      wind_speed_10m: 16.5,
      wind_direction_10m: 190,
      surface_pressure: 880.0,
      timestamp: '2026-09-11T18:15:00.000Z',
      source: 'Open-Meteo'
    },
    features: {
      hotspot_count: 2,
      max_frp: 74.1,
      avg_frp: 68.2,
      hotspot_density: 144.3,
      temperature_2m: 29.5,
      relative_humidity_2m: 22.0,
      wind_speed_10m: 16.5,
      wind_direction_10m: 190,
      precipitation: 0.0,
      surface_pressure: 880.0,
      fine_fuel_moisture_index: 12.5,
      wind_cluster_spread_alignment: 0.72
    },
    risk_score: 48.2,
    risk_level: 'MODERATE',
    factor_contributions: [
      {
        feature: 'wind_speed_10m',
        displayName: 'Moderate Wind',
        value: '16.5 km/h',
        impactScore: 14.5,
        importance: 'MODERATE',
        direction: 'INCREASES_RISK',
        explanation: '16.5 km/h surface wind keeps flame front steadily advancing northward.'
      },
      {
        feature: 'relative_humidity_2m',
        displayName: 'Moderate Humidity',
        value: '22.0% RH',
        impactScore: 12.0,
        importance: 'MODERATE',
        direction: 'INCREASES_RISK',
        explanation: '22% humidity dampens aggressive spotting behavior.'
      }
    ],
    spread_estimate: {
      likelyThreatDirection: 'NORTH (10°)',
      headingDegrees: 10,
      spreadRisk: 'MODERATE',
      confidence: 75,
      forwardVelocityKmh: '1.2 - 2.0 km/h',
      estimatedConeAngle: 35,
      disclaimer: 'Moderate threat corridor bounded by volcanic outcrop.'
    },
    exposed_assets: [
      GEOSPATIAL_ASSETS[14] // Lassen National Forest Reserve
    ],
    recommendations: [
      'Maintain infrared drone surveillance along Lassen National Forest perimeter.',
      'Monitor for spot fires crossing Deer Creek drainage.'
    ]
  },
  {
    id: 'CLUSTER-4',
    cluster_number: 4,
    name: 'Yuba River Incident',
    region: 'Sierra Nevada / Northern California',
    center_lat: 39.416,
    center_lon: -120.901,
    bbox: [39.412, -120.908, 39.420, -120.895],
    radius_km: 1.8,
    hotspot_count: 2,
    hotspots: RAW_SNAPSHOT_HOTSPOTS.slice(13, 15),
    avg_confidence: 70.0,
    max_frp: 44.6,
    avg_frp: 41.4,
    latest_detection_time: '2026-09-11T18:15:00.000Z',
    approximate_density: 196.4,
    weather: {
      latitude: 39.41,
      longitude: -120.90,
      temperature_2m: 27.8,
      relative_humidity_2m: 28.5,
      precipitation: 0.0,
      wind_speed_10m: 12.0,
      wind_direction_10m: 180,
      surface_pressure: 890.2,
      timestamp: '2026-09-11T18:15:00.000Z',
      source: 'Open-Meteo'
    },
    features: {
      hotspot_count: 2,
      max_frp: 44.6,
      avg_frp: 41.4,
      hotspot_density: 196.4,
      temperature_2m: 27.8,
      relative_humidity_2m: 28.5,
      wind_speed_10m: 12.0,
      wind_direction_10m: 180,
      precipitation: 0.0,
      surface_pressure: 890.2,
      fine_fuel_moisture_index: 15.2,
      wind_cluster_spread_alignment: 0.65
    },
    risk_score: 31.5,
    risk_level: 'MODERATE',
    factor_contributions: [
      {
        feature: 'relative_humidity_2m',
        displayName: 'Sub-30% Humidity',
        value: '28.5% RH',
        impactScore: 10.2,
        importance: 'MODERATE',
        direction: 'INCREASES_RISK',
        explanation: 'Higher humidity (28.5%) and mild winds limit rapid spread.'
      }
    ],
    spread_estimate: {
      likelyThreatDirection: 'NORTH (0°)',
      headingDegrees: 0,
      spreadRisk: 'LOW',
      confidence: 70,
      forwardVelocityKmh: '0.8 - 1.5 km/h',
      estimatedConeAngle: 30,
      disclaimer: 'Sheltered canyon low spread velocity.'
    },
    exposed_assets: [
      GEOSPATIAL_ASSETS[4] // Downieville
    ],
    recommendations: [
      'Routine aerial patrol check at 0800 hours.',
      'Maintain continuous automated satellite monitoring.'
    ]
  }
];

export const FALLBACK_ALERTS: EmberAlert[] = [
  {
    id: 'ALERT-INIT-01',
    cluster_id: 'CLUSTER-1',
    cluster_name: 'Plumas Canyon Complex',
    risk_score: 92.4,
    severity: 'CRITICAL',
    title: 'CRITICAL WILDFIRE SPREAD DETECTED (Score 92/100)',
    message: 'Rapidly expanding fire cluster with peak FRP 418.5 MW under 32.4 km/h canyon winds. 5 critical assets exposed within 10km buffer.',
    spread_risk: 'EXTREME',
    wind_summary: '32.4 km/h from SW (220°)',
    nearby_population_risk: 'HIGH',
    created_at: '2026-09-11T18:20:00.000Z',
    acknowledged: false
  },
  {
    id: 'ALERT-INIT-02',
    cluster_id: 'CLUSTER-2',
    cluster_name: 'Butte Creek / Ridge Fire',
    risk_score: 78.6,
    severity: 'CRITICAL',
    title: 'HIGH THREAT CORRIDOR ALERT (Score 79/100)',
    message: 'Wildfire perimeter active within 4.8 km of Paradise / Magalia wildland-urban interface.',
    spread_risk: 'EXTREME',
    wind_summary: '24.8 km/h from SW (215°)',
    nearby_population_risk: 'HIGH',
    created_at: '2026-09-11T18:22:00.000Z',
    acknowledged: false
  }
];
