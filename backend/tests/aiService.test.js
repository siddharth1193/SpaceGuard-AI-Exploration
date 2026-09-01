'use strict';

/**
 * aiService.test.js
 * Unit tests for Google Gemini integration and fallback logic in aiService.
 */

const { analyzeSatellite, chat } = require('../src/services/aiService');

const mockSatellite = {
  id: 'sat-25544',
  name: 'ISS (ZARYA)',
  noradId: 25544,
  lat: 51.6,
  lng: -120.3,
  altitude: 408,
  velocity: 7.66,
  orbitalPeriod: 92.68,
  inclination: 51.64,
  lastUpdate: new Date().toISOString(),
  dataSource: 'DEMO',
  type: 'LEO',
  description: 'International Space Station',
};

const mockHealthResult = {
  satelliteId: 'sat-25544',
  status: 'HEALTHY',
  riskLevel: 'LOW',
  issues: [],
  explanation: 'ISS is operating nominally.',
  recommendedAction: 'No action required.',
};

const mockWeather = {
  kpIndex: 3.2,
  solarWindSpeed: 420,
  solarWindDensity: 6.2,
  alertLevel: 'GREEN',
  source: 'DEMO',
};

describe('aiService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('analyzeSatellite', () => {
    test('uses LOCAL_FALLBACK when GEMINI_API_KEY is missing', async () => {
      const result = await analyzeSatellite(mockSatellite, mockHealthResult, mockWeather);

      expect(result).toBeDefined();
      expect(result.satelliteId).toBe('sat-25544');
      expect(result.source).toBe('LOCAL_FALLBACK');
      expect(result.analysis).toContain('ISS (ZARYA)');
      expect(result.primaryRisk).toBe('No issues detected');
      expect(result.recommendedAction).toBe('No action required.');
    });

    test('handles degraded status in fallback analysis', async () => {
      const degradedHealth = {
        ...mockHealthResult,
        status: 'DEGRADED',
        riskLevel: 'HIGH',
        issues: ['Telemetry stale for 8.0 hours'],
        recommendedAction: 'Attempt re-contact.',
      };

      const result = await analyzeSatellite(mockSatellite, degradedHealth, mockWeather);
      expect(result.source).toBe('LOCAL_FALLBACK');
      expect(result.primaryRisk).toBe('Telemetry stale for 8.0 hours');
      expect(result.recommendedAction).toBe('Attempt re-contact.');
    });
  });

  describe('chat', () => {
    test('uses LOCAL_FALLBACK when GEMINI_API_KEY is missing', async () => {
      const messages = [{ role: 'user', content: 'What is the space weather?' }];
      const context = { weather: mockWeather, satellites: [mockSatellite], anomalies: [] };

      const result = await chat(messages, context);

      expect(result).toBeDefined();
      expect(result.role).toBe('assistant');
      expect(result.source).toBe('LOCAL_FALLBACK');
      expect(result.content).toContain('space weather');
    });

    test('handles general queries in fallback mode', async () => {
      const messages = [{ role: 'user', content: 'Hello assistant' }];
      const result = await chat(messages, {});

      expect(result.source).toBe('LOCAL_FALLBACK');
      expect(result.content).toContain('SpaceGuard AI');
    });
  });
});
