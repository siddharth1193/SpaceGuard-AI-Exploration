'use strict';

/**
 * healthService.js
 * Evaluates satellite operational health based on telemetry, data age,
 * orbital parameters, and space weather conditions.
 */

// Expected altitude ranges (km) per orbit type
const ALTITUDE_RANGES = {
  LEO: { min: 160, max: 2000 },
  MEO: { min: 2000, max: 35000 },
  GEO: { min: 35500, max: 36500 },
};

// Expected velocity ranges (km/s) keyed by approximate altitude bracket
function expectedVelocity(altitude) {
  if (altitude <= 2000) return { min: 6.9, max: 8.0 };   // LEO
  if (altitude <= 35000) return { min: 3.0, max: 5.0 };  // MEO
  return { min: 2.8, max: 3.3 };                          // GEO
}

/**
 * Evaluate satellite health.
 *
 * @param {object} satellite - Satellite object from demoSatellites or live data
 * @param {number} [kpIndex=0] - Current geomagnetic Kp index
 * @returns {object} Health assessment
 */
function evaluateHealth(satellite, kpIndex = 0) {
  const issues = [];
  let worstStatus = 'HEALTHY';

  const statusPriority = { HEALTHY: 0, WARNING: 1, DEGRADED: 2, CRITICAL: 3 };

  function escalate(status) {
    if (statusPriority[status] > statusPriority[worstStatus]) {
      worstStatus = status;
    }
  }

  // ── 1. Data age check ──────────────────────────────────────────────────────
  const lastUpdateMs = new Date(satellite.lastUpdate).getTime();
  const ageHours = (Date.now() - lastUpdateMs) / 3600000;

  if (ageHours > 24) {
    issues.push(`No telemetry for ${ageHours.toFixed(1)} hours (CRITICAL threshold: 24h)`);
    escalate('CRITICAL');
  } else if (ageHours > 6) {
    issues.push(`Telemetry stale for ${ageHours.toFixed(1)} hours (DEGRADED threshold: 6h)`);
    escalate('DEGRADED');
  } else if (ageHours > 2) {
    issues.push(`Telemetry delayed by ${ageHours.toFixed(1)} hours (WARNING threshold: 2h)`);
    escalate('WARNING');
  }

  // ── 2. Altitude deviation check ───────────────────────────────────────────
  const range = ALTITUDE_RANGES[satellite.type];
  if (range) {
    if (satellite.altitude < range.min || satellite.altitude > range.max) {
      issues.push(
        `Altitude ${satellite.altitude} km outside expected ${satellite.type} range ` +
          `(${range.min}–${range.max} km)`
      );
      escalate('WARNING');
    }
  }

  // ── 3. Velocity anomaly check ─────────────────────────────────────────────
  if (satellite.velocity != null) {
    const vRange = expectedVelocity(satellite.altitude);
    if (satellite.velocity < vRange.min || satellite.velocity > vRange.max) {
      issues.push(
        `Velocity ${satellite.velocity} km/s outside expected range ` +
          `(${vRange.min}–${vRange.max} km/s) for altitude ${satellite.altitude} km`
      );
      escalate('WARNING');
    }
  }

  // ── 4. Space weather check ────────────────────────────────────────────────
  if (kpIndex > 7) {
    issues.push(`Severe geomagnetic storm detected (Kp=${kpIndex.toFixed(1)}, CRITICAL threshold: >7)`);
    escalate('CRITICAL');
  } else if (kpIndex > 5) {
    issues.push(`Elevated geomagnetic activity (Kp=${kpIndex.toFixed(1)}, WARNING threshold: >5)`);
    escalate('WARNING');
  }

  // ── Derive risk level from status ─────────────────────────────────────────
  const riskMap = {
    HEALTHY: 'LOW',
    WARNING: 'MEDIUM',
    DEGRADED: 'HIGH',
    CRITICAL: 'CRITICAL',
  };

  const riskLevel = riskMap[worstStatus];

  // ── Human-readable explanation ────────────────────────────────────────────
  let explanation;
  let recommendedAction;

  if (worstStatus === 'HEALTHY') {
    explanation = `${satellite.name} is operating within all nominal parameters. Telemetry is current and orbital elements are within expected bounds.`;
    recommendedAction = 'No action required. Continue routine monitoring.';
  } else if (worstStatus === 'WARNING') {
    explanation = `${satellite.name} has ${issues.length} warning condition(s) requiring attention: ${issues.join('; ')}.`;
    recommendedAction =
      'Schedule diagnostic review. Monitor closely over the next contact window.';
  } else if (worstStatus === 'DEGRADED') {
    explanation = `${satellite.name} is in a degraded state. Identified issues: ${issues.join('; ')}.`;
    recommendedAction =
      'Initiate degraded-operations protocol. Attempt re-contact and verify subsystem status.';
  } else {
    explanation = `${satellite.name} is in a CRITICAL state requiring immediate attention. Issues: ${issues.join('; ')}.`;
    recommendedAction =
      'Immediate operator intervention required. Escalate to mission control and initiate emergency contact procedures.';
  }

  return {
    satelliteId: satellite.id,
    status: worstStatus,
    riskLevel,
    issues,
    explanation,
    recommendedAction,
  };
}

module.exports = { evaluateHealth };
