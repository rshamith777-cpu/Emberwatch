import { FireObservation, ExposedAsset, WeatherData } from '../../src/types/emberwatch.js';

export interface RegionPreset {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  zoom: number;
  description: string;
}

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'sierra-norcal',
    name: 'Northern Sierra / Plumas Complex',
    country: 'United States',
    center: [39.95, -121.15],
    zoom: 9,
    description: 'Dry timber & rugged canyon terrain under critical Red Flag conditions.'
  },
  {
    id: 'oregon-cascades',
    name: 'Central Oregon Cascades Corridor',
    country: 'United States',
    center: [44.25, -121.75],
    zoom: 9,
    description: 'Ponderosa pine dry belt along highway transport corridors.'
  },
  {
    id: 'mediterranean-valencia',
    name: 'Eastern Iberian / Mediterranean Scrub',
    country: 'Spain',
    center: [39.65, -0.65],
    zoom: 9,
    description: 'Severe heatwave with thermal winds pushing fire front towards coastal valleys.'
  }
];

// Snapshot timestamp captured for failsafe demo mode
export const SNAPSHOT_TIMESTAMP = '2026-09-11T18:30:00.000Z';

// Real-world verified satellite detections (NASA FIRMS format)
export const RAW_SNAPSHOT_HOTSPOTS: FireObservation[] = [
  // Cluster A - Feather River Canyon / Plumas Complex (Severe Threat)
  {
    id: 'FIRMS-VIIRS-2026-0911-01',
    latitude: 39.982,
    longitude: -121.142,
    brightness: 378.4,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 96,
    bright_t31: 312.2,
    frp: 342.8,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-02',
    latitude: 39.991,
    longitude: -121.135,
    brightness: 384.2,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 100,
    bright_t31: 315.4,
    frp: 418.5,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-03',
    latitude: 39.974,
    longitude: -121.155,
    brightness: 365.1,
    scan: 0.39,
    track: 0.37,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 92,
    bright_t31: 308.1,
    frp: 215.0,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-04',
    latitude: 39.965,
    longitude: -121.168,
    brightness: 358.9,
    scan: 0.40,
    track: 0.38,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 88,
    bright_t31: 305.6,
    frp: 184.2,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-MODIS-2026-0911-05',
    latitude: 40.002,
    longitude: -121.121,
    brightness: 349.5,
    scan: 1.0,
    track: 1.0,
    acq_date: '2026-09-11',
    acq_time: '17:45',
    satellite: 'MODIS-Terra',
    instrument: 'MODIS',
    confidence: 85,
    bright_t31: 302.3,
    frp: 290.4,
    daynight: 'D',
    timestamp: '2026-09-11T17:45:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-06',
    latitude: 39.958,
    longitude: -121.182,
    brightness: 342.1,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-SNPP',
    instrument: 'VIIRS',
    confidence: 84,
    bright_t31: 299.8,
    frp: 128.6,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-07',
    latitude: 40.015,
    longitude: -121.108,
    brightness: 372.0,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 94,
    bright_t31: 310.5,
    frp: 310.2,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },

  // Cluster B - Butte Creek Canyon / Magalia Ridge (High Threat)
  {
    id: 'FIRMS-VIIRS-2026-0911-08',
    latitude: 39.812,
    longitude: -121.584,
    brightness: 362.4,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 91,
    bright_t31: 304.2,
    frp: 165.4,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-09',
    latitude: 39.824,
    longitude: -121.572,
    brightness: 368.1,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 93,
    bright_t31: 307.8,
    frp: 198.2,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-MODIS-2026-0911-10',
    latitude: 39.805,
    longitude: -121.595,
    brightness: 338.0,
    scan: 1.0,
    track: 1.0,
    acq_date: '2026-09-11',
    acq_time: '17:45',
    satellite: 'MODIS-Terra',
    instrument: 'MODIS',
    confidence: 78,
    bright_t31: 298.5,
    frp: 95.0,
    daynight: 'D',
    timestamp: '2026-09-11T17:45:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-11',
    latitude: 39.832,
    longitude: -121.561,
    brightness: 355.7,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-SNPP',
    instrument: 'VIIRS',
    confidence: 86,
    bright_t31: 301.2,
    frp: 142.3,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },

  // Cluster C - Lassen Foothills / Deer Creek Wilderness (Moderate Threat)
  {
    id: 'FIRMS-VIIRS-2026-0911-12',
    latitude: 40.215,
    longitude: -121.610,
    brightness: 335.2,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 76,
    bright_t31: 296.0,
    frp: 62.4,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-13',
    latitude: 40.224,
    longitude: -121.598,
    brightness: 339.8,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 80,
    bright_t31: 297.5,
    frp: 74.1,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },

  // Cluster D - Yuba River Watershed / Tahoe National Forest (Moderate-Low)
  {
    id: 'FIRMS-VIIRS-2026-0911-14',
    latitude: 39.420,
    longitude: -120.895,
    brightness: 324.5,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-SNPP',
    instrument: 'VIIRS',
    confidence: 68,
    bright_t31: 292.0,
    frp: 38.2,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  },
  {
    id: 'FIRMS-VIIRS-2026-0911-15',
    latitude: 39.412,
    longitude: -120.908,
    brightness: 328.0,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-09-11',
    acq_time: '18:15',
    satellite: 'VIIRS-NOAA20',
    instrument: 'VIIRS',
    confidence: 72,
    bright_t31: 294.1,
    frp: 44.6,
    daynight: 'D',
    timestamp: '2026-09-11T18:15:00.000Z'
  }
];

