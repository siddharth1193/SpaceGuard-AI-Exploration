import { getStatusBg, getAlertLevelBg, getRiskColor, formatAgo } from '../utils/colors'
import { Link } from 'react-router-dom'
import SatelliteCard from '../components/SatelliteCard'
import SpaceWeatherCard from '../components/SpaceWeatherCard'
import AnomalyList from '../components/AnomalyList'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

export default function Overview({ satellites, healthSummary, anomalies, alerts, spaceWeather, loading, error, refresh }) {
  if (loading) return <LoadingSpinner message="Loading satellite data..." />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const criticalCount = satellites.filter(s => s.health?.status === 'CRITICAL').length
  const warningCount = satellites.filter(s => s.health?.status === 'WARNING').length
  const degradedCount = satellites.filter(s => s.health?.status === 'DEGRADED').length
  const healthyCount = satellites.filter(s => s.health?.status === 'HEALTHY').length
  const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH')

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Demo banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/25 rounded-lg">
        <span className="demo-badge">DEMO</span>
        <p className="text-xs text-purple-300">
          Displaying simulated satellite data. Connect real APIs via <code className="text-purple-200">.env</code> to use live data.
        </p>
      </div>

      {/* Fleet status KPIs */}
      <div>
        <h2 className="card-title mb-3">Fleet Status</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Healthy" value={healthyCount} color="text-green-400" bg="bg-green-500/10 border-green-500/20" />
          <KpiCard label="Warning" value={warningCount} color="text-yellow-400" bg="bg-yellow-500/10 border-yellow-500/20" />
          <KpiCard label="Degraded" value={degradedCount} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/20" />
          <KpiCard label="Critical" value={criticalCount} color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 cols: satellites */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Monitored Satellites ({satellites.length})</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {satellites.slice(0, 6).map(sat => (
              <SatelliteCard key={sat.id} satellite={sat} />
            ))}
          </div>
          {satellites.length > 6 && (
            <Link to="/satellites" className="block text-center text-xs text-blue-400 hover:text-blue-300 py-2">
              View all {satellites.length} satellites →
            </Link>
          )}
        </div>

        {/* Right col: weather + anomalies */}
        <div className="space-y-4">
          <SpaceWeatherCard weather={spaceWeather} />

          {/* Active alerts */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Critical Alerts</span>
              {criticalAnomalies.length > 0 && (
                <span className="status-badge bg-red-500/15 border-red-500/25 text-red-400">
                  {criticalAnomalies.length}
                </span>
              )}
            </div>
            <AnomalyList anomalies={criticalAnomalies} maxItems={5} />
          </div>

          {/* Health intelligence summary */}
          {healthSummary && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Health Summary</span>
              </div>
              <div className="space-y-2">
                {['HEALTHY','WARNING','DEGRADED','CRITICAL'].map(status => (
                  healthSummary[status] != null && (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`status-badge ${getStatusBg(status)}`}>{status}</span>
                      <span className="text-sm font-mono text-gray-300">{healthSummary[status]}</span>
                    </div>
                  )
                ))}
              </div>
              {healthSummary.total != null && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Total Monitored</span>
                  <span className={`text-sm font-bold text-white`}>
                    {healthSummary.total}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, color, bg }) {
  return (
    <div className={`card border ${bg}`}>
      <div className={`text-3xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}
