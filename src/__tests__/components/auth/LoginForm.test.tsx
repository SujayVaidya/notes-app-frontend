import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { LoginForm } from '@/components/auth/LoginForm'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: vi.fn().mockReturnValue(vi.fn()) }
})

const { mockSignIn } = vi.hoisted(() => ({ mockSignIn: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useSignIn: () => mockSignIn }))

beforeEach(() => vi.clearAllMocks())

function createUser() {
  // delay:null = synchronous, PointerEventsCheckLevel.Never = skip elementFromPoint check
  // (jsdom has no CSS layout so elementFromPoint always returns wrong element)
  return userEvent.setup({ delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never })
}

async function fillAndSubmit(user: ReturnType<typeof createUser>, email: string, password: string) {
  await user.type(screen.getByLabelText(/email/i), email)
  await user.type(screen.getByLabelText(/password/i), password)
  await user.click(screen.getByRole('button', { name: /sign in/i }))
}

describe('LoginForm', () => {
  it('renders email and password fields with submit button', () => {
    renderWithProviders(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginForm />)
    const user = createUser()
    await fillAndSubmit(user, 'not-an-email', 'password123')
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('shows validation error for short password', async () => {
    renderWithProviders(<LoginForm />)
    const user = createUser()
    await fillAndSubmit(user, 'good@email.com', 'abc')
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument()
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('calls signIn with email and password on valid submit', async () => {
    mockSignIn.mockResolvedValue(undefined)
    renderWithProviders(<LoginForm />)
    const user = createUser()
    await fillAndSubmit(user, 'test@example.com', 'password123')
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows error toast when sign in throws', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'))
    renderWithProviders(<LoginForm />)
    const user = createUser()
    await fillAndSubmit(user, 'test@example.com', 'password123')
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})
