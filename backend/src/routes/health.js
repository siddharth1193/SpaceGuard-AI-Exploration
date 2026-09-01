'use strict';

const { Router } = require('express');
const { getHealthSummary } = require('../services/satelliteService');
const { getSpaceWeather } = require('../services/spaceWeatherService');

const router = Router();

/**
 * GET /api/health
 * Returns health summary across all monitored satellites.
 */
router.get('/', async (req, res, next) => {
  try {
    const weather = await getSpaceWeather();
    const summary = await getHealthSummary(weather.kpIndex);

    res.json({
      success: true,
      data: summary,
      meta: {
        source: weather.source,
        timestamp: new Date().toISOString(),
        kpIndex: weather.kpIndex,
        alertLevel: weather.alertLevel,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
