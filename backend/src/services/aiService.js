'use strict';

/**
 * aiService.js
 * Google Gemini AI integration with deterministic local fallback.
 */

const { GoogleGenAI } = require('@google/genai');

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const CALL_TIMEOUT_MS = 15000;

/**
 * Sanitize error message to prevent leaking API keys or sensitive data.
 * @param {Error|any} err
 * @returns {string}
 */
function sanitizeErrorMessage(err) {
  let msg = err?.message || String(err);
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 4) {
    msg = msg.replaceAll(apiKey, '[REDACTED_API_KEY]');
  }
  return msg;
}

/**
 * Call the Google Gemini API with timeout and error handling.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured in environment');
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const apiPromise = (async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    });

    const text = response?.text;
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Malformed or empty response received from Gemini API');
    }
    return text.trim();
  })();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Gemini API call timed out after ${CALL_TIMEOUT_MS / 1000}s`));
    }, CALL_TIMEOUT_MS);
  });

  return Promise.race([apiPromise, timeoutPromise]);
}

// ── Local fallback ───────────────────────────────────────────────────────────

const RISK_PHRASES = {
  CRITICAL: [
    'immediate mission-critical intervention is required',
    'operational continuity is severely compromised',
  ],
  DEGRADED: [
    'sustained degraded operations risk data loss',
    'subsystem performance has fallen below acceptable thresholds',
  ],
  WARNING: [
    'early indicators of performance degradation have been detected',
    'monitoring should be elevated to prevent escalation',
  ],
  HEALTHY: [
    'all systems are performing within nominal parameters',
    'no corrective action is currently warranted',
  ],
};

const WEATHER_PHRASES = {
  RED: 'A severe geomagnetic storm is active, significantly elevating radiation and drag risks.',
  ORANGE:
    'Elevated geomagnetic activity increases atmospheric drag and may cause sensor interference.',
  YELLOW: 'Moderate geomagnetic conditions exist; minor operational impacts are possible.',
  GREEN: 'Space weather conditions are benign.',
};

function localFallbackAnalysis(satellite, healthResult, kpIndex, alertLevel) {
  const riskList = RISK_PHRASES[healthResult.status] || RISK_PHRASES.HEALTHY;
  const riskPhrase = riskList[Math.floor(Math.random() * riskList.length)];
  const weatherPhrase = WEATHER_PHRASES[alertLevel] ?? WEATHER_PHRASES.GREEN;

  const issueText =
    healthResult.issues.length > 0
      ? `Detected issues include: ${healthResult.issues.join('; ')}.`
      : 'No specific anomalies detected in current telemetry.';

  const analysis =
    `${satellite.name} (NORAD ${satellite.noradId}) is currently ${healthResult.status.toLowerCase()} ` +
    `at ${satellite.altitude} km altitude with a velocity of ${satellite.velocity} km/s. ` +
    `${issueText} ${weatherPhrase} ` +
    `Risk assessment indicates that ${riskPhrase}.`;

  return {
    satelliteId: satellite.id,
    analysis,
    primaryRisk: healthResult.issues[0] ?? 'No issues detected',
    recommendedAction: healthResult.recommendedAction,
    source: 'LOCAL_FALLBACK',
    generatedAt: new Date().toISOString(),
  };
}

// ── Prompt builders ──────────────────────────────────────────────────────────

function buildSatellitePrompt(satellite, healthResult, kpIndex) {
  return `You are a space operations AI assistant for SpaceGuard AI.
Analyze the following satellite data and provide a concise operational assessment.

Satellite: ${satellite.name} (NORAD: ${satellite.noradId})
Status: ${healthResult.status}
Altitude: ${satellite.altitude} km
Velocity: ${satellite.velocity} km/s
Last Update: ${satellite.lastUpdate}
Detected Issues: ${healthResult.issues.length > 0 ? healthResult.issues.join('; ') : 'None'}
Space Weather KP Index: ${kpIndex.toFixed(1)}

Provide:
1. A 2-3 sentence operational assessment
2. The primary risk factor
3. Recommended immediate action

Be concise and technical but understandable to a mission controller.`;
}

function buildChatSystemPrompt(context) {
  const { satellites = [], weather = {}, anomalies = [] } = context;

  const satelliteSummary = satellites.length > 0
    ? satellites
        .map(
          (s) =>
            `- ${s.name} (${s.type}, ${s.altitude} km): ${s.health?.status ?? 'UNKNOWN'}`
        )
        .join('\n')
    : '  No satellite data available.';

  const anomalySummary = anomalies.length > 0
    ? anomalies
        .slice(0, 10)
        .map((a) => `- [${a.severity}] ${a.satelliteName}: ${a.condition}`)
        .join('\n')
    : '  No anomalies detected.';

  return `You are SpaceGuard AI, an intelligent space operations assistant.
You have access to real-time satellite telemetry and space weather data.

Current Platform State:
======================
Space Weather: Kp=${weather.kpIndex?.toFixed(1) ?? 'N/A'}, Alert=${weather.alertLevel ?? 'GREEN'}, Source=${weather.source ?? 'DEMO'}
Solar Wind: ${weather.solarWindSpeed ?? 420} km/s, Density: ${weather.solarWindDensity ?? 6.2} p/cm³

Monitored Satellites (${satellites.length}):
${satelliteSummary}

Active Anomalies (${anomalies.length}):
${anomalySummary}

Answer questions clearly and technically. When recommending actions, be specific and actionable.`;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze a single satellite using Google Gemini or local fallback.
 *
 * @param {object} satellite
 * @param {object} healthResult - from healthService.evaluateHealth()
 * @param {object} weatherData - from spaceWeatherService.getSpaceWeather()
 * @returns {Promise<object>}
 */
