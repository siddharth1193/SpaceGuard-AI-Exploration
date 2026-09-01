'use strict';

/**
 * alertService.test.js
 * Unit tests for the anomaly-to-alert conversion and space weather alerts.
 */

const { getAllAlerts } = require('../src/services/alertService');

function makeAnomaly(overrides = {}) {
  return {
    id: 'anomaly-1',
    satelliteId: 'sat-test',
    satelliteName: 'Test Satellite',
    type: 'STALE_DATA',
    severity: 'MEDIUM',
    condition: 'Last telemetry received 5.0 hours ago',
    explanation: 'No telemetry update.',
    recommendedAction: 'Attempt re-contact.',
    detectedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeWeather(overrides = {}) {
  return {
    kpIndex: 2.0,
    solarWindSpeed: 420,
    solarWindDensity: 6.2,
    xrayFlux: 1.2e-7,
    geomagneticStorm: false,
    alertLevel: 'GREEN',
    lastUpdate: new Date().toISOString(),
    source: 'TEST',
    ...overrides,
  };
}

describe('getAllAlerts', () => {
  test('converts anomalies to alerts with correct shape', () => {
    const anomalies = [makeAnomaly()];
    const alerts = getAllAlerts(anomalies, makeWeather());

    expect(alerts).toHaveLength(1);
    const alert = alerts[0];
    expect(alert).toHaveProperty('id');
    expect(alert.id).toMatch(/^alert-/);
    expect(alert).toHaveProperty('satelliteId', 'sat-test');
    expect(alert).toHaveProperty('satelliteName', 'Test Satellite');
    expect(alert).toHaveProperty('severity', 'MEDIUM');
    expect(alert).toHaveProperty('title');
    expect(alert).toHaveProperty('message');
    expect(alert).toHaveProperty('acknowledged', false);
  });

  test('generates alert titles for all anomaly types', () => {
    const types = ['STALE_DATA', 'ALTITUDE_DEVIATION', 'VELOCITY_ANOMALY', 'SPACE_WEATHER_ALERT', 'MISSING_TELEMETRY'];

    for (const type of types) {
      const alerts = getAllAlerts([makeAnomaly({ type })], makeWeather());
      expect(alerts[0].title).toContain('Test Satellite');
    }
  });

  test('adds space weather alert when alert level is not GREEN', () => {
    const alerts = getAllAlerts([], makeWeather({ alertLevel: 'YELLOW', kpIndex: 4.5 }));

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('SPACE_WEATHER');
    expect(alerts[0].satelliteName).toBe('Fleet-wide');
    expect(alerts[0].severity).toBe('MEDIUM');
  });

  test('does NOT add space weather alert when GREEN', () => {
    const alerts = getAllAlerts([], makeWeather({ alertLevel: 'GREEN' }));
    expect(alerts).toHaveLength(0);
  });

  test('sorts alerts by severity (CRITICAL first)', () => {
    const anomalies = [
      makeAnomaly({ id: 'a1', severity: 'LOW' }),
      makeAnomaly({ id: 'a2', severity: 'CRITICAL' }),
      makeAnomaly({ id: 'a3', severity: 'HIGH' }),
      makeAnomaly({ id: 'a4', severity: 'MEDIUM' }),
    ];
    const alerts = getAllAlerts(anomalies, makeWeather());

    expect(alerts[0].severity).toBe('CRITICAL');
    expect(alerts[1].severity).toBe('HIGH');
    expect(alerts[2].severity).toBe('MEDIUM');
    expect(alerts[3].severity).toBe('LOW');
  });

  test('RED alert level maps to CRITICAL severity', () => {
    const alerts = getAllAlerts([], makeWeather({
      alertLevel: 'RED',
      kpIndex: 9.0,
      geomagneticStorm: true,
    }));

    expect(alerts[0].severity).toBe('CRITICAL');
    expect(alerts[0].message).toContain('storm in progress');
  });
});
