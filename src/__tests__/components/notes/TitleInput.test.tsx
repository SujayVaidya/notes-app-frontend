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

  it('does NOT reset to new initialTitle when prop changes for the same note', () => {
    // Regression guard: a save round-trip updates the query cache and changes
    // initialTitle for the *same* note. That must not clobber in-progress typing.
    const { rerender } = renderWithProviders(
      <TitleInput noteId="note-1" initialTitle="First" />
    )
    rerender(<TitleInput noteId="note-1" initialTitle="Second" />)
    expect(screen.getByDisplayValue('First')).toBeInTheDocument()
  })

  it('resets to new initialTitle when switching to a different note', () => {
    const { rerender } = renderWithProviders(
      <TitleInput noteId="note-1" initialTitle="First" />
    )
    rerender(<TitleInput noteId="note-2" initialTitle="Second" />)
    expect(screen.getByDisplayValue('Second')).toBeInTheDocument()
  })

  describe('onSaveEnd and onSaveError callbacks', () => {
    it('calls onSaveEnd on successful save', () => {
      const onSaveEnd = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      renderWithProviders(
        <TitleInput noteId="note-1" initialTitle="Old" onSaveEnd={onSaveEnd} />
      )
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated' } })
      vi.advanceTimersByTime(800)
      expect(onSaveEnd).toHaveBeenCalled()
    })

    it('does NOT call onSaveEnd when save fails', () => {
      const onSaveEnd = vi.fn()
      const onSaveError = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onError: () => void }) => cbs.onError())
      renderWithProviders(
        <TitleInput noteId="note-1" initialTitle="Old" onSaveEnd={onSaveEnd} onSaveError={onSaveError} />
      )
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bad' } })
      vi.advanceTimersByTime(800)
      expect(onSaveEnd).not.toHaveBeenCalled()
    })

    it('calls onSaveError when save fails', () => {
      const onSaveError = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onError: () => void }) => cbs.onError())
      renderWithProviders(
        <TitleInput noteId="note-1" initialTitle="Old" onSaveError={onSaveError} />
      )
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bad' } })
      vi.advanceTimersByTime(800)
      expect(onSaveError).toHaveBeenCalled()
    })

    it('does NOT call onSaveError on successful save', () => {
      const onSaveError = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      renderWithProviders(
        <TitleInput noteId="note-1" initialTitle="Old" onSaveError={onSaveError} />
      )
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Good' } })
      vi.advanceTimersByTime(800)
      expect(onSaveError).not.toHaveBeenCalled()
    })
  })
})
