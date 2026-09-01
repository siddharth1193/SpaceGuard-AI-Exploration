import { describe, it, expect } from 'vitest'
import { getStatusColor, getRiskColor, formatAgo } from './colors'

describe('color utils', () => {
  it('getStatusColor returns correct classes', () => {
    expect(getStatusColor('HEALTHY')).toBe('text-green-400')
    expect(getStatusColor('WARNING')).toBe('text-yellow-400')
    expect(getStatusColor('DEGRADED')).toBe('text-orange-400')
    expect(getStatusColor('CRITICAL')).toBe('text-red-400')
    expect(getStatusColor('UNKNOWN')).toBe('text-gray-400')
  })

  it('getRiskColor returns correct classes', () => {
    expect(getRiskColor('LOW')).toBe('text-green-400')
    expect(getRiskColor('MEDIUM')).toBe('text-yellow-400')
    expect(getRiskColor('HIGH')).toBe('text-orange-400')
    expect(getRiskColor('CRITICAL')).toBe('text-red-400')
  })

  it('formatAgo formats time correctly', () => {
    const now = Date.now()
    expect(formatAgo(new Date(now).toISOString())).toBe('Just now')
    expect(formatAgo(new Date(now - 15 * 60000).toISOString())).toBe('15m ago')
    expect(formatAgo(new Date(now - 5 * 3600000).toISOString())).toBe('5h ago')
    expect(formatAgo(new Date(now - 48 * 3600000).toISOString())).toBe('2d ago')
  })
})
