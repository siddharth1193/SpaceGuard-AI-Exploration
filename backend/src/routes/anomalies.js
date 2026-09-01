'use strict';

const { Router } = require('express');
const { getAllSatellites } = require('../services/satelliteService');
const { detectAllAnomalies } = require('../services/anomalyService');
const { getSpaceWeather } = require('../services/spaceWeatherService');

const router = Router();

const VALID_SEVERITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/**
 * GET /api/anomalies
 * Returns all detected anomalies.
 * Query params:
 *   ?severity=HIGH   filter by minimum severity
 *   ?type=STALE_DATA filter by anomaly type
 */
router.get('/', async (req, res, next) => {
  try {
    const weather = await getSpaceWeather();
    const satellites = await getAllSatellites(weather.kpIndex);
    let anomalies = detectAllAnomalies(satellites, weather.kpIndex);

    // Filter by severity
    if (req.query.severity) {
      const requested = req.query.severity.toUpperCase();
      if (!VALID_SEVERITIES.has(requested)) {
        return res.status(400).json({
          success: false,
          error: `Invalid severity '${req.query.severity}'. Valid values: ${[...VALID_SEVERITIES].join(', ')}`,
        });
      }
      const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const minIndex = order.indexOf(requested);
      anomalies = anomalies.filter(
        (a) => order.indexOf(a.severity) >= minIndex
      );
    }

    // Filter by type
    if (req.query.type) {
      anomalies = anomalies.filter(
        (a) => a.type === req.query.type.toUpperCase()
      );
    }

    res.json({
      success: true,
      data: anomalies,
      meta: {
        source: weather.source,
        timestamp: new Date().toISOString(),
        total: anomalies.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
