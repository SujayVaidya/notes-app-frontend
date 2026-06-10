import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { renderWithProviders, createMockCategory } from '@/test/utils'
import { CreateNoteDialog } from '@/components/notes/CreateNoteDialog'
import { useUIStore } from '@/stores/uiStore'

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))
vi.mock('@/hooks/useNotes', () => ({
  useCreateNote: () => ({ mutate: mockMutate, isPending: false }),
}))
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      createMockCategory({ _id: 'cat-1', name: 'General', isDefault: true }),
      createMockCategory({ _id: 'cat-2', name: 'Work', isDefault: false }),
    ],
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  useUIStore.setState({ activeCategoryId: 'cat-1' })
})

function createUser() {
  return userEvent.setup({ delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never })
}

describe('CreateNoteDialog', () => {
  it('renders the title input and type options when open', () => {
    renderWithProviders(<CreateNoteDialog open onOpenChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Note title...')).toBeInTheDocument()
    expect(screen.getByText('Plain Text')).toBeInTheDocument()
    expect(screen.getByText('Markdown')).toBeInTheDocument()
  })

  it('shows validation error when title is empty', async () => {
    renderWithProviders(<CreateNoteDialog open onOpenChange={vi.fn()} />)
    const user = createUser()
    await user.click(screen.getByRole('button', { name: /create note/i }))
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('submits with correct data on valid input', async () => {
    renderWithProviders(<CreateNoteDialog open onOpenChange={vi.fn()} />)
    const user = createUser()
    await user.type(screen.getByPlaceholderText('Note title...'), 'My New Note')
    await user.click(screen.getByRole('button', { name: /create note/i }))
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My New Note', noteType: 'text' }),
        expect.anything()
      )
    })
  })

  it('defaults noteType to plain text', () => {
    renderWithProviders(<CreateNoteDialog open onOpenChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /plain text/i })).toBeChecked()
  })

  it('does not render content when closed', () => {
    renderWithProviders(<CreateNoteDialog open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByPlaceholderText('Note title...')).not.toBeInTheDocument()
  })
})
