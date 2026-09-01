'use strict';

const { Router } = require('express');
const { getSpaceWeather } = require('../services/spaceWeatherService');

const router = Router();

/**
 * GET /api/space-weather
 * Returns current space weather conditions.
 */
router.get('/', async (req, res, next) => {
  try {
    const weather = await getSpaceWeather();
    res.json({
      success: true,
      data: weather,
      meta: {
        source: weather.source,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
