'use strict';

/**
 * spaceWeatherService.js
 * Fetches real-time space weather data from NOAA SWPC.
 * Falls back to deterministic demo data when unavailable.
 */

const axios = require('axios');

const NOAA_KP_URL =
  'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
const NOAA_WIND_URL =
  'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json';

const FETCH_TIMEOUT_MS = 8000;

function alertLevel(kpIndex) {
  if (kpIndex >= 8) return 'RED';
  if (kpIndex >= 6) return 'ORANGE';
  if (kpIndex >= 4) return 'YELLOW';
  return 'GREEN';
}

function buildDemoData() {
  return {
    kpIndex: 3.2,
    solarWindSpeed: 420,
    solarWindDensity: 6.2,
    xrayFlux: 1.2e-7,
    geomagneticStorm: false,
    alertLevel: 'GREEN',
    lastUpdate: new Date().toISOString(),
    source: 'DEMO',
  };
}

/**
 * Parse the latest Kp value from NOAA 1-minute data.
 * The array entries are ordered oldest-first; take the last valid numeric value.
 */
function parseKp(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  for (let i = data.length - 1; i >= 0; i--) {
    const entry = data[i];
    const kp = parseFloat(entry.kp_index ?? entry.Kp ?? entry.kp);
    if (!isNaN(kp)) return kp;
  }
  return null;
}

/**
 * Parse the latest solar wind speed and density from NOAA RTSW data.
 */
function parseSolarWind(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  for (let i = data.length - 1; i >= 0; i--) {
    const entry = data[i];
    const speed = parseFloat(entry.proton_speed ?? entry.speed);
    const density = parseFloat(entry.proton_density ?? entry.density);
    if (!isNaN(speed) && !isNaN(density)) {
      return { speed, density };
    }
  }
  return null;
}

/**
 * Fetch live space weather. Returns demo data on any failure.
 *
 * @returns {Promise<object>}
 */
async function getSpaceWeather() {
  try {
    const [kpRes, windRes] = await Promise.allSettled([
      axios.get(NOAA_KP_URL, { timeout: FETCH_TIMEOUT_MS }),
      axios.get(NOAA_WIND_URL, { timeout: FETCH_TIMEOUT_MS }),
    ]);

    let kpIndex = null;
    let solarWindSpeed = null;
    let solarWindDensity = null;

    if (kpRes.status === 'fulfilled' && kpRes.value.data) {
      kpIndex = parseKp(kpRes.value.data);
    }

    if (windRes.status === 'fulfilled' && windRes.value.data) {
      const wind = parseSolarWind(windRes.value.data);
      if (wind) {
        solarWindSpeed = wind.speed;
        solarWindDensity = wind.density;
      }
    }

    // If we got at least a Kp value, return live data
    if (kpIndex !== null) {
      return {
        kpIndex,
        solarWindSpeed: solarWindSpeed ?? 420,
        solarWindDensity: solarWindDensity ?? 6.2,
        xrayFlux: 1.2e-7,        // X-ray flux not readily available in 1-min feed
        geomagneticStorm: kpIndex >= 5,
        alertLevel: alertLevel(kpIndex),
        lastUpdate: new Date().toISOString(),
        source: 'NOAA',
      };
    }

    console.warn('[spaceWeatherService] NOAA data incomplete — using demo fallback');
    return buildDemoData();
  } catch (err) {
    console.warn('[spaceWeatherService] Failed to fetch NOAA data:', err.message);
    return buildDemoData();
  }
}

module.exports = { getSpaceWeather };
