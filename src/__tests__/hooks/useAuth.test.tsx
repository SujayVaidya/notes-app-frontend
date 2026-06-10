import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { createMockSession } from '@/test/utils'
import { supabase } from '@/lib/supabase'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: vi.fn().mockReturnValue(vi.fn()) }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

import { useSignIn, useSignUp, useSignOut, useSession } from '@/hooks/useAuth'

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ session: null, user: null })
  useUIStore.setState({ activeCategoryId: null, activeNoteId: null })
})

describe('useSession', () => {
  it('returns null when no session is set', () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    expect(result.current).toBeNull()
  })

  it('returns the stored session', () => {
    const session = createMockSession()
    useAuthStore.getState().setSession(session)
    const { result } = renderHook(() => useSession(), { wrapper })
    expect(result.current).toBe(session)
  })
})

describe('useSignIn', () => {
  it('sets session and shows welcome toast on success', async () => {
    const session = createMockSession()
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session, user: session.user },
      error: null,
    } as ReturnType<typeof supabase.auth.signInWithPassword> extends Promise<infer R> ? R : never)

    const { result } = renderHook(() => useSignIn(), { wrapper })
    await act(async () => {
      await result.current('test@example.com', 'password123')
    })

    expect(useAuthStore.getState().session).toBe(session)
    expect(toast.success).toHaveBeenCalledWith('Welcome back!')
  })

  it('throws when supabase returns an error', async () => {
    const error = new Error('Invalid credentials')
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null, user: null },
      error,
    } as ReturnType<typeof supabase.auth.signInWithPassword> extends Promise<infer R> ? R : never)

    const { result } = renderHook(() => useSignIn(), { wrapper })
    await expect(result.current('bad@email.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})

describe('useSignUp', () => {
  it('calls supabase signUp and shows confirmation toast', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    } as ReturnType<typeof supabase.auth.signUp> extends Promise<infer R> ? R : never)

    const { result } = renderHook(() => useSignUp(), { wrapper })
    await act(async () => {
      await result.current('new@example.com', 'password123')
    })

    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'password123' })
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Check your email'))
  })

  it('throws when sign up fails', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { session: null, user: null },
      error: new Error('Email already registered'),
    } as ReturnType<typeof supabase.auth.signUp> extends Promise<infer R> ? R : never)

    const { result } = renderHook(() => useSignUp(), { wrapper })
    await expect(result.current('exists@example.com', 'pass')).rejects.toThrow('Email already registered')
  })
})

describe('useSignOut', () => {
  it('clears session and resets UI state', async () => {
    useAuthStore.getState().setSession(createMockSession())
    useUIStore.getState().setActiveNote('note-1')
    useUIStore.getState().setActiveCategory('cat-1')

    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useSignOut(), { wrapper })
    await act(async () => {
      await result.current()
    })

    expect(useAuthStore.getState().session).toBeNull()
    expect(useUIStore.getState().activeNoteId).toBeNull()
    expect(useUIStore.getState().activeCategoryId).toBeNull()
  })
})
