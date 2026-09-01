import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend, Title
)

const CHART_DEFAULTS = {
  plugins: {
    legend: {
      labels: { color: '#9ca3af', font: { size: 12 } },
    },
  },
  scales: {
    x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(75,85,99,0.25)' } },
    y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(75,85,99,0.25)' } },
  },
}

export default function Analytics({ satellites, anomalies, spaceWeather, loading }) {
  if (loading) return <LoadingSpinner message="Loading analytics..." />

  // Health distribution
  const healthCounts = { HEALTHY: 0, WARNING: 0, DEGRADED: 0, CRITICAL: 0 }
  satellites.forEach(s => { if (healthCounts[s.health?.status] !== undefined) healthCounts[s.health.status]++ })

  const healthChartData = {
    labels: Object.keys(healthCounts),
    datasets: [{
      data: Object.values(healthCounts),
      backgroundColor: ['rgba(34,197,94,0.7)', 'rgba(234,179,8,0.7)', 'rgba(249,115,22,0.7)', 'rgba(239,68,68,0.7)'],
      borderColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
      borderWidth: 2,
    }],
  }

  // Risk distribution
  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
  satellites.forEach(s => { if (riskCounts[s.health?.riskLevel] !== undefined) riskCounts[s.health.riskLevel]++ })

  const riskChartData = {
    labels: Object.keys(riskCounts),
    datasets: [{
      label: 'Satellites by Risk',
      data: Object.values(riskCounts),
      backgroundColor: ['rgba(34,197,94,0.6)', 'rgba(234,179,8,0.6)', 'rgba(249,115,22,0.6)', 'rgba(239,68,68,0.6)'],
      borderColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  // Altitude distribution
  const sortedBySat = [...satellites].sort((a, b) => a.altitude - b.altitude)
  const altChartData = {
    labels: sortedBySat.map(s => s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name),
    datasets: [{
      label: 'Altitude (km)',
      data: sortedBySat.map(s => s.altitude),
      backgroundColor: 'rgba(59,130,246,0.5)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  // Anomaly severity distribution
  const anomalyCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  anomalies.forEach(a => { if (anomalyCounts[a.severity] !== undefined) anomalyCounts[a.severity]++ })

  const anomalyChartData = {
    labels: Object.keys(anomalyCounts),
    datasets: [{
      label: 'Anomalies by Severity',
      data: Object.values(anomalyCounts),
      backgroundColor: ['rgba(239,68,68,0.6)', 'rgba(249,115,22,0.6)', 'rgba(234,179,8,0.6)', 'rgba(59,130,246,0.6)'],
      borderColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  // Velocity by satellite
  const velChartData = {
    labels: satellites.map(s => s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name),
    datasets: [{
      label: 'Velocity (km/s)',
      data: satellites.map(s => s.velocity),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#06b6d4',
      pointRadius: 4,
    }],
  }

  const commonBarOptions = {
    ...CHART_DEFAULTS,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 } },
    },
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h2 className="card-title">Fleet Analytics</h2>

      {/* Row 1: Doughnuts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-title mb-3">Health Distribution</div>
          <div className="h-48">
            <Doughnut data={healthChartData} options={doughnutOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-3">Anomaly Severity</div>
          <div className="h-48">
            <Doughnut data={{
              labels: Object.keys(anomalyCounts),
              datasets: [{
                data: Object.values(anomalyCounts),
                backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(249,115,22,0.7)', 'rgba(234,179,8,0.7)', 'rgba(59,130,246,0.7)'],
                borderColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
                borderWidth: 2,
              }]
            }} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Bars */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-title mb-3">Satellite Altitudes (km)</div>
          <div className="h-56">
            <Bar data={altChartData} options={{
              ...commonBarOptions,
              scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, title: { display: true, text: 'km', color: '#6b7280' } } }
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-3">Risk Level Distribution</div>
          <div className="h-56">
            <Bar data={riskChartData} options={commonBarOptions} />
          </div>
        </div>
      </div>

      {/* Row 3: Velocity line */}
      <div className="card">
        <div className="card-title mb-3">Orbital Velocities (km/s)</div>
        <div className="h-48">
          <Line data={velChartData} options={{
            ...commonBarOptions,
            plugins: { ...commonBarOptions.plugins, legend: { display: false } },
          }} />
        </div>
      </div>

      {/* Space weather indicators */}
      {spaceWeather && (
        <div className="card">
          <div className="card-title mb-3">Space Weather Indicators</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WeatherMetric label="Kp Index" value={spaceWeather.kpIndex?.toFixed(1)} max={9} color="#eab308" />
            <WeatherMetric label="Solar Wind (km/s)" value={spaceWeather.solarWindSpeed} max={800} color="#3b82f6" />
            <WeatherMetric label="SW Density (p/cm³)" value={spaceWeather.solarWindDensity?.toFixed(1)} max={20} color="#06b6d4" />
            <WeatherMetric label="Anomalies" value={anomalies.length} max={Math.max(anomalies.length, 20)} color="#ef4444" />
          </div>
        </div>
      )}
    </div>
  )
}

function WeatherMetric({ label, value, max, color }) {
  const pct = Math.min((Number(value) / max) * 100, 100)
  return (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xl font-bold font-mono mb-2" style={{ color }}>{value ?? 'N/A'}</div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
