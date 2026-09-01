import { NavLink, useLocation } from 'react-router-dom'
import { getSocket } from '../services/socket'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: '⬡' },
  { path: '/satellites', label: 'Satellites', icon: '🛰' },
  { path: '/map', label: 'Map', icon: '🌍' },
  { path: '/space-weather', label: 'Space Weather', icon: '☀' },
  { path: '/anomalies', label: 'Anomalies', icon: '⚠' },
  { path: '/assistant', label: 'AI Assistant', icon: '🤖' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
]

export default function Layout({ children, connectionStatus }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700/50 flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700/50">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white">
              <circle cx="12" cy="12" r="3"/>
              <line x1="3" y1="12" x2="9" y2="12"/>
              <line x1="15" y1="12" x2="21" y2="12"/>
              <line x1="12" y1="3" x2="12" y2="9"/>
              <line x1="12" y1="15" x2="12" y2="21"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">SpaceGuard AI</div>
            <div className="text-xs text-gray-400">Satellite Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/25'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Connection status */}
        <div className="px-4 py-3 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-xs text-gray-400 capitalize">{connectionStatus || 'disconnected'}</span>
          </div>
          <div className="mt-1.5">
            <span className="demo-badge">DEMO DATA</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-none h-14 bg-gray-900/80 backdrop-blur border-b border-gray-700/50 flex items-center gap-4 px-4 lg:px-6">
          <button
            className="lg:hidden p-1.5 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-200 truncate">
              {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'SpaceGuard AI'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="demo-badge hidden sm:flex">DEMO MODE</span>
            <div className="text-xs text-gray-500 hidden md:block font-mono">
              {new Date().toUTCString().slice(0, 25)} UTC
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
