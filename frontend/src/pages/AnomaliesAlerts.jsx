import { useState } from 'react'
import AnomalyList from '../components/AnomalyList'
import { getSeverityBg, getAlertLevelBg, formatAgo } from '../utils/colors'
import LoadingSpinner from '../components/LoadingSpinner'

const SEVERITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function AnomaliesAlerts({ anomalies, alerts, loading, error }) {
  const [tab, setTab] = useState('anomalies')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  if (loading) return <LoadingSpinner message="Loading anomalies..." />

  const filteredAnomalies = anomalies.filter(a =>
    severityFilter === 'ALL' || a.severity === severityFilter
  )

  const filteredAlerts = alerts.filter(a =>
    severityFilter === 'ALL' || a.severity === severityFilter
  )

  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length
  const highCount = anomalies.filter(a => a.severity === 'HIGH').length

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Anomalies" value={anomalies.length} color="text-white" />
        <StatCard label="Critical" value={criticalCount} color="text-red-400" />
        <StatCard label="High" value={highCount} color="text-orange-400" />
        <StatCard label="Alerts" value={alerts.length} color="text-yellow-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
        {['anomalies', 'alerts'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t === 'anomalies' ? `Anomalies (${anomalies.length})` : `Alerts (${alerts.length})`}
          </button>
        ))}
      </div>

      {/* Severity filters */}
      <div className="flex flex-wrap gap-2">
        {SEVERITY_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setSeverityFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border transition-colors ${
              severityFilter === f
                ? 'bg-blue-600/25 border-blue-500/50 text-blue-300'
                : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {tab === 'anomalies' ? (
        <div className="space-y-2">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-sm">No anomalies for selected filter</p>
            </div>
          ) : (
            filteredAnomalies.map(anomaly => (
              <div key={anomaly.id} className="card hover:border-gray-600/70 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${getSeverityBg(anomaly.severity)}`}>{anomaly.severity}</span>
                    <span className="text-sm font-semibold text-gray-200">{anomaly.satelliteName}</span>
                    <span className="text-xs text-gray-500 font-mono">{anomaly.type?.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatAgo(anomaly.detectedAt)}</span>
                </div>
                <p className="text-sm text-gray-200 font-medium mb-1">{anomaly.condition}</p>
                <p className="text-xs text-gray-400 mb-2">{anomaly.explanation}</p>
                {anomaly.recommendedAction && (
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
                    → {anomaly.recommendedAction}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-sm">No alerts for selected filter</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id || alert.anomalyId} className="card hover:border-gray-600/70 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${getSeverityBg(alert.severity)}`}>{alert.severity}</span>
                    <span className="text-sm font-semibold text-gray-200">{alert.satelliteName}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatAgo(alert.createdAt || alert.detectedAt)}</span>
                </div>
                <p className="text-sm text-gray-200 font-medium mb-1">{alert.title || alert.condition}</p>
                <p className="text-xs text-gray-400">{alert.message || alert.explanation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card">
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}
