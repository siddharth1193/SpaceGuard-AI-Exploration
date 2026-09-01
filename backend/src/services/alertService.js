'use strict';

/**
 * alertService.js
 * Generates operational alerts derived from anomalies and space weather.
 */

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

/**
 * Convert an anomaly to an alert object.
 */
function anomalyToAlert(anomaly) {
  return {
    id: `alert-${anomaly.id}`,
    satelliteId: anomaly.satelliteId,
    satelliteName: anomaly.satelliteName,
    type: anomaly.type,
    severity: anomaly.severity,
    title: formatAlertTitle(anomaly),
    message: anomaly.condition,
    explanation: anomaly.explanation,
    recommendedAction: anomaly.recommendedAction,
    createdAt: anomaly.detectedAt,
    acknowledged: false,
  };
}

function formatAlertTitle(anomaly) {
  const titleMap = {
    STALE_DATA: `Stale telemetry — ${anomaly.satelliteName}`,
    ALTITUDE_DEVIATION: `Altitude deviation — ${anomaly.satelliteName}`,
    VELOCITY_ANOMALY: `Velocity anomaly — ${anomaly.satelliteName}`,
    SPACE_WEATHER_ALERT: `Space weather alert — ${anomaly.satelliteName}`,
    MISSING_TELEMETRY: `Missing telemetry — ${anomaly.satelliteName}`,
  };
  return titleMap[anomaly.type] ?? `Alert — ${anomaly.satelliteName}`;
}

/**
 * Generate a fleet-wide space weather alert if conditions warrant.
 */
function buildSpaceWeatherAlert(weatherData) {
  const { kpIndex, alertLevel, geomagneticStorm } = weatherData;
  if (alertLevel === 'GREEN') return null;

  const severityMap = { RED: 'CRITICAL', ORANGE: 'HIGH', YELLOW: 'MEDIUM' };
  const severity = severityMap[alertLevel] ?? 'LOW';

  return {
    id: `alert-sw-${Date.now()}`,
    satelliteId: null,
    satelliteName: 'Fleet-wide',
    type: 'SPACE_WEATHER',
    severity,
    title: `Space weather alert — Kp ${kpIndex?.toFixed(1)}`,
    message: `Geomagnetic activity at ${alertLevel} level (Kp=${kpIndex?.toFixed(1)})${geomagneticStorm ? ' — storm in progress' : ''}`,
    explanation: `Elevated geomagnetic conditions (Kp=${kpIndex?.toFixed(1)}) may affect all LEO satellites through increased atmospheric drag, radiation exposure, and charging effects.`,
    recommendedAction:
      alertLevel === 'RED'
        ? 'Place sensitive payloads in safe mode. Avoid orbit maneuvers.'
        : 'Monitor spacecraft charging and drag parameters closely.',
    createdAt: weatherData.lastUpdate,
    acknowledged: false,
  };
}

/**
 * Build and sort all alerts from anomalies + space weather.
 *
 * @param {object[]} anomalies
 * @param {object} weatherData
 * @returns {object[]}
 */
function getAllAlerts(anomalies, weatherData) {
  const alerts = anomalies.map(anomalyToAlert);

  const swAlert = buildSpaceWeatherAlert(weatherData);
  if (swAlert) alerts.push(swAlert);

  return alerts.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
  );
}

module.exports = { getAllAlerts };
