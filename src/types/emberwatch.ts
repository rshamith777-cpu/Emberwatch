export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type SpreadRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'WARNING';
export type PrimaryScreen = 'CINEMATIC' | 'OPERATIONS' | 'INCIDENT' | 'SYSTEM';

export interface FireObservation {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number; // Kelvin
  scan?: number;
  track?: number;
  acq_date: string;
  acq_time: string;
  satellite: string; // 'VIIRS-NOAA20' | 'VIIRS-SNPP' | 'MODIS-Terra' | 'MODIS-Aqua'
  instrument: string; // 'VIIRS' | 'MODIS'
  confidence: number; // 0-100% or categorical mapped to numeric
  version?: string;
  bright_t31?: number;
  frp: number; // Fire Radiative Power (MW)
  daynight: 'D' | 'N';
  cluster_id?: string | null;
  timestamp: string; // ISO string
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature_2m: number; // °C
  relative_humidity_2m: number; // %
  precipitation: number; // mm
  wind_speed_10m: number; // km/h
  wind_direction_10m: number; // degrees
  surface_pressure: number; // hPa
  timestamp: string;
  source: string; // 'Open-Meteo'
}

export interface FactorContribution {
  feature: string;
  displayName: string;
  value: string;
  impactScore: number; // -10 to +30 marginal contribution
  importance: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  direction: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
  explanation: string;
}

export interface SpreadEstimate {
  likelyThreatDirection: string; // e.g. "NORTHEAST (48°)"
  headingDegrees: number;
  spreadRisk: SpreadRiskLevel;
  confidence: number; // 0-100%
  forwardVelocityKmh: string; // e.g. "1.8 - 3.4 km/h"
  estimatedConeAngle: number; // e.g. 45 degrees
  disclaimer: string;
}

export interface ExposedAsset {
  id: string;
  name: string;
  type: 'SETTLEMENT' | 'HOSPITAL' | 'SCHOOL' | 'HIGHWAY' | 'POWER_INFRASTRUCTURE' | 'PROTECTED_AREA';
  distanceKm: number;
  latitude: number;
  longitude: number;
  details?: string;
  population?: number;
  estimatedRiskZone: 'WITHIN_5KM' | 'WITHIN_10KM' | 'WITHIN_25KM';
}

export interface FireCluster {
  id: string;
  cluster_number: number;
  name: string;
  region: string;
  center_lat: number;
  center_lon: number;
  bbox: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
  radius_km: number;
  hotspot_count: number;
  hotspots: FireObservation[];
  avg_confidence: number;
  max_frp: number;
  avg_frp: number;
  latest_detection_time: string;
  approximate_density: number; // hotspots per 100 km²
  weather: WeatherData;
  features: Record<string, number>;
  risk_score: number; // 0-100
  risk_level: RiskLevel;
  factor_contributions: FactorContribution[];
  spread_estimate: SpreadEstimate;
  exposed_assets: ExposedAsset[];
  recommendations: string[];
}

export interface EmberAlert {
  id: string;
  cluster_id: string;
  cluster_name: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  risk_score: number;
  spread_risk: SpreadRiskLevel;
  wind_summary: string;
  nearby_population_risk: 'HIGH' | 'MODERATE' | 'LOW';
  created_at: string;
  acknowledged?: boolean;
}

export interface SystemStatus {
  nasaFirms: 'CONNECTED' | 'DEGRADED' | 'DEMO_MODE';
  weather: 'CONNECTED' | 'DEGRADED';
  database: 'CONNECTED';
  mlEngine: 'READY';
  mode: 'LIVE' | 'DEMO_SNAPSHOT';
  snapshotTimestamp?: string;
  lastRefreshTime: string;
  nextRefreshTime: string;
  refreshIntervalMinutes: number;
  totalHotspots: number;
  totalClusters: number;
  highRiskClusters: number;
  criticalAlerts: number;
}

export interface ModelMetrics {
  modelVersion: string;
  algorithm: string;
  trainingDate: string;
  datasetVersion: string;
  trainingSamples: number;
  validationSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  confusionMatrix: {
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
  featureImportance: {
    feature: string;
    displayName: string;
    importance: number;
    description: string;
  }[];
  riskBands: {
    band: RiskLevel;
    range: string;
    samplePercent: number;
    evacuationPriority: string;
  }[];
}

export interface AgentToolCallLog {
  toolName: string;
  args: Record<string, any>;
  resultSummary: string;
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: AgentToolCallLog[];
  timestamp: string;
}
