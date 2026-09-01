'use strict';

/**
 * anomalyService.js
 * Rule-based anomaly detection for satellite telemetry.
 */

// Nominal altitude ranges (km) per orbit type
const NOMINAL_ALTITUDE = {
  LEO: 550,
  MEO: 20200,
  GEO: 35786,
};

// Expected velocity (km/s) at a given altitude using vis-viva approximation
function nominalVelocity(altitude) {
  const mu = 398600.4418; // Earth gravitational parameter km³/s²
  const Re = 6371;        // Earth radius km
  const r = Re + altitude;
  return Math.sqrt(mu / r);
}

let anomalyCounter = 0;
function generateId() {
  anomalyCounter += 1;
  return `anomaly-${Date.now()}-${anomalyCounter}`;
}

const SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Detect anomalies for a single satellite.
 *
 * @param {object} satellite
 * @param {number} [kpIndex=0]
 * @returns {object[]} Array of anomaly objects
 */
function detectAnomalies(satellite, kpIndex = 0) {
  const anomalies = [];
  const now = new Date();

  function addAnomaly({ type, severity, condition, explanation, recommendedAction }) {
    anomalies.push({
      id: generateId(),
      satelliteId: satellite.id,
      satelliteName: satellite.name,
      type,
      severity,
      condition,
      explanation,
      recommendedAction,
      detectedAt: now.toISOString(),
    });
  }

  // ── STALE_DATA ─────────────────────────────────────────────────────────────
  const ageHours = (now - new Date(satellite.lastUpdate)) / 3600000;
  if (ageHours > 4) {
    const severity = ageHours > 24 ? SEVERITY.CRITICAL : ageHours > 12 ? SEVERITY.HIGH : SEVERITY.MEDIUM;
    addAnomaly({
      type: 'STALE_DATA',
      severity,
      condition: `Last telemetry received ${ageHours.toFixed(1)} hours ago`,
      explanation:
        `No telemetry update has been received from ${satellite.name} for ${ageHours.toFixed(1)} hours. ` +
        `This may indicate a communication link failure, onboard anomaly, or ground station issue.`,
      recommendedAction:
        ageHours > 24
          ? 'Initiate emergency contact procedures. Escalate to mission control immediately.'
          : 'Attempt re-contact via alternate ground station. Verify TT&C link status.',
    });
  }

  // ── ALTITUDE_DEVIATION ────────────────────────────────────────────────────
  const nominalAlt = NOMINAL_ALTITUDE[satellite.type];
  if (nominalAlt != null) {
    const deviation = Math.abs(satellite.altitude - nominalAlt) / nominalAlt;
    if (deviation > 0.15) {
      const severity = deviation > 0.3 ? SEVERITY.HIGH : SEVERITY.MEDIUM;
      addAnomaly({
        type: 'ALTITUDE_DEVIATION',
        severity,
        condition: `Altitude ${satellite.altitude} km deviates ${(deviation * 100).toFixed(1)}% from nominal ${nominalAlt} km`,
        explanation:
          `${satellite.name} is operating at ${satellite.altitude} km, which is ${(deviation * 100).toFixed(1)}% ` +
          `from the nominal ${nominalAlt} km for a ${satellite.type} orbit. ` +
          `Significant altitude deviation can indicate orbital decay, thruster anomaly, or drag effects.`,
        recommendedAction:
          'Review orbital mechanics data. Schedule orbit maintenance maneuver if within operational lifetime. Assess fuel budget.',
      });
    }
  }

  // ── VELOCITY_ANOMALY ──────────────────────────────────────────────────────
  if (satellite.velocity != null) {
    const expectedV = nominalVelocity(satellite.altitude);
    const vDeviation = Math.abs(satellite.velocity - expectedV) / expectedV;
    if (vDeviation > 0.10) {
      const severity = vDeviation > 0.20 ? SEVERITY.HIGH : SEVERITY.MEDIUM;
      addAnomaly({
        type: 'VELOCITY_ANOMALY',
        severity,
        condition: `Velocity ${satellite.velocity} km/s deviates ${(vDeviation * 100).toFixed(1)}% from expected ${expectedV.toFixed(2)} km/s`,
        explanation:
          `The reported velocity of ${satellite.velocity} km/s for ${satellite.name} at ${satellite.altitude} km altitude ` +
          `deviates ${(vDeviation * 100).toFixed(1)}% from the theoretically expected ${expectedV.toFixed(2)} km/s. ` +
          `This may indicate sensor drift, propulsion anomaly, or atmospheric drag effects.`,
        recommendedAction:
          'Cross-check velocity with independent ranging data. Inspect propulsion subsystem telemetry. Verify sensor calibration.',
      });
    }
  }

  // ── SPACE_WEATHER_ALERT ───────────────────────────────────────────────────
  if (kpIndex > 6) {
    const severity = kpIndex > 8 ? SEVERITY.CRITICAL : kpIndex > 7 ? SEVERITY.HIGH : SEVERITY.MEDIUM;
    addAnomaly({
      type: 'SPACE_WEATHER_ALERT',
      severity,
      condition: `Geomagnetic storm in progress — Kp index ${kpIndex.toFixed(1)}`,
      explanation:
        `A geomagnetic storm with Kp index ${kpIndex.toFixed(1)} is currently active. ` +
        `${satellite.name} may experience increased atmospheric drag (LEO), radiation exposure, ` +
        `charging effects on solar arrays, and potential single-event upsets in onboard electronics.`,
      recommendedAction:
        'Enter safe mode if operationally feasible. Avoid attitude maneuvers. Monitor power subsystem and radiation monitors.',
    });
  }

  // ── MISSING_TELEMETRY ─────────────────────────────────────────────────────
  const criticalFields = ['lat', 'lng', 'altitude', 'velocity'];
  const missing = criticalFields.filter(
    (f) => satellite[f] == null || satellite[f] === undefined
  );
  if (missing.length > 0) {
    addAnomaly({
      type: 'MISSING_TELEMETRY',
      severity: SEVERITY.HIGH,
      condition: `Missing critical telemetry fields: ${missing.join(', ')}`,
      explanation:
        `One or more critical telemetry parameters (${missing.join(', ')}) are absent from the latest ` +
        `downlink for ${satellite.name}. This prevents accurate situational awareness and anomaly assessment.`,
      recommendedAction:
        'Verify TT&C link and onboard data handling unit. Request raw telemetry dump on next pass.',
    });
  }

  return anomalies;
}

/**
 * Detect anomalies across all satellites.
 *
 * @param {object[]} satellites
 * @param {number} [kpIndex=0]
 * @returns {object[]}
 */
function detectAllAnomalies(satellites, kpIndex = 0) {
  return satellites.flatMap((sat) => detectAnomalies(sat, kpIndex));
}

module.exports = { detectAnomalies, detectAllAnomalies };
