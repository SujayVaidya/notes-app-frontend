import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { CreateCategoryDialog } from '@/components/categories/CreateCategoryDialog'

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))
vi.mock('@/hooks/useCategories', () => ({
  useCreateCategory: () => ({ mutate: mockMutate, isPending: false }),
}))

beforeEach(() => vi.clearAllMocks())

function createUser() {
  return userEvent.setup({ delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never })
}

describe('CreateCategoryDialog', () => {
  it('renders the name input when open', () => {
    renderWithProviders(<CreateCategoryDialog open onOpenChange={vi.fn()} />)
    expect(screen.getByPlaceholderText(/e\.g\. Work/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(<CreateCategoryDialog open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByPlaceholderText(/e\.g\. Work/i)).not.toBeInTheDocument()
  })

  it('shows error when name is too short (< 2 chars)', async () => {
    renderWithProviders(<CreateCategoryDialog open onOpenChange={vi.fn()} />)
    const user = createUser()
    await user.type(screen.getByRole('textbox'), 'x')
    await user.click(screen.getByRole('button', { name: /^create$/i }))
    await waitFor(() => {
      expect(screen.getByText(/min 2 characters/i)).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows error when name exceeds 50 characters', async () => {
    renderWithProviders(<CreateCategoryDialog open onOpenChange={vi.fn()} />)
    const user = createUser()
    await user.type(screen.getByRole('textbox'), 'a'.repeat(51))
    await user.click(screen.getByRole('button', { name: /^create$/i }))
    await waitFor(() => {
      expect(screen.getByText(/max 50 characters/i)).toBeInTheDocument()
    })
  })

  it('calls mutate with the name on valid submit', async () => {
    renderWithProviders(<CreateCategoryDialog open onOpenChange={vi.fn()} />)
    const user = createUser()
    await user.type(screen.getByRole('textbox'), 'Work')
    await user.click(screen.getByRole('button', { name: /^create$/i }))
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ name: 'Work' }, expect.anything())
    })
  })
})
