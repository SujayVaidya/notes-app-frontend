import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import type { Note } from '@/types/note'
import type { Category } from '@/types/category'
import type { Session } from '@supabase/supabase-js'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface RenderWithProvidersOptions extends RenderOptions {
  routerProps?: MemoryRouterProps
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: React.ReactElement,
  { routerProps = { initialEntries: ['/'] }, queryClient, ...options }: RenderWithProvidersOptions = {}
) {
  const client = queryClient ?? createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient: client }
}

// ── Factories ──────────────────────────────────────────────────────────────

export function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    _id: 'note-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: 'Test Note',
    markdownContent: 'Hello world',
    plainTextContent: 'Hello world',
    noteType: 'text',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    _id: 'cat-1',
    userId: 'user-1',
    name: 'General',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2025-01-01T00:00:00.000Z',
      app_metadata: {},
      user_metadata: {},
    },
    ...overrides,
  } as Session
}
