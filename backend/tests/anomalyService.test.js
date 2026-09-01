'use strict';

/**
 * anomalyService.test.js
 * Unit tests for rule-based anomaly detection.
 */

const { detectAnomalies, detectAllAnomalies } = require('../src/services/anomalyService');

function makeSat(overrides = {}) {
  return {
    id: 'sat-test',
    name: 'Test Satellite',
    noradId: 99999,
    lat: 0,
    lng: 0,
    altitude: 550,
    velocity: 7.59,
    orbitalPeriod: 95.42,
    inclination: 28.47,
    lastUpdate: new Date().toISOString(),
    dataSource: 'TEST',
    type: 'LEO',
    ...overrides,
  };
}

describe('detectAnomalies', () => {
  test('returns empty array for nominal satellite', () => {
    const sat = makeSat();
    const anomalies = detectAnomalies(sat, 0);
    expect(anomalies).toHaveLength(0);
  });

  test('detects STALE_DATA for telemetry older than 4 hours', () => {
    const sat = makeSat({
      lastUpdate: new Date(Date.now() - 5 * 3600000).toISOString(),
    });
    const anomalies = detectAnomalies(sat, 0);

    const stale = anomalies.find(a => a.type === 'STALE_DATA');
    expect(stale).toBeDefined();
    expect(stale.severity).toBe('MEDIUM');
    expect(stale.satelliteName).toBe('Test Satellite');
  });

  test('STALE_DATA severity escalates with age', () => {
    // 5h → MEDIUM, 15h → HIGH, 30h → CRITICAL
    const med = detectAnomalies(makeSat({ lastUpdate: new Date(Date.now() - 5 * 3600000).toISOString() }), 0);
    const high = detectAnomalies(makeSat({ lastUpdate: new Date(Date.now() - 15 * 3600000).toISOString() }), 0);
    const crit = detectAnomalies(makeSat({ lastUpdate: new Date(Date.now() - 30 * 3600000).toISOString() }), 0);

    expect(med.find(a => a.type === 'STALE_DATA').severity).toBe('MEDIUM');
    expect(high.find(a => a.type === 'STALE_DATA').severity).toBe('HIGH');
    expect(crit.find(a => a.type === 'STALE_DATA').severity).toBe('CRITICAL');
  });

  test('detects ALTITUDE_DEVIATION for LEO satellite at wrong altitude', () => {
    // Nominal LEO is 550km; 800km is ~45% deviation (>15% threshold)
    const sat = makeSat({ altitude: 800 });
    const anomalies = detectAnomalies(sat, 0);

    const alt = anomalies.find(a => a.type === 'ALTITUDE_DEVIATION');
    expect(alt).toBeDefined();
    expect(alt.severity).toBe('HIGH'); // >30% deviation
  });

  test('does NOT detect ALTITUDE_DEVIATION within tolerance', () => {
    // 550km nominal, 560km = ~1.8% deviation (well within 15%)
    const sat = makeSat({ altitude: 560 });
    const anomalies = detectAnomalies(sat, 0);

    const alt = anomalies.find(a => a.type === 'ALTITUDE_DEVIATION');
    expect(alt).toBeUndefined();
  });

  test('detects VELOCITY_ANOMALY when velocity deviates >10%', () => {
    // At 550km altitude, expected velocity ≈ 7.59 km/s
    const sat = makeSat({ velocity: 5.0 }); // ~34% deviation
    const anomalies = detectAnomalies(sat, 0);

    const vel = anomalies.find(a => a.type === 'VELOCITY_ANOMALY');
    expect(vel).toBeDefined();
  });

  test('detects SPACE_WEATHER_ALERT when Kp > 6', () => {
    const sat = makeSat();
    const anomalies = detectAnomalies(sat, 7.5);

    const sw = anomalies.find(a => a.type === 'SPACE_WEATHER_ALERT');
    expect(sw).toBeDefined();
    expect(sw.severity).toBe('HIGH');
  });

  test('detects MISSING_TELEMETRY when critical fields are null', () => {
    const sat = makeSat({ lat: null, velocity: undefined });
    const anomalies = detectAnomalies(sat, 0);

    const missing = anomalies.find(a => a.type === 'MISSING_TELEMETRY');
    expect(missing).toBeDefined();
    expect(missing.condition).toContain('lat');
    expect(missing.condition).toContain('velocity');
  });

  test('anomaly objects have correct shape', () => {
    const sat = makeSat({
      lastUpdate: new Date(Date.now() - 10 * 3600000).toISOString(),
    });
    const anomalies = detectAnomalies(sat, 0);
    const anomaly = anomalies[0];

    expect(anomaly).toHaveProperty('id');
    expect(anomaly).toHaveProperty('satelliteId', 'sat-test');
    expect(anomaly).toHaveProperty('satelliteName', 'Test Satellite');
    expect(anomaly).toHaveProperty('type');
    expect(anomaly).toHaveProperty('severity');
    expect(anomaly).toHaveProperty('condition');
    expect(anomaly).toHaveProperty('explanation');
    expect(anomaly).toHaveProperty('recommendedAction');
    expect(anomaly).toHaveProperty('detectedAt');
  });
});

describe('detectAllAnomalies', () => {
  test('aggregates anomalies across multiple satellites', () => {
    const satellites = [
      makeSat({ id: 'sat-1', name: 'Sat 1', lastUpdate: new Date(Date.now() - 10 * 3600000).toISOString() }),
      makeSat({ id: 'sat-2', name: 'Sat 2' }), // nominal
      makeSat({ id: 'sat-3', name: 'Sat 3', lastUpdate: new Date(Date.now() - 30 * 3600000).toISOString() }),
    ];

    const all = detectAllAnomalies(satellites, 0);

    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.some(a => a.satelliteId === 'sat-1')).toBe(true);
    expect(all.some(a => a.satelliteId === 'sat-3')).toBe(true);
    // sat-2 is nominal, should have no anomalies
    expect(all.some(a => a.satelliteId === 'sat-2')).toBe(false);
  });
});
