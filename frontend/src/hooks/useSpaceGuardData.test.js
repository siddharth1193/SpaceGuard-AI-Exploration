import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSpaceGuardData } from './useSpaceGuardData'
import * as api from '../services/api'
import * as socketService from '../services/socket'

// Mock dependencies
vi.mock('../services/api')
vi.mock('../services/socket')

describe('useSpaceGuardData', () => {
  let mockSocket;

  beforeEach(() => {
    vi.resetAllMocks()

    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    }
    socketService.getSocket.mockReturnValue(mockSocket)

    // Default successful API responses
    api.fetchSatellites.mockResolvedValue({ data: [{ id: 'sat-1', name: 'Sat 1' }] })
    api.fetchHealth.mockResolvedValue({ data: { HEALTHY: 1, total: 1 } })
    api.fetchAnomalies.mockResolvedValue({ data: [{ id: 'anom-1', severity: 'HIGH' }] })
    api.fetchAlerts.mockResolvedValue({ data: [{ id: 'alert-1' }] })
    api.fetchSpaceWeather.mockResolvedValue({ data: { kpIndex: 2 } })
  })

  it('initially sets loading to true and fetches all data', async () => {
    const { result } = renderHook(() => useSpaceGuardData())

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Data should be populated
    expect(result.current.satellites).toEqual([{ id: 'sat-1', name: 'Sat 1' }])
    expect(result.current.healthSummary).toEqual({ HEALTHY: 1, total: 1 })
    expect(result.current.anomalies).toEqual([{ id: 'anom-1', severity: 'HIGH' }])
    expect(result.current.alerts).toEqual([{ id: 'alert-1' }])
    expect(result.current.spaceWeather).toEqual({ kpIndex: 2 })
    
    // Last update should be a Date
    expect(result.current.lastUpdate).toBeInstanceOf(Date)
  })

  it('handles API failure state correctly', async () => {
    api.fetchSatellites.mockRejectedValue(new Error('API is down'))

    const { result } = renderHook(() => useSpaceGuardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('API is down')
    expect(result.current.satellites).toEqual([])
  })

  it('listens to socket updates', async () => {
    const { result } = renderHook(() => useSpaceGuardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSocket.on).toHaveBeenCalledWith('satellite:update', expect.any(Function))

    // Simulate socket event
    const updateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'satellite:update')[1]
    
    const now = new Date().toISOString()
    act(() => {
      updateHandler({
        satellites: [{ id: 'sat-1', name: 'Sat 1 Updated' }],
        timestamp: now
      })
    })

    expect(result.current.satellites).toEqual([{ id: 'sat-1', name: 'Sat 1 Updated' }])
    expect(result.current.lastUpdate.toISOString()).toBe(new Date(now).toISOString())
  })
})
