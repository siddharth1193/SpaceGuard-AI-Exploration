import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSatellite, analyzeWithAI } from '../services/api'
import { getStatusBg, getRiskColor, getSeverityBg, formatAgo, formatNumber } from '../utils/colors'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

export default function SatelliteDetail() {
  const { id } = useParams()
  const [satellite, setSatellite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchSatellite(id)
        setSatellite(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function runAIAnalysis() {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await analyzeWithAI(id)
      setAiAnalysis(res.data)
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading satellite data..." />
  if (error) return <ErrorState message={error} />
  if (!satellite) return null

  const health = satellite.health || {}
  const anomalies = satellite.anomalies || []

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link to="/satellites" className="hover:text-gray-200">Satellites</Link>
        <span>/</span>
        <span className="text-gray-200">{satellite.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{satellite.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-400 font-mono">NORAD {satellite.noradId}</span>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-400">{satellite.type}</span>
            <span className="demo-badge">DEMO</span>
          </div>
        </div>
        <span className={`status-badge text-base px-3 py-1.5 ${getStatusBg(health.status)}`}>
          {health.status}
        </span>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Telemetry */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Telemetry</span>
          </div>
          <div className="space-y-0">
            <TelRow label="Latitude" value={`${formatNumber(satellite.lat, 4)}°`} />
            <TelRow label="Longitude" value={`${formatNumber(satellite.lng, 4)}°`} />
            <TelRow label="Altitude" value={`${Number(satellite.altitude).toLocaleString()} km`} />
            <TelRow label="Velocity" value={`${formatNumber(satellite.velocity)} km/s`} />
            <TelRow label="Orbital Period" value={`${formatNumber(satellite.orbitalPeriod)} min`} />
            <TelRow label="Inclination" value={`${formatNumber(satellite.inclination)}°`} />
            <TelRow label="Last Update" value={formatAgo(satellite.lastUpdate)} />
            <TelRow label="Data Source" value={satellite.dataSource} />
          </div>
        </div>

        {/* Health */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Health Assessment</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="data-label">Status</span>
              <span className={`status-badge ${getStatusBg(health.status)}`}>{health.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="data-label">Risk Level</span>
              <span className={`text-sm font-bold ${getRiskColor(health.riskLevel)}`}>{health.riskLevel}</span>
            </div>
          </div>

          {health.issues && health.issues.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Detected Issues</div>
              <ul className="space-y-1.5">
                {health.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-yellow-300 flex gap-2">
                    <span className="text-yellow-500 flex-none">⚠</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {health.explanation && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Assessment</div>
              <p className="text-xs text-gray-300 leading-relaxed">{health.explanation}</p>
            </div>
          )}

          {health.recommendedAction && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-blue-400 uppercase tracking-wide mb-1">Recommended Action</div>
              <p className="text-xs text-blue-200">{health.recommendedAction}</p>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">AI Analysis</span>
            {aiAnalysis && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                aiAnalysis.source === 'WATSONX'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-purple-500/20 text-purple-300'
              }`}>
                {aiAnalysis.source}
              </span>
            )}
          </div>

          {!aiAnalysis && !aiLoading && !aiError && (
            <div className="text-center py-8">
              <div className="text-2xl mb-3">🤖</div>
              <p className="text-xs text-gray-400 mb-4">
                Generate an AI-powered operational assessment for this satellite using IBM Granite.
              </p>
              <button onClick={runAIAnalysis} className="btn-primary">
                Analyze with AI
              </button>
            </div>
          )}

          {aiLoading && (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-3" />
              <p className="text-xs text-gray-400">Generating AI analysis...</p>
            </div>
          )}

          {aiError && (
            <div className="space-y-3">
              <p className="text-xs text-red-400">Analysis failed: {aiError}</p>
              <button onClick={runAIAnalysis} className="btn-secondary text-xs">Retry</button>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-200 leading-relaxed">{aiAnalysis.analysis}</p>
              </div>
              <div className="data-row">
                <span className="data-label">Primary Risk</span>
                <span className="text-xs text-orange-300 text-right max-w-[60%]">{aiAnalysis.primaryRisk}</span>
              </div>
              {aiAnalysis.recommendedAction && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-xs text-blue-400 mb-1">Action</div>
                  <p className="text-xs text-blue-200">{aiAnalysis.recommendedAction}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Generated: {formatAgo(aiAnalysis.generatedAt)}
              </div>
              <button onClick={runAIAnalysis} className="btn-secondary text-xs w-full">
                Regenerate Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Anomalies</span>
            <span className="text-xs text-gray-400">{anomalies.length} detected</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`status-badge ${getSeverityBg(anomaly.severity)}`}>{anomaly.severity}</span>
                  <span className="text-xs text-gray-300 font-medium">{anomaly.type?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-gray-300 mb-1">{anomaly.condition}</p>
                <p className="text-xs text-gray-400">{anomaly.explanation}</p>
                {anomaly.recommendedAction && (
                  <p className="mt-2 text-xs text-blue-400">→ {anomaly.recommendedAction}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TelRow({ label, value }) {
  return (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <span className="data-value">{value}</span>
    </div>
  )
}
