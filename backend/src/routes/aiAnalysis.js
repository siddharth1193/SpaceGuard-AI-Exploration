'use strict';

const { Router } = require('express');
const { getSatelliteById, getAllSatellites } = require('../services/satelliteService');
const { detectAllAnomalies } = require('../services/anomalyService');
const { getSpaceWeather } = require('../services/spaceWeatherService');
const { analyzeSatellite, chat } = require('../services/aiService');

const router = Router();

/**
 * POST /api/ai/analyze
 * Run AI analysis for a specific satellite.
 * Body: { satelliteId: string }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { satelliteId } = req.body;

    if (!satelliteId) {
      return res.status(400).json({
        success: false,
        error: 'satelliteId is required in request body',
      });
    }

    const weather = await getSpaceWeather();
    const satellite = await getSatelliteById(satelliteId, weather.kpIndex);

    if (!satellite) {
      return res.status(404).json({
        success: false,
        error: `Satellite '${satelliteId}' not found`,
      });
    }

    const analysis = await analyzeSatellite(satellite, satellite.health, weather);

    res.json({
      success: true,
      data: analysis,
      meta: {
        source: analysis.source,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/chat
 * AI assistant conversational endpoint.
 * Body: { messages: Array<{role, content}>, includeContext?: boolean }
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, includeContext = true } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'messages must be a non-empty array of { role, content } objects',
      });
    }

    let context = {};
    if (includeContext) {
      const weather = await getSpaceWeather();
      const satellites = await getAllSatellites(weather.kpIndex);
      const anomalies = detectAllAnomalies(satellites, weather.kpIndex);
      context = { satellites, weather, anomalies };
    }

    const response = await chat(messages, context);

    res.json({
      success: true,
      data: response,
      meta: {
        source: response.source,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
