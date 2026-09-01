'use strict';

const { Router } = require('express');
const { getAllSatellites, getSatelliteById } = require('../services/satelliteService');
const { detectAnomalies } = require('../services/anomalyService');
const { getSpaceWeather } = require('../services/spaceWeatherService');
const { analyzeSatellite } = require('../services/aiService');

const router = Router();

const meta = (source = 'DEMO') => ({
  source,
  timestamp: new Date().toISOString(),
});

/**
 * GET /api/satellites
 * Returns all satellites enriched with health assessments.
 */
router.get('/', async (req, res, next) => {
  try {
    const weather = await getSpaceWeather();
    const satellites = await getAllSatellites(weather.kpIndex);
    res.json({
      success: true,
      data: satellites,
      meta: meta(weather.source),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/satellites/:id
 * Returns a single satellite with full health, anomalies, and AI analysis.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const weather = await getSpaceWeather();
    const satellite = await getSatelliteById(req.params.id, weather.kpIndex);

    if (!satellite) {
      return res.status(404).json({
        success: false,
        error: `Satellite '${req.params.id}' not found`,
        meta: meta(),
      });
    }

    const anomalies = detectAnomalies(satellite, weather.kpIndex);
    const aiAnalysis = await analyzeSatellite(satellite, satellite.health, weather);

    res.json({
      success: true,
      data: {
        ...satellite,
        anomalies,
        aiAnalysis,
        weather: { kpIndex: weather.kpIndex, alertLevel: weather.alertLevel },
      },
      meta: meta(weather.source),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
