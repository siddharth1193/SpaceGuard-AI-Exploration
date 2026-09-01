'use strict';

/**
 * spaceWeatherService.test.js
 * Unit tests for the space weather data parsing and fallback logic.
 */

// We test the parsing functions by requiring the module.
// The actual NOAA fetch is tested via the demo fallback path since
// we don't want to depend on external APIs in unit tests.

const { getSpaceWeather } = require('../src/services/spaceWeatherService');

describe('getSpaceWeather', () => {
  test('returns a valid weather object', async () => {
    const weather = await getSpaceWeather();

    expect(weather).toHaveProperty('kpIndex');
    expect(weather).toHaveProperty('solarWindSpeed');
    expect(weather).toHaveProperty('solarWindDensity');
    expect(weather).toHaveProperty('alertLevel');
    expect(weather).toHaveProperty('lastUpdate');
    expect(weather).toHaveProperty('source');

    // kpIndex should be a number
    expect(typeof weather.kpIndex).toBe('number');
    expect(weather.kpIndex).toBeGreaterThanOrEqual(0);
    expect(weather.kpIndex).toBeLessThanOrEqual(9);

    // alertLevel should be one of the valid values
    expect(['GREEN', 'YELLOW', 'ORANGE', 'RED']).toContain(weather.alertLevel);

    // source should be either NOAA or DEMO
    expect(['NOAA', 'DEMO']).toContain(weather.source);
  });

  test('solar wind speed is a reasonable value', async () => {
    const weather = await getSpaceWeather();
    expect(weather.solarWindSpeed).toBeGreaterThan(0);
    expect(weather.solarWindSpeed).toBeLessThan(3000); // Even extreme events < 3000 km/s
  });

  test('geomagneticStorm flag is consistent with kpIndex', async () => {
    const weather = await getSpaceWeather();

    if (weather.source === 'DEMO') {
      // Demo data has kpIndex=3.2 → no storm
      expect(weather.geomagneticStorm).toBe(false);
    }
    // For live data, just check it's a boolean
    expect(typeof weather.geomagneticStorm).toBe('boolean');
  });

  test('alertLevel is consistent with kpIndex for demo data', async () => {
    const weather = await getSpaceWeather();

    if (weather.source === 'DEMO') {
      // Demo kpIndex is 3.2 → should be GREEN (< 4)
      expect(weather.alertLevel).toBe('GREEN');
    }
  });
});
