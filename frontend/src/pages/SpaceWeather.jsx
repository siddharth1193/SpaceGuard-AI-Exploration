import { useState, useEffect } from 'react'
import { fetchSpaceWeather, chatWithAI } from '../services/api'
import { getAlertLevelBg, getAlertLevelColor, formatAgo } from '../utils/colors'
import LoadingSpinner from '../components/LoadingSpinner'

const KP_LABELS = {
  0: 'Quiet', 1: 'Quiet', 2: 'Quiet', 3: 'Unsettled', 4: 'Active',
  5: 'Minor Storm', 6: 'Moderate Storm', 7: 'Strong Storm', 8: 'Severe Storm', 9: 'Extreme Storm'
}

function KpGauge({ kp }) {
  const level = Math.min(Math.round(kp), 9)
  const pct = (kp / 9) * 100
  const color = kp < 3 ? '#22c55e' : kp < 5 ? '#eab308' : kp < 7 ? '#f97316' : '#ef4444'

  return (
    <div className="relative pt-2">
      <div className="flex items-end justify-between mb-2">
        <span className="text-3xl font-bold font-mono" style={{ color }}>{kp?.toFixed(1)}</span>
        <span className="text-xs text-gray-400">{KP_LABELS[level] || 'Unknown'}</span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0</span>
        <span>3</span>
        <span>5</span>
        <span>7</span>
        <span>9</span>
      </div>
    </div>
  )
}

export default function SpaceWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiExplanation, setAiExplanation] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetchSpaceWeather()
      .then(res => setWeather(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function generateWeatherAI() {
    if (!weather) return
    setAiLoading(true)
    try {
      const res = await chatWithAI([{
        role: 'user',
        content: `Explain how the current space weather conditions (Kp=${weather.kpIndex?.toFixed(1)}, alert level ${weather.alertLevel}, solar wind ${weather.solarWindSpeed} km/s) could affect satellite operations. Be specific and concise.`
      }], true)
      setAiExplanation(res.data)
    } catch (e) {
      setAiExplanation({ content: 'Failed to generate explanation.', source: 'ERROR' })
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading space weather data..." />

  if (!weather) return (
    <div className="p-6 text-center text-gray-400">
      <p>No space weather data available.</p>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Alert banner */}
      {weather.geomagneticStorm && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-lg">
          <span className="text-red-400 text-xl">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-300">Geomagnetic Storm Active</p>
            <p className="text-xs text-red-400/80">Elevated satellite risk. Monitor affected assets closely.</p>
          </div>
        </div>
      )}

      {/* Source badge */}
      <div className="flex items-center gap-3">
        <h2 className="card-title">Space Weather Dashboard</h2>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
          weather.source === 'NOAA'
            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
            : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
        }`}>
          {weather.source} {weather.source !== 'NOAA' && '· DEMO'}
        </span>
        <span className="text-xs text-gray-500 ml-auto">Updated {formatAgo(weather.lastUpdate)}</span>
      </div>

      {/* Metrics grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Kp Index */}
        <div className="card md:col-span-1">
          <div className="card-title mb-3">Geomagnetic Activity (Kp)</div>
          <KpGauge kp={weather.kpIndex} />
        </div>

        {/* Alert level */}
        <div className="card">
          <div className="card-title mb-3">Alert Level</div>
          <div className={`inline-block px-4 py-2 rounded-lg text-2xl font-bold font-mono mb-2 ${getAlertLevelBg(weather.alertLevel)}`}>
            {weather.alertLevel}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {weather.alertLevel === 'GREEN' && 'Quiet conditions. No significant geomagnetic activity.'}
            {weather.alertLevel === 'YELLOW' && 'Minor activity. Satellites should continue nominal operations.'}
            {weather.alertLevel === 'ORANGE' && 'Moderate storm conditions. Monitor satellite drag and orientation.'}
            {weather.alertLevel === 'RED' && 'Severe geomagnetic storm. High drag, radiation, and orientation risks.'}
          </p>
        </div>

        {/* Solar wind */}
        <div className="card">
          <div className="card-title mb-3">Solar Wind</div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Speed</div>
              <div className="text-2xl font-bold font-mono text-white">{weather.solarWindSpeed} <span className="text-sm font-normal text-gray-400">km/s</span></div>
              <div className="w-full h-1.5 bg-gray-700 rounded mt-2">
                <div className="h-full bg-blue-500 rounded" style={{ width: `${Math.min((weather.solarWindSpeed / 800) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Density</div>
              <div className="text-xl font-bold font-mono text-white">{weather.solarWindDensity?.toFixed(1)} <span className="text-sm font-normal text-gray-400">p/cm³</span></div>
            </div>
          </div>
        </div>

        {/* X-Ray */}
        {weather.xrayFlux && (
          <div className="card">
            <div className="card-title mb-3">X-Ray Flux</div>
            <div className="text-xl font-bold font-mono text-white">{weather.xrayFlux?.toExponential(2)}</div>
            <div className="text-xs text-gray-400 mt-1">W/m²</div>
            <div className="mt-3 text-xs text-gray-400">
              {weather.xrayFlux < 1e-6
                ? 'Background level — no solar flare activity.'
                : weather.xrayFlux < 1e-5
                ? 'M-class flare activity possible.'
                : 'X-class flare conditions — high HF communication disruption risk.'}
            </div>
          </div>
        )}

        {/* Geomagnetic storm */}
        <div className="card">
          <div className="card-title mb-3">Storm Conditions</div>
          <div className={`text-xl font-bold ${weather.geomagneticStorm ? 'text-red-400' : 'text-green-400'}`}>
            {weather.geomagneticStorm ? '⚡ ACTIVE' : '✓ NONE'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {weather.geomagneticStorm
              ? 'Active geomagnetic disturbance. Increased atmospheric drag for LEO satellites. Potential signal interference.'
              : 'No active geomagnetic storm conditions. Normal satellite operations expected.'}
          </p>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">AI Operational Impact Assessment</span>
          {aiExplanation && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              aiExplanation.source === 'WATSONX' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
            }`}>
              {aiExplanation.source}
            </span>
          )}
        </div>

        {!aiExplanation && !aiLoading && (
          <div className="text-center py-8">
            <div className="text-2xl mb-3">🤖</div>
            <p className="text-xs text-gray-400 mb-4">
              Generate an AI explanation of how these space weather conditions could impact satellite operations.
            </p>
            <button onClick={generateWeatherAI} className="btn-primary">
              Generate AI Explanation
            </button>
          </div>
        )}

        {aiLoading && (
          <div className="text-center py-6">
            <div className="spinner mx-auto mb-2" />
            <p className="text-xs text-gray-400">Analyzing space weather impact...</p>
          </div>
        )}

        {aiExplanation && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-200 leading-relaxed">{aiExplanation.content}</p>
            </div>
            <button onClick={generateWeatherAI} className="btn-secondary text-xs">
              Regenerate
            </button>
          </div>
        )}
      </div>

      {/* Reference */}
      <div className="card">
        <div className="card-title mb-3">Kp Index Reference</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { range: '0–2', label: 'Quiet', color: 'text-green-400' },
            { range: '3–4', label: 'Unsettled', color: 'text-yellow-400' },
            { range: '5–6', label: 'Storm', color: 'text-orange-400' },
            { range: '7–8', label: 'Severe', color: 'text-red-400' },
            { range: '9', label: 'Extreme', color: 'text-red-600' },
          ].map(item => (
            <div key={item.range} className="p-2 bg-gray-800/50 rounded text-center">
              <div className={`text-sm font-bold font-mono ${item.color}`}>{item.range}</div>
              <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
