import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestRoute, getRouteStatus, requestAndGetRouteStatus } from '../api'
import { mockRequestRoute, mockGetRouteStatus, mockRequestAndGetRouteStatus } from '../api/mock'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Methods', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('requestRoute', () => {
    it('should successfully request a route and return token', async () => {
      const mockResponse = { token: '9d3503e0-7236-4e47-a62f-8b01b5646c16' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const token = await requestRoute({
        origin: 'Innocentre, Hong Kong',
        destination: 'Hong Kong International Airport Terminal 1'
      })

      expect(token).toBe('9d3503e0-7236-4e47-a62f-8b01b5646c16')
    })

    it('should throw error when request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(requestRoute({
        origin: 'Innocentre, Hong Kong',
        destination: 'Hong Kong International Airport Terminal 1'
      })).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('getRouteStatus', () => {
    it('should return in-progress status', async () => {
      const mockResponse = { status: 'in progress' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const status = await getRouteStatus('mock-token')
      expect(status.status).toBe('in progress')
    })

    it('should return success status with route details', async () => {
      const mockResponse = {
        status: 'success',
        path: [
          ['22.372081', '114.107877'],
          ['22.326442', '114.167811']
        ],
        total_distance: 20000,
        total_time: 1800
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const status = await getRouteStatus('mock-token')
      expect(status.status).toBe('success')
      expect(status).toEqual(mockResponse)
    })

    it('should return failure status with error message', async () => {
      const mockResponse = {
        status: 'failure',
        error: 'Location not accessible by car'
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const status = await getRouteStatus('mock-token')
      expect(status.status).toBe('failure')
      expect(status).toEqual(mockResponse)
    })
  })

  describe('requestAndGetRouteStatus', () => {
    it('should handle successful flow', async () => {
      const tokenResponse = { token: 'mock-token' }
      const statusResponse = {
        status: 'success',
        path: [['22.372081', '114.107877']],
        total_distance: 20000,
        total_time: 1800
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(tokenResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(statusResponse)
        })

      const result = await requestAndGetRouteStatus(
        'Test Origin',
        'Test Destination'
      )

      expect(result).toEqual(statusResponse)
    })

    it('should retry when backend returns in progress', async () => {
      const tokenResponse = { token: 'mock-token' }
      const inProgressResponse = { status: 'in progress' }
      const successResponse = {
        status: 'success',
        path: [['22.372081', '114.107877']],
        total_distance: 20000,
        total_time: 1800
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(tokenResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(inProgressResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(successResponse)
        })

      const result = await requestAndGetRouteStatus(
        'Test Origin',
        'Test Destination',
      )

      expect(result).toEqual(successResponse)
    })

    it('should stop requesting when backend returns error', async () => {
      const tokenResponse = { token: 'mock-token' }
      const errorResponse = {
        status: 'failure',
        error: 'Location not accessible by car'
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(tokenResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(errorResponse)
        })

      await expect(requestAndGetRouteStatus(
        'Test Origin',
        'Test Destination'
      )).rejects.toThrow('Location not accessible by car')
    })

    it('should handle all errors', async () => {
      const tokenResponse = { token: 'mock-token' }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(tokenResponse)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })

      await expect(requestAndGetRouteStatus(
        'Test Origin',
        'Test Destination'
      )).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('Mock API Methods', () => {
    describe('mockRequestRoute', () => {
      it('should return success response', async () => {
        const mockResponse = { token: '9d3503e0-7236-4e47-a62f-8b01b5646c16' }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const token = await mockRequestRoute({
          origin: 'Test Origin',
          destination: 'Test Destination'
        }, 'success')

        expect(token).toBe('9d3503e0-7236-4e47-a62f-8b01b5646c16')
      })

      it('should throw error for 500 status', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500
        })

        await expect(mockRequestRoute({
          origin: 'Test Origin',
          destination: 'Test Destination'
        }, '500')).rejects.toThrow('HTTP error! status: 500')
      })
    })

    describe('mockGetRouteStatus', () => {
      it('should handle success status', async () => {
        const mockResponse = {
          status: 'success',
          path: [['22.372081', '114.107877']],
          total_distance: 20000,
          total_time: 1800
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await mockGetRouteStatus('mock-token', 'success')
        expect(result).toEqual(mockResponse)
      })

      it('should handle in-progress status', async () => {
        const mockResponse = { status: 'in progress' }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await mockGetRouteStatus('mock-token', 'inprogress')
        expect(result).toEqual(mockResponse)
      })

      it('should handle failure status', async () => {
        const mockResponse = {
          status: 'failure',
          error: 'Location not accessible by car'
        }
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await mockGetRouteStatus('mock-token', 'failure')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('mockRequestAndGetRouteStatus', () => {
      it('should handle successful flow', async () => {
        const tokenResponse = { token: 'mock-token' }
        const statusResponse = {
          status: 'success',
          path: [['22.372081', '114.107877']],
          total_distance: 20000,
          total_time: 1800
        }

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(tokenResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(statusResponse)
          })

        const result = await mockRequestAndGetRouteStatus(
          'Test Origin',
          'Test Destination',
          'success',
          'success'
        )

        expect(result).toEqual(statusResponse)
      })

      it('should handle failure flow', async () => {
        const tokenResponse = { token: 'mock-token' }
        const statusResponse = {
          status: 'failure',
          error: 'Location not accessible by car'
        }

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(tokenResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(statusResponse)
          })

        await expect(mockRequestAndGetRouteStatus(
          'Test Origin',
          'Test Destination',
          'success',
          'failure'
        )).rejects.toThrow('Location not accessible by car')
      })
    })
  })
})
