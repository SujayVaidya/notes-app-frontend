import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { SignupForm } from '@/components/auth/SignupForm'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const { mockSignUp } = vi.hoisted(() => ({ mockSignUp: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useSignUp: () => mockSignUp }))

beforeEach(() => vi.clearAllMocks())

function createUser() {
  return userEvent.setup({ delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never })
}

async function fillAndSubmit(
  user: ReturnType<typeof createUser>,
  email: string,
  password: string,
  confirm: string,
) {
  await user.type(screen.getByLabelText(/email/i), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.type(screen.getByLabelText(/confirm password/i), confirm)
  await user.click(screen.getByRole('button', { name: /create account/i }))
}

describe('SignupForm', () => {
  it('renders all three fields and the submit button', () => {
    renderWithProviders(<SignupForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<SignupForm />)
    const user = createUser()
    await fillAndSubmit(user, 'user@test.com', 'password123', 'different123')
    await waitFor(() => {
      expect(screen.getByText(/don't match/i)).toBeInTheDocument()
    })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error for password shorter than 6 chars', async () => {
    renderWithProviders(<SignupForm />)
    const user = createUser()
    await fillAndSubmit(user, 'user@test.com', 'abc', 'abc')
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('calls signUp when form is valid', async () => {
    mockSignUp.mockResolvedValue(undefined)
    renderWithProviders(<SignupForm />)
    const user = createUser()
    await fillAndSubmit(user, 'user@test.com', 'password123', 'password123')
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('user@test.com', 'password123')
    })
  })

  it('shows error toast when signUp throws', async () => {
    mockSignUp.mockRejectedValue(new Error('Email taken'))
    renderWithProviders(<SignupForm />)
    const user = createUser()
    await fillAndSubmit(user, 'user@test.com', 'password123', 'password123')
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email taken')
    })
  })
})
