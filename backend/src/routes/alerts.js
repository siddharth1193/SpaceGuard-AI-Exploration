'use strict';

const { Router } = require('express');
const { getAllSatellites } = require('../services/satelliteService');
const { detectAllAnomalies } = require('../services/anomalyService');
const { getSpaceWeather } = require('../services/spaceWeatherService');
const { getAllAlerts } = require('../services/alertService');

const router = Router();

/**
 * GET /api/alerts
 * Returns all active alerts sorted by severity (CRITICAL first).
 * Query params:
 *   ?severity=HIGH  filter by minimum severity
 */
router.get('/', async (req, res, next) => {
  try {
    const weather = await getSpaceWeather();
    const satellites = await getAllSatellites(weather.kpIndex);
    const anomalies = detectAllAnomalies(satellites, weather.kpIndex);
    let alerts = getAllAlerts(anomalies, weather);

    if (req.query.severity) {
      const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const minIndex = order.indexOf(req.query.severity.toUpperCase());
      if (minIndex !== -1) {
        alerts = alerts.filter(
          (a) => order.indexOf(a.severity) >= minIndex
        );
      }
    }

    res.json({
      success: true,
      data: alerts,
      meta: {
        source: weather.source,
        timestamp: new Date().toISOString(),
        total: alerts.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