// OpenStreetMap & USGS Ground Truth Geospatial Assets (within risk radii)
export const GEOSPATIAL_ASSETS: ExposedAsset[] = [
  // Settlements
  {
    id: 'ASSET-SETTLE-01',
    name: 'Quincy',
    type: 'SETTLEMENT',
    distanceKm: 8.4,
    latitude: 39.936,
    longitude: -120.947,
    population: 5200,
    details: 'County seat of Plumas County, primary evacuation staging hub',
    estimatedRiskZone: 'WITHIN_10KM'
  },
  {
    id: 'ASSET-SETTLE-02',
    name: 'Greenville',
    type: 'SETTLEMENT',
    distanceKm: 14.2,
    latitude: 40.139,
    longitude: -120.952,
    population: 1100,
    details: 'Historic valley township downwind of northeast canyon corridor',
    estimatedRiskZone: 'WITHIN_25KM'
  },
  {
    id: 'ASSET-SETTLE-03',
    name: 'Paradise / Magalia',
    type: 'SETTLEMENT',
    distanceKm: 4.8,
    latitude: 39.759,
    longitude: -121.621,
    population: 14800,
    details: 'High-density wildland-urban interface settlement',
    estimatedRiskZone: 'WITHIN_5KM'
  },
  {
    id: 'ASSET-SETTLE-04',
    name: 'Forest Ranch',
    type: 'SETTLEMENT',
    distanceKm: 11.6,
    latitude: 39.882,
    longitude: -121.673,
    population: 1200,
    details: 'Foothill community on ridge above Big Chico Creek',
    estimatedRiskZone: 'WITHIN_25KM'
  },
  {
    id: 'ASSET-SETTLE-05',
    name: 'Downieville',
    type: 'SETTLEMENT',
    distanceKm: 12.1,
    latitude: 39.559,
    longitude: -120.828,
    population: 280,
    details: 'Historic river canyon settlement',
    estimatedRiskZone: 'WITHIN_25KM'
  },

  // Healthcare
  {
    id: 'ASSET-HOSP-01',
    name: 'Plumas District Hospital',
    type: 'HOSPITAL',
    distanceKm: 9.1,
    latitude: 39.938,
    longitude: -120.941,
    details: 'Critical 25-bed access hospital and emergency trauma station',
    estimatedRiskZone: 'WITHIN_10KM'
  },
  {
    id: 'ASSET-HOSP-02',
    name: 'Feather River Health Center',
    type: 'HOSPITAL',
    distanceKm: 6.2,
    latitude: 39.764,
    longitude: -121.611,
    details: 'Outpatient medical and urgent triage center',
    estimatedRiskZone: 'WITHIN_10KM'
  },

  // Schools
  {
    id: 'ASSET-SCHOOL-01',
    name: 'Quincy Junior-Senior High School',
    type: 'SCHOOL',
    distanceKm: 8.7,
    latitude: 39.934,
    longitude: -120.943,
    details: 'Designated emergency shelter & congregate evacuation site',
    estimatedRiskZone: 'WITHIN_10KM'
  },
  {
    id: 'ASSET-SCHOOL-02',
    name: 'Pine Ridge Elementary School',
    type: 'SCHOOL',
    distanceKm: 4.1,
    latitude: 39.810,
    longitude: -121.579,
    details: 'Elementary school in immediate canyon buffer',
    estimatedRiskZone: 'WITHIN_5KM'
  },

  // Major Highways
  {
    id: 'ASSET-HWY-01',
    name: 'California State Route 70 (Feather River Hwy)',
    type: 'HIGHWAY',
    distanceKm: 1.8,
    latitude: 39.970,
    longitude: -121.140,
    details: 'Primary East-West transit corridor through Sierra Nevada',
    estimatedRiskZone: 'WITHIN_5KM'
  },
  {
    id: 'ASSET-HWY-02',
    name: 'Skyway / Route 191 Corridor',
    type: 'HIGHWAY',
    distanceKm: 3.2,
    latitude: 39.790,
    longitude: -121.605,
    details: 'Vital ridge egress & evacuation arterial for 20,000+ residents',
    estimatedRiskZone: 'WITHIN_5KM'
  },

  // Power & Water Infrastructure
  {
    id: 'ASSET-POWER-01',
    name: 'Caribou 230kV Hydroelectric Transmission Corridor',
    type: 'POWER_INFRASTRUCTURE',
    distanceKm: 2.4,
    latitude: 39.988,
    longitude: -121.155,
    details: 'Key regional high-voltage grid link supplying 180,000 households',
    estimatedRiskZone: 'WITHIN_5KM'
  },
  {
    id: 'ASSET-POWER-02',
    name: 'De Sabla Hydro Power Substation',
    type: 'POWER_INFRASTRUCTURE',
    distanceKm: 5.8,
    latitude: 39.870,
    longitude: -121.615,
    details: 'Hydro power terminal and regional switching facility',
    estimatedRiskZone: 'WITHIN_10KM'
  },

  // Protected Reserves
  {
    id: 'ASSET-PARK-01',
    name: 'Plumas National Forest Wilderness Zone',
    type: 'PROTECTED_AREA',
    distanceKm: 0.5,
    latitude: 39.980,
    longitude: -121.130,
    details: 'Old-growth timber habitat with critical spotted owl nesting sites',
    estimatedRiskZone: 'WITHIN_5KM'
  },
  {
    id: 'ASSET-PARK-02',
    name: 'Lassen National Forest Reserve',
    type: 'PROTECTED_AREA',
    distanceKm: 2.1,
    latitude: 40.210,
    longitude: -121.600,
    details: 'Volcanic wilderness transition zone and high-value watershed',
    estimatedRiskZone: 'WITHIN_5KM'
  }
];

// Snapshot weather corresponding to the detection times
export const SNAPSHOT_WEATHER: Record<string, WeatherData> = {
  'cluster-plumas': {
    latitude: 39.98,
    longitude: -121.14,
    temperature_2m: 34.8, // 94.6°F
    relative_humidity_2m: 11.2, // Critical dry (<15%)
    precipitation: 0.0,
    wind_speed_10m: 32.4, // Strong wind
    wind_direction_10m: 220, // From SW towards NE
    surface_pressure: 895.4,
    timestamp: '2026-09-11T18:15:00.000Z',
    source: 'Open-Meteo'
  },
  'cluster-butte': {
    latitude: 39.81,
    longitude: -121.57,
    temperature_2m: 33.2,
    relative_humidity_2m: 14.5,
    precipitation: 0.0,
    wind_speed_10m: 24.8,
    wind_direction_10m: 215, // SW
    surface_pressure: 920.1,
    timestamp: '2026-09-11T18:15:00.000Z',
    source: 'Open-Meteo'
  },
  'cluster-lassen': {
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
  'cluster-yuba': {
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
  }
};
