import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockNote } from '@/test/utils'

// Mock the api module before importing the service
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/services/api'
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  moveNote,
  searchNotes,
} from '@/services/notes.service'

const mockApi = api as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notes.service', () => {
  const note = createMockNote()

  describe('getNotes', () => {
    it('calls GET /notes and returns data array', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: [note] })
      const result = await getNotes()
      expect(mockApi.get).toHaveBeenCalledWith('/notes', { params: {} })
      expect(result).toEqual([note])
    })

    it('passes categoryId as query param when provided', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: [note] })
      await getNotes('cat-1')
      expect(mockApi.get).toHaveBeenCalledWith('/notes', { params: { categoryId: 'cat-1' } })
    })
  })

  describe('getNote', () => {
    it('calls GET /notes/:id and returns the note', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: note })
      const result = await getNote('note-1')
      expect(mockApi.get).toHaveBeenCalledWith('/notes/note-1')
      expect(result).toEqual(note)
    })
  })

  describe('createNote', () => {
    it('calls POST /notes with input body', async () => {
      mockApi.post.mockResolvedValue({ success: true, data: note })
      const input = { title: 'New', markdownContent: '', categoryId: 'cat-1', noteType: 'text' as const }
      const result = await createNote(input)
      expect(mockApi.post).toHaveBeenCalledWith('/notes', input)
      expect(result).toEqual(note)
    })
  })

  describe('updateNote', () => {
    it('calls PATCH /notes/:id with input body', async () => {
      mockApi.patch.mockResolvedValue({ success: true, data: note })
      const result = await updateNote('note-1', { title: 'Updated' })
      expect(mockApi.patch).toHaveBeenCalledWith('/notes/note-1', { title: 'Updated' })
      expect(result).toEqual(note)
    })
  })

  describe('deleteNote', () => {
    it('calls DELETE /notes/:id', async () => {
      mockApi.delete.mockResolvedValue({ success: true })
      await deleteNote('note-1')
      expect(mockApi.delete).toHaveBeenCalledWith('/notes/note-1')
    })
  })

  describe('moveNote', () => {
    it('calls PATCH /notes/:id/move with categoryId', async () => {
      mockApi.patch.mockResolvedValue({ success: true, data: note })
      const result = await moveNote('note-1', 'cat-2')
      expect(mockApi.patch).toHaveBeenCalledWith('/notes/note-1/move', { categoryId: 'cat-2' })
      expect(result).toEqual(note)
    })
  })

  describe('searchNotes', () => {
    it('calls GET /notes/search with query param', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: [note] })
      const result = await searchNotes('hello')
      expect(mockApi.get).toHaveBeenCalledWith('/notes/search', { params: { query: 'hello' } })
      expect(result).toEqual([note])
    })
  })
})
