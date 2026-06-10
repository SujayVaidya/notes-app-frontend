import '@testing-library/jest-dom'
import React from 'react'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Required for React 18 act() to work properly in vitest
globalThis.IS_REACT_ACT_ENVIRONMENT = true

afterEach(() => {
  cleanup()
})

// ── jsdom polyfills ────────────────────────────────────────────────────────

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null
  rootMargin = ''
  thresholds = []
} as unknown as typeof IntersectionObserver

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// scrollIntoView not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn()
// hasPointerCapture not implemented in jsdom (Radix UI uses it)
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.setPointerCapture = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
        const { animate: _a, initial: _i, exit: _e, transition: _t, whileInView: _w, variants: _v, ...rest } = props as Record<string, unknown>
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
      },
      span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
        const { animate: _a, initial: _i, exit: _e, transition: _t, whileInView: _w, variants: _v, ...rest } = props as Record<string, unknown>
        return <span {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>{children}</span>
      },
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAnimationFrame: vi.fn(),
    useMotionValue: () => ({ get: vi.fn(), set: vi.fn(), getPrevious: vi.fn(() => 0) }),
    useTransform: vi.fn(() => ({ get: vi.fn() })),
    useSpring: vi.fn(() => ({ get: vi.fn() })),
    useMotionTemplate: vi.fn(() => ''),
    useScroll: vi.fn(() => ({ scrollYProgress: { get: vi.fn(() => 0), getPrevious: vi.fn(() => 0) } })),
    useMotionValueEvent: vi.fn(),
    stagger: vi.fn(),
    useAnimate: vi.fn(() => [{ current: null }, vi.fn()]),
  }
})

// Mock @uiw/react-md-editor
vi.mock('@uiw/react-md-editor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="md-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))
