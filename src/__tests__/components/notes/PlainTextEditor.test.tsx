import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PlainTextEditor, plainDraftKey } from '@/components/notes/PlainTextEditor'

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))
vi.mock('@/hooks/useNotes', () => ({
  useUpdateNote: () => ({ mutate: mockMutate }),
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  localStorage.clear()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('PlainTextEditor', () => {
  describe('rendering', () => {
    it('renders with initial content', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="Hello world" />)
      expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument()
    })

    it('shows placeholder when content is empty', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      expect(screen.getByPlaceholderText('Start writing...')).toBeInTheDocument()
    })

    it('resets displayed value when initialContent prop changes', () => {
      const { rerender } = renderWithProviders(<PlainTextEditor noteId="n1" initialContent="First" />)
      rerender(<PlainTextEditor noteId="n1" initialContent="Second" />)
      expect(screen.getByDisplayValue('Second')).toBeInTheDocument()
    })
  })

  describe('localStorage draft backup', () => {
    it('writes draft to localStorage immediately on every keystroke', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'draft text' } })
      expect(localStorage.getItem(plainDraftKey('n1'))).toBe('draft text')
    })

    it('overwrites draft in localStorage on subsequent keystrokes', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'first' } })
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'second' } })
      expect(localStorage.getItem(plainDraftKey('n1'))).toBe('second')
    })

    it('uses noteId-scoped key so different notes do not clash', () => {
      renderWithProviders(<PlainTextEditor noteId="note-A" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'note A content' } })
      expect(localStorage.getItem(plainDraftKey('note-A'))).toBe('note A content')
      expect(localStorage.getItem(plainDraftKey('note-B'))).toBeNull()
    })

    it('removes draft from localStorage on successful API save', () => {
      mockMutate.mockImplementation((_payload: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'saved text' } })
      vi.advanceTimersByTime(800)
      expect(localStorage.getItem(plainDraftKey('n1'))).toBeNull()
    })

    it('keeps draft in localStorage when API save fails', () => {
      mockMutate.mockImplementation((_payload: unknown, cbs: { onError: () => void }) => cbs.onError())
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'unsaved' } })
      vi.advanceTimersByTime(800)
      expect(localStorage.getItem(plainDraftKey('n1'))).toBe('unsaved')
    })
  })

  describe('debounce and API call', () => {
    it('does not call updateNote before the 800ms debounce fires', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } })
      vi.advanceTimersByTime(799)
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('calls updateNote with plainTextContent after 800ms', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } })
      vi.advanceTimersByTime(800)
      expect(mockMutate).toHaveBeenCalledWith(
        { plainTextContent: 'abc' },
        expect.anything()
      )
    })

    it('debounces multiple rapid keystrokes into a single API call', () => {
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } })
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } })
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } })
      vi.advanceTimersByTime(800)
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith({ plainTextContent: 'abc' }, expect.anything())
    })
  })

  describe('save callbacks', () => {
    it('calls onSaveStart immediately when typing', () => {
      const onSaveStart = vi.fn()
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" onSaveStart={onSaveStart} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } })
      expect(onSaveStart).toHaveBeenCalled()
    })

    it('calls onSaveEnd after successful API save', () => {
      const onSaveEnd = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      renderWithProviders(<PlainTextEditor noteId="n1" initialContent="" onSaveEnd={onSaveEnd} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ok' } })
      vi.advanceTimersByTime(800)
      expect(onSaveEnd).toHaveBeenCalled()
    })

    it('does NOT call onSaveEnd when save fails', () => {
      const onSaveEnd = vi.fn()
      const onSaveError = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onError: () => void }) => cbs.onError())
      renderWithProviders(
        <PlainTextEditor noteId="n1" initialContent="" onSaveEnd={onSaveEnd} onSaveError={onSaveError} />
      )
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bad' } })
      vi.advanceTimersByTime(800)
      expect(onSaveEnd).not.toHaveBeenCalled()
      expect(onSaveError).toHaveBeenCalled()
    })
  })
})
