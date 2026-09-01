import { useState } from 'react'
import SatelliteCard from '../components/SatelliteCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const STATUS_FILTERS = ['ALL', 'HEALTHY', 'WARNING', 'DEGRADED', 'CRITICAL']
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'altitude', label: 'Altitude' },
  { value: 'lastUpdate', label: 'Last Update' },
]

const STATUS_PRIORITY = { CRITICAL: 0, DEGRADED: 1, WARNING: 2, HEALTHY: 3, UNKNOWN: 4 }

export default function SatelliteExplorer({ satellites, loading, error, refresh }) {
  const [filter, setFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('status')
  const [search, setSearch] = useState('')

  if (loading) return <LoadingSpinner message="Loading satellites..." />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const filtered = satellites
    .filter(s => filter === 'ALL' || s.health?.status === filter)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || String(s.noradId).includes(search))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'status') return (STATUS_PRIORITY[a.health?.status] ?? 4) - (STATUS_PRIORITY[b.health?.status] ?? 4)
      if (sortBy === 'altitude') return b.altitude - a.altitude
      if (sortBy === 'lastUpdate') return new Date(b.lastUpdate) - new Date(a.lastUpdate)
      return 0
    })

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or NORAD ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition-colors border ${
              filter === f
                ? 'bg-blue-600/25 border-blue-500/50 text-blue-300'
                : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            {f}
            {f !== 'ALL' && (
              <span className="ml-1.5 text-gray-500">
                ({satellites.filter(s => s.health?.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {satellites.length} satellites
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-3xl mb-2">🛰</div>
          <p className="text-sm">No satellites match your filter</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(sat => <SatelliteCard key={sat.id} satellite={sat} />)}
        </div>
      )}
    </div>
  )
}
