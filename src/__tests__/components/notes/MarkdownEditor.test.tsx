import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { MarkdownEditor, mdDraftKey } from '@/components/notes/MarkdownEditor'

// @uiw/react-md-editor is globally mocked in setup.tsx as:
//   <textarea data-testid="md-editor" value={value} onChange={(e) => onChange(e.target.value)} />
// The mock resolves synchronously but the component fetches it via dynamic import inside
// a useEffect, so we need `act` to flush that microtask before querying the DOM.

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))
vi.mock('@/hooks/useNotes', () => ({
  useUpdateNote: () => ({ mutate: mockMutate }),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  localStorage.clear()
})

// Flush the useEffect that resolves the dynamic import and sets MDEditor state
async function flushEffects() {
  await act(async () => {
    await Promise.resolve()
  })
}

function getEditor() {
  return screen.getByTestId('md-editor')
}

describe('MarkdownEditor', () => {
  describe('rendering', () => {
    it('renders the md-editor with the initial content', async () => {
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="# Title" />)
      await flushEffects()
      expect(getEditor()).toHaveValue('# Title')
    })

    it('resets displayed value when initialContent prop changes', async () => {
      const { rerender } = renderWithProviders(<MarkdownEditor noteId="n1" initialContent="First" />)
      await flushEffects()
      rerender(<MarkdownEditor noteId="n1" initialContent="Second" />)
      await flushEffects()
      expect(getEditor()).toHaveValue('Second')
    })
  })

  describe('localStorage draft backup', () => {
    it('writes draft to localStorage immediately on change', async () => {
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'draft md' } })
      expect(localStorage.getItem(mdDraftKey('n1'))).toBe('draft md')
    })

    it('overwrites the draft on subsequent changes', async () => {
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'v1' } })
      fireEvent.change(getEditor(), { target: { value: 'v2' } })
      expect(localStorage.getItem(mdDraftKey('n1'))).toBe('v2')
    })

    it('uses noteId-scoped key', async () => {
      renderWithProviders(<MarkdownEditor noteId="md-note-A" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'content A' } })
      expect(localStorage.getItem(mdDraftKey('md-note-A'))).toBe('content A')
      expect(localStorage.getItem(mdDraftKey('md-note-B'))).toBeNull()
    })

    it('removes draft from localStorage on successful API save', async () => {
      vi.useFakeTimers()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'saved md' } })
      vi.advanceTimersByTime(800)
      expect(localStorage.getItem(mdDraftKey('n1'))).toBeNull()
      vi.useRealTimers()
    })

    it('keeps draft in localStorage when API save fails', async () => {
      vi.useFakeTimers()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onError: () => void }) => cbs.onError())
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'unsaved md' } })
      vi.advanceTimersByTime(800)
      expect(localStorage.getItem(mdDraftKey('n1'))).toBe('unsaved md')
      vi.useRealTimers()
    })
  })

  describe('debounce and API call', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('does not call updateNote before the 800ms debounce fires', async () => {
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'hello' } })
      vi.advanceTimersByTime(799)
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('calls updateNote with markdownContent after 800ms', async () => {
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: '# Hello' } })
      vi.advanceTimersByTime(800)
      expect(mockMutate).toHaveBeenCalledWith(
        { markdownContent: '# Hello' },
        expect.anything()
      )
    })

    it('debounces rapid changes into a single API call', async () => {
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: '#' } })
      fireEvent.change(getEditor(), { target: { value: '# H' } })
      fireEvent.change(getEditor(), { target: { value: '# Hi' } })
      vi.advanceTimersByTime(800)
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith({ markdownContent: '# Hi' }, expect.anything())
    })
  })

  describe('save callbacks', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('calls onSaveStart immediately when typing', async () => {
      const onSaveStart = vi.fn()
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" onSaveStart={onSaveStart} />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'x' } })
      expect(onSaveStart).toHaveBeenCalled()
    })

    it('calls onSaveEnd after successful API save', async () => {
      const onSaveEnd = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      renderWithProviders(<MarkdownEditor noteId="n1" initialContent="" onSaveEnd={onSaveEnd} />)
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'ok' } })
      vi.advanceTimersByTime(800)
      expect(onSaveEnd).toHaveBeenCalled()
    })

    it('calls onSaveError and does NOT call onSaveEnd when save fails', async () => {
      const onSaveEnd = vi.fn()
      const onSaveError = vi.fn()
      mockMutate.mockImplementation((_payload: unknown, cbs: { onError: () => void }) => cbs.onError())
      renderWithProviders(
        <MarkdownEditor noteId="n1" initialContent="" onSaveEnd={onSaveEnd} onSaveError={onSaveError} />
      )
      await flushEffects()
      fireEvent.change(getEditor(), { target: { value: 'bad' } })
      vi.advanceTimersByTime(800)
      expect(onSaveError).toHaveBeenCalled()
      expect(onSaveEnd).not.toHaveBeenCalled()
    })
  })
})
