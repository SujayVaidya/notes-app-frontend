import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// ── Module mocks (must be hoisted above imports) ──────────────────────────────

vi.mock('@/config/env', () => ({
  env: { API_BASE_URL: 'http://test.api' },
}))

const mockSetSession = vi.fn()
vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      session: { access_token: 'test-token' },
      setSession: mockSetSession,
    })),
  },
}))

// Import the REAL api module so we can test its interceptors
import api from '@/services/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

type MockAdapterFn = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>

function setAdapter(fn: MockAdapterFn) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(api.defaults as any).adapter = fn
}

function makeNetworkError(config: InternalAxiosRequestConfig) {
  const err = Object.assign(new Error('Network Error'), {
    isAxiosError: true,
    config,
    response: undefined,
    code: 'ERR_NETWORK',
  })
  return Promise.reject(err)
}

function makeHttpError(status: number, config: InternalAxiosRequestConfig) {
  const err = Object.assign(new Error(`Request failed with status ${status}`), {
    isAxiosError: true,
    config,
    response: {
      status,
      data: { message: `Error ${status}` },
      headers: {},
    },
    code: 'ERR_BAD_RESPONSE',
  })
  return Promise.reject(err)
}

function makeSuccess(data: unknown, config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse)
}

let originalAdapter: unknown
beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalAdapter = (api.defaults as any).adapter
})
afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(api.defaults as any).adapter = originalAdapter
  vi.useRealTimers()
  delete (window as Window & { location: Location }).location
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  })
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('api response interceptor', () => {
  describe('success path', () => {
    it('extracts res.data from a successful response', async () => {
      setAdapter((config) => makeSuccess({ success: true, data: [{ id: 1 }] }, config))
      const result = await api.get('/notes')
      expect(result).toEqual({ success: true, data: [{ id: 1 }] })
    })
  })

  describe('retry on transient failure', () => {
    it('retries a network error up to 2 times and succeeds on the 3rd attempt', async () => {
      let callCount = 0
      setAdapter(async (config) => {
        callCount++
        if (callCount <= 2) return makeNetworkError(config)
        return makeSuccess({ recovered: true }, config)
      })

      const promise = api.get('/test')
      await vi.advanceTimersByTimeAsync(2000) // advance past both retry delays (300 + 600 ms)
      const result = await promise

      expect(result).toEqual({ recovered: true })
      expect(callCount).toBe(3)
    })

    it('retries a 500 server error up to 2 times', async () => {
      let callCount = 0
      setAdapter(async (config) => {
        callCount++
        if (callCount <= 2) return makeHttpError(500, config)
        return makeSuccess({ ok: true }, config)
      })

      const promise = api.get('/test')
      await vi.advanceTimersByTimeAsync(2000)
      await promise

      expect(callCount).toBe(3)
    })

    it('rejects after exhausting all retries (3 total attempts)', async () => {
      let callCount = 0
      setAdapter(async (config) => {
        callCount++
        return makeNetworkError(config)
      })

      const promise = api.get('/test')
      await vi.advanceTimersByTimeAsync(2000)
      await expect(promise).rejects.toBeDefined()
      expect(callCount).toBe(3) // 1 original + 2 retries
    })

    it('does NOT retry a 404 Not Found error', async () => {
      let callCount = 0
      setAdapter(async (config) => {
        callCount++
        return makeHttpError(404, config)
      })

      const promise = api.get('/missing')
      await vi.advanceTimersByTimeAsync(2000)
      await expect(promise).rejects.toBeDefined()
      expect(callCount).toBe(1) // no retries for 4xx
    })

    it('does NOT retry a 400 Bad Request error', async () => {
      let callCount = 0
      setAdapter(async (config) => {
        callCount++
        return makeHttpError(400, config)
      })

      const promise = api.post('/notes', {})
      await vi.advanceTimersByTimeAsync(2000)
      await expect(promise).rejects.toBeDefined()
      expect(callCount).toBe(1)
    })

    it('applies increasing delays between retries', async () => {
      const delays: number[] = []
      let callCount = 0
      let lastCallTime = Date.now()

      setAdapter(async (config) => {
        const now = Date.now()
        if (callCount > 0) delays.push(now - lastCallTime)
        lastCallTime = now
        callCount++
        if (callCount <= 2) return makeNetworkError(config)
        return makeSuccess({}, config)
      })

      const promise = api.get('/test')
      await vi.advanceTimersByTimeAsync(2000)
      await promise

      // First retry delay should be shorter than the second (300ms vs 600ms)
      expect(delays[0]).toBeLessThan(delays[1])
    })
  })

  describe('401 Unauthorized handling', () => {
    it('clears the auth session on 401', async () => {
      setAdapter(async (config) => makeHttpError(401, config))
      const promise = api.get('/secure')
      await vi.advanceTimersByTimeAsync(2000)
      await expect(promise).rejects.toBeDefined()
      expect(mockSetSession).toHaveBeenCalledWith(null)
    })

    it('redirects to /auth on 401', async () => {
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
        configurable: true,
      })
      setAdapter(async (config) => makeHttpError(401, config))
      const promise = api.get('/secure')
      await vi.advanceTimersByTimeAsync(2000)
      await expect(promise).rejects.toBeDefined()
      expect(window.location.href).toBe('/auth')
    })
  })

  describe('error shape propagation', () => {
    it('propagates the response body on non-retryable errors', async () => {
      setAdapter(async (config) => makeHttpError(422, config))
      const promise = api.post('/validate', {})
      await vi.advanceTimersByTimeAsync(200)
      const err = await promise.catch((e: unknown) => e)
      expect((err as { message: string }).message).toBe('Error 422')
    })
  })
})

describe('api request interceptor', () => {
  it('attaches Bearer token from auth store to every request', async () => {
    const capturedHeaders: Record<string, string>[] = []

    setAdapter(async (config) => {
      capturedHeaders.push({ ...(config.headers as Record<string, string>) })
      return makeSuccess({}, config)
    })

    await api.get('/notes')
    expect(capturedHeaders[0]['Authorization']).toBe('Bearer test-token')
  })
})
