import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@/test/utils'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'
import { createMockSession } from '@/test/utils'

vi.mock('@/lib/supabase')

describe('ProtectedRoute', () => {
  it('redirects to /auth when there is no session', () => {
    useAuthStore.setState({ session: null, user: null })

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<div>Protected content</div>} />
        </Route>
        <Route path="/auth" element={<div>Auth page</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/app'] } }
    )

    expect(screen.getByText('Auth page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when a session exists', () => {
    useAuthStore.setState({ session: createMockSession(), user: { id: 'user-1', email: 'test@example.com' } })

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<div>Protected content</div>} />
        </Route>
        <Route path="/auth" element={<div>Auth page</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/app'] } }
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText('Auth page')).not.toBeInTheDocument()
  })
})
