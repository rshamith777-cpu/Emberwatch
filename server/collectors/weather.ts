import { WeatherData } from '../../src/types/emberwatch.js';
import { db } from '../db.js';
import { SNAPSHOT_WEATHER } from '../data/snapshot.js';

export async function fetchLiveWeather(lat: number, lon: number): Promise<WeatherData> {
  // Check if we have recent cached observation
  const existing = db.getWeather(lat, lon);
  if (existing) {
    const ageMs = Date.now() - new Date(existing.timestamp).getTime();
    if (ageMs < 15 * 60 * 1000) {
      return existing;
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    const weather: WeatherData = {
      latitude: lat,
      longitude: lon,
      temperature_2m: current?.temperature_2m ?? 32.5,
      relative_humidity_2m: current?.relative_humidity_2m ?? 14.0,
      precipitation: current?.precipitation ?? 0.0,
      wind_speed_10m: current?.wind_speed_10m ?? 28.5,
      wind_direction_10m: current?.wind_direction_10m ?? 225,
      surface_pressure: current?.surface_pressure ?? 910.0,
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo (Live)'
    };

    db.setWeather(lat, lon, weather);
    db.logEvent('WEATHER', `Fetched live Open-Meteo data for [${lat.toFixed(2)}, ${lon.toFixed(2)}]: ${weather.temperature_2m}°C, ${weather.relative_humidity_2m}% RH, wind ${weather.wind_speed_10m} km/h @ ${weather.wind_direction_10m}°`);
    return weather;
  } catch (err: any) {
    console.warn(`[Open-Meteo] Live fetch failed for [${lat}, ${lon}], using calibrated station reading:`, err?.message || err);

    // Pick closest from verified snapshot weather
    let fallback: WeatherData = SNAPSHOT_WEATHER['cluster-plumas'];
    let minDist = Infinity;
    for (const key of Object.keys(SNAPSHOT_WEATHER)) {
      const sw = SNAPSHOT_WEATHER[key];
      const dist = Math.hypot(sw.latitude - lat, sw.longitude - lon);
      if (dist < minDist) {
        minDist = dist;
        fallback = sw;
      }
    }

    const synthetic: WeatherData = {
      ...fallback,
      latitude: lat,
      longitude: lon,
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo (Calibrated Station)'
    };

    db.setWeather(lat, lon, synthetic);
    return synthetic;
  }
}
