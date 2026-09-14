import { FireObservation } from '../../src/types/emberwatch.js';
import { db } from '../db.js';
import { RAW_SNAPSHOT_HOTSPOTS } from '../data/snapshot.js';

export interface FirmsIngestResult {
  source: 'LIVE_NASA_FIRMS' | 'VERIFIED_SNAPSHOT';
  totalRetrieved: number;
  newInserted: number;
  duplicatesSkipped: number;
  timestamp: string;
  satelliteSources: string[];
}

export async function fetchFirmsObservations(mapKey?: string): Promise<FirmsIngestResult> {
  const key = mapKey || process.env.FIRMS_MAP_KEY;

  if (key && key.trim() !== '' && key !== 'MY_FIRMS_MAP_KEY') {
    try {
      console.log('[NASA FIRMS] Attempting live API retrieval with provided FIRMS_MAP_KEY...');
      // NASA FIRMS API URL for US/Canada or bounding box (last 1 day, VIIRS NOAA-20 NRT)
      // Example standard bounding box for Western US: -125,32,-114,49 (lon_min, lat_min, lon_max, lat_max)
      const bbox = '-125,32,-114,49';
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key.trim()}/VIIRS_NOAA20_NRT/${bbox}/1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const parsed = parseFirmsCsv(text);
        if (parsed.length > 0) {
          const { inserted, duplicates } = db.insertObservations(parsed);
          const satellites = Array.from(new Set(parsed.map((p) => p.satellite)));
          db.logEvent('INGESTION', `Live NASA FIRMS API successfully returned ${parsed.length} satellite detections.`);
          return {
            source: 'LIVE_NASA_FIRMS',
            totalRetrieved: parsed.length,
            newInserted: inserted,
            duplicatesSkipped: duplicates,
            timestamp: new Date().toISOString(),
            satelliteSources: satellites
          };
        }
      } else {
        console.warn(`[NASA FIRMS] API returned status ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      console.warn('[NASA FIRMS] Live API request failed or timed out:', err?.message || err);
    }
  }

  // Failsafe / Demo Mode: Ingest verified real NASA FIRMS snapshot observations
  console.log('[NASA FIRMS] Using verified NASA FIRMS satellite snapshot dataset (Failsafe mode).');
  const { inserted, duplicates } = db.insertObservations(RAW_SNAPSHOT_HOTSPOTS);
  const satellites = Array.from(new Set(RAW_SNAPSHOT_HOTSPOTS.map((p) => p.satellite)));

  return {
    source: 'VERIFIED_SNAPSHOT',
    totalRetrieved: RAW_SNAPSHOT_HOTSPOTS.length,
    newInserted: inserted,
    duplicatesSkipped: duplicates,
    timestamp: new Date().toISOString(),
    satelliteSources: satellites
  };
}

function parseFirmsCsv(csvText: string): FireObservation[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const latIdx = headers.indexOf('latitude');
  const lonIdx = headers.indexOf('longitude');
  const brightIdx = headers.indexOf('bright_ti4') !== -1 ? headers.indexOf('bright_ti4') : headers.indexOf('brightness');
  const dateIdx = headers.indexOf('acq_date');
  const timeIdx = headers.indexOf('acq_time');
  const satIdx = headers.indexOf('satellite');
  const confIdx = headers.indexOf('confidence');
  const frpIdx = headers.indexOf('frp');
  const daynightIdx = headers.indexOf('daynight');

  if (latIdx === -1 || lonIdx === -1) {
    return [];
  }

  const results: FireObservation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim());
    if (row.length < headers.length) continue;

    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon)) continue;

    const rawConf = confIdx !== -1 ? row[confIdx] : 'nominal';
    let numericConf = 80;
    if (rawConf.toLowerCase() === 'h' || rawConf.toLowerCase() === 'high') numericConf = 95;
    else if (rawConf.toLowerCase() === 'n' || rawConf.toLowerCase() === 'nominal') numericConf = 80;
    else if (rawConf.toLowerCase() === 'l' || rawConf.toLowerCase() === 'low') numericConf = 50;
    else {
      const parsed = parseFloat(rawConf);
      if (!isNaN(parsed)) numericConf = parsed;
    }

    const frp = frpIdx !== -1 && !isNaN(parseFloat(row[frpIdx])) ? parseFloat(row[frpIdx]) : 45.0;
    const brightness = brightIdx !== -1 && !isNaN(parseFloat(row[brightIdx])) ? parseFloat(row[brightIdx]) : 330.0;
    const acqDate = dateIdx !== -1 ? row[dateIdx] : new Date().toISOString().split('T')[0];
    const acqTime = timeIdx !== -1 ? row[timeIdx] : '1200';
    const satName = satIdx !== -1 && row[satIdx] ? row[satIdx] : 'VIIRS-NOAA20';
    const daynight = daynightIdx !== -1 && (row[daynightIdx] === 'N' || row[daynightIdx] === 'n') ? 'N' : 'D';

    results.push({
      id: `FIRMS-CSV-${i}-${acqDate}-${acqTime}`,
      latitude: lat,
      longitude: lon,
      brightness,
      acq_date: acqDate,
      acq_time: acqTime,
      satellite: satName,
      instrument: satName.includes('VIIRS') ? 'VIIRS' : 'MODIS',
      confidence: numericConf,
      frp,
      daynight,
      timestamp: `${acqDate}T${acqTime.padStart(4, '0').slice(0, 2)}:${acqTime.padStart(4, '0').slice(2, 4)}:00.000Z`
    });
  }

  return results;
}
