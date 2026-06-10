import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createTestQueryClient, createMockNote } from '@/test/utils'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: vi.fn().mockReturnValue(vi.fn()) }
})
vi.mock('@/services/notes.service', () => ({
  getNotes: vi.fn(),
  getNote: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  moveNote: vi.fn(),
  searchNotes: vi.fn(),
}))

import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
} from '@/services/notes.service'
import {
  useNotes,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useSearchNotes,
} from '@/hooks/useNotes'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient()
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useNotes', () => {
  it('fetches all notes when no categoryId given', async () => {
    const notes = [createMockNote()]
    vi.mocked(getNotes).mockResolvedValue(notes)
    const { result } = renderHook(() => useNotes(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(notes)
    expect(getNotes).toHaveBeenCalledWith(undefined)
  })

  it('passes categoryId to service when provided', async () => {
    vi.mocked(getNotes).mockResolvedValue([])
    const { result } = renderHook(() => useNotes('cat-1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getNotes).toHaveBeenCalledWith('cat-1')
  })
})

describe('useNote', () => {
  it('fetches a single note by id', async () => {
    const note = createMockNote()
    vi.mocked(getNote).mockResolvedValue(note)
    const { result } = renderHook(() => useNote('note-1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(note)
  })

  it('is disabled when noteId is null', () => {
    const { result } = renderHook(() => useNote(null), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(getNote).not.toHaveBeenCalled()
  })
})

describe('useCreateNote', () => {
  it('creates a note and shows success toast', async () => {
    const note = createMockNote({ title: 'Fresh Note' })
    vi.mocked(createNote).mockResolvedValue(note)
    const { result } = renderHook(() => useCreateNote(), { wrapper })

    result.current.mutate({ title: 'Fresh Note', markdownContent: '', categoryId: 'cat-1', noteType: 'text' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith('Note created')
  })
})

describe('useUpdateNote', () => {
  it('updates a note without showing a toast', async () => {
    const updated = createMockNote({ title: 'Updated' })
    vi.mocked(updateNote).mockResolvedValue(updated)
    const { result } = renderHook(() => useUpdateNote('note-1'), { wrapper })

    result.current.mutate({ title: 'Updated' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(updateNote).toHaveBeenCalledWith('note-1', { title: 'Updated' })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('shows error toast on update failure', async () => {
    vi.mocked(updateNote).mockRejectedValue({ message: 'Save failed' })
    const { result } = renderHook(() => useUpdateNote('note-1'), { wrapper })

    result.current.mutate({ title: 'bad' })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Save failed')
  })
})

describe('useDeleteNote', () => {
  it('deletes a note and shows success toast', async () => {
    vi.mocked(deleteNote).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteNote(), { wrapper })

    result.current.mutate('note-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(deleteNote).toHaveBeenCalledWith('note-1')
    expect(toast.success).toHaveBeenCalledWith('Note deleted')
  })
})

describe('useSearchNotes', () => {
  it('is disabled when query length <= 1', () => {
    const { result } = renderHook(() => useSearchNotes('a'), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(searchNotes).not.toHaveBeenCalled()
  })

  it('runs the query when query length > 1', async () => {
    const notes = [createMockNote({ title: 'hello' })]
    vi.mocked(searchNotes).mockResolvedValue(notes)
    const { result } = renderHook(() => useSearchNotes('hello'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchNotes).toHaveBeenCalledWith('hello')
  })
})
