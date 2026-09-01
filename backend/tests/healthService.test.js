'use strict';

/**
 * healthService.test.js
 * Unit tests for the satellite health evaluation logic.
 */

const { evaluateHealth } = require('../src/services/healthService');

// Helper: create a satellite with sensible defaults that can be overridden
function makeSat(overrides = {}) {
  return {
    id: 'sat-test',
    name: 'Test Satellite',
    noradId: 99999,
    lat: 0,
    lng: 0,
    altitude: 408,
    velocity: 7.66,
    orbitalPeriod: 92.68,
    inclination: 51.64,
    lastUpdate: new Date().toISOString(),
    dataSource: 'TEST',
    type: 'LEO',
    ...overrides,
  };
}

describe('evaluateHealth', () => {
  test('returns HEALTHY for a nominal LEO satellite', () => {
    const sat = makeSat();
    const result = evaluateHealth(sat, 0);

    expect(result.status).toBe('HEALTHY');
    expect(result.riskLevel).toBe('LOW');
    expect(result.issues).toHaveLength(0);
    expect(result.explanation).toContain('nominal');
    expect(result.recommendedAction).toContain('No action');
  });

  test('returns WARNING for telemetry delayed 3 hours', () => {
    const sat = makeSat({
      lastUpdate: new Date(Date.now() - 3 * 3600000).toISOString(),
    });
    const result = evaluateHealth(sat, 0);

    expect(result.status).toBe('WARNING');
    expect(result.riskLevel).toBe('MEDIUM');
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain('delayed');
  });

  test('returns DEGRADED for telemetry stale 8 hours', () => {
    const sat = makeSat({
      lastUpdate: new Date(Date.now() - 8 * 3600000).toISOString(),
    });
    const result = evaluateHealth(sat, 0);

    expect(result.status).toBe('DEGRADED');
    expect(result.riskLevel).toBe('HIGH');
  });

  test('returns CRITICAL for telemetry missing 30 hours', () => {
    const sat = makeSat({
      lastUpdate: new Date(Date.now() - 30 * 3600000).toISOString(),
    });
    const result = evaluateHealth(sat, 0);

    expect(result.status).toBe('CRITICAL');
    expect(result.riskLevel).toBe('CRITICAL');
  });

  test('detects altitude deviation for LEO satellite at wrong altitude', () => {
    const sat = makeSat({ altitude: 50000, type: 'LEO' }); // Way outside LEO range
    const result = evaluateHealth(sat, 0);

    expect(result.status).not.toBe('HEALTHY');
    expect(result.issues.some(i => i.includes('Altitude'))).toBe(true);
  });

  test('detects velocity anomaly', () => {
    const sat = makeSat({ velocity: 2.0 }); // Way too slow for LEO
    const result = evaluateHealth(sat, 0);

    expect(result.issues.some(i => i.includes('Velocity'))).toBe(true);
  });

  test('escalates to WARNING on elevated Kp index (>5)', () => {
    const sat = makeSat();
    const result = evaluateHealth(sat, 6);

    expect(result.status).toBe('WARNING');
    expect(result.issues.some(i => i.includes('geomagnetic'))).toBe(true);
  });

  test('escalates to CRITICAL on severe geomagnetic storm (Kp>7)', () => {
    const sat = makeSat();
    const result = evaluateHealth(sat, 8);

    expect(result.status).toBe('CRITICAL');
    expect(result.issues.some(i => i.includes('Severe'))).toBe(true);
  });

  test('GEO satellite at nominal altitude is HEALTHY', () => {
    const sat = makeSat({ altitude: 35786, velocity: 3.07, type: 'GEO' });
    const result = evaluateHealth(sat, 0);

    expect(result.status).toBe('HEALTHY');
  });

  test('worst status wins when multiple issues present', () => {
    // Stale data (DEGRADED) + severe storm (CRITICAL) → should be CRITICAL
    const sat = makeSat({
      lastUpdate: new Date(Date.now() - 10 * 3600000).toISOString(),
    });
    const result = evaluateHealth(sat, 8);

    expect(result.status).toBe('CRITICAL');
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});
