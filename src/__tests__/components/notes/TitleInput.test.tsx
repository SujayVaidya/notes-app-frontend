import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { TitleInput } from '@/components/notes/TitleInput'

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))
vi.mock('@/hooks/useNotes', () => ({
  useUpdateNote: () => ({ mutate: mockMutate }),
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('TitleInput', () => {
  it('renders with the initial title', () => {
    renderWithProviders(<TitleInput noteId="note-1" initialTitle="My Title" />)
    expect(screen.getByDisplayValue('My Title')).toBeInTheDocument()
  })

  it('shows placeholder when title is empty', () => {
    renderWithProviders(<TitleInput noteId="note-1" initialTitle="" />)
    expect(screen.getByPlaceholderText('Untitled')).toBeInTheDocument()
  })

  it('does not call updateNote before debounce delay', () => {
    renderWithProviders(<TitleInput noteId="note-1" initialTitle="Old" />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New Title' } })
    // Immediately after typing — timer has not fired yet
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls updateNote with new value after 800ms debounce', () => {
    renderWithProviders(<TitleInput noteId="note-1" initialTitle="Old" />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated Title' } })
    vi.advanceTimersByTime(800)
    expect(mockMutate).toHaveBeenCalledWith(
      { title: 'Updated Title' },
      expect.anything()
    )
  })

  it('calls onSaveStart when typing begins', () => {
    const onSaveStart = vi.fn()
    renderWithProviders(
      <TitleInput noteId="note-1" initialTitle="Old" onSaveStart={onSaveStart} />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } })
    expect(onSaveStart).toHaveBeenCalled()
  })

  it('resets to new initialTitle when prop changes', () => {
    const { rerender } = renderWithProviders(
      <TitleInput noteId="note-1" initialTitle="First" />
    )
    rerender(<TitleInput noteId="note-1" initialTitle="Second" />)
    expect(screen.getByDisplayValue('Second')).toBeInTheDocument()
  })
})