async function analyzeSatellite(satellite, healthResult, weatherData) {
  const kpIndex = weatherData?.kpIndex ?? 0;
  const alertLvl = weatherData?.alertLevel ?? 'GREEN';

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim()) {
    try {
      const prompt = buildSatellitePrompt(satellite, healthResult, kpIndex);
      const text = await callGemini(prompt);

      // Attempt to parse structured sections from model output
      const primaryRiskMatch = text.match(/primary risk[^:]*:\s*(.+)/i);
      const actionMatch = text.match(/recommended[^:]*action[^:]*:\s*(.+)/i);

      return {
        satelliteId: satellite.id,
        analysis: text,
        primaryRisk: primaryRiskMatch?.[1]?.trim() ?? healthResult.issues[0] ?? 'None identified',
        recommendedAction: actionMatch?.[1]?.trim() ?? healthResult.recommendedAction,
        source: 'GEMINI',
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[aiService] Gemini analysis call failed, using fallback:', sanitizeErrorMessage(err));
    }
  }

  return localFallbackAnalysis(satellite, healthResult, kpIndex, alertLvl);
}

/**
 * Process a chat conversation with optional platform context using Gemini or local fallback.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} [context] - { satellites, weather, anomalies }
 * @returns {Promise<object>}
 */
async function chat(messages, context = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = buildChatSystemPrompt({
    satellites: context.satellites ?? [],
    weather: context.weather ?? { kpIndex: 0, alertLevel: 'GREEN', source: 'DEMO', solarWindSpeed: 420, solarWindDensity: 6.2 },
    anomalies: context.anomalies ?? [],
  });

  if (apiKey && apiKey.trim()) {
    try {
      const history = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\n${history}\nAssistant:`;
      const responseText = await callGemini(fullPrompt);

      return {
        role: 'assistant',
        content: responseText,
        source: 'GEMINI',
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[aiService] Gemini chat call failed, using fallback:', sanitizeErrorMessage(err));
    }
  }

  // Local fallback chat response
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const query = lastUserMessage?.content?.toLowerCase() ?? '';

  let reply;
  if (query.includes('anomal')) {
    const count = context.anomalies?.length ?? 0;
    reply =
      count > 0
        ? `I currently detect ${count} active anomalies across the constellation. The highest severity items require immediate attention.`
        : 'No anomalies are currently detected across the monitored constellation.';
  } else if (query.includes('weather') || query.includes('kp') || query.includes('storm')) {
    const w = context.weather ?? {};
    reply = `Current space weather: Kp index ${w.kpIndex?.toFixed(1) ?? 'N/A'}, alert level ${w.alertLevel ?? 'UNKNOWN'}. Solar wind speed is ${w.solarWindSpeed ?? 'N/A'} km/s.`;
  } else if (query.includes('satellite') || query.includes('status')) {
    const sats = context.satellites ?? [];
    const critical = sats.filter((s) => s.health?.status === 'CRITICAL').length;
    const warning = sats.filter((s) => s.health?.status === 'WARNING').length;
    reply = `Monitoring ${sats.length} satellites. ${critical} CRITICAL, ${warning} WARNING, ${sats.length - critical - warning} nominal.`;
  } else {
    reply =
      'I am SpaceGuard AI, your space operations assistant powered by Gemini. I can help you analyze satellite health, anomalies, and space weather conditions. What would you like to know?';
  }

  return {
    role: 'assistant',
    content: reply,
    source: 'LOCAL_FALLBACK',
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { analyzeSatellite, chat, callGemini };
