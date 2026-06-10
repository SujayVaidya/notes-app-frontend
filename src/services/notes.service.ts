import api from './api'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note'
import type { PaginatedResponse, ApiResponse } from '@/types/api'

export async function getNotes(categoryId?: string): Promise<Note[]> {
  const params: Record<string, string> = {}
  if (categoryId) params.categoryId = categoryId
  const res = await api.get<unknown, PaginatedResponse<Note>>('/notes', { params })
  return res.data
}

export async function getNote(noteId: string): Promise<Note> {
  const res = await api.get<unknown, ApiResponse<Note>>(`/notes/${noteId}`)
  return res.data as Note
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await api.post<unknown, ApiResponse<Note>>('/notes', input)
  return res.data as Note
}

export async function updateNote(noteId: string, input: UpdateNoteInput): Promise<Note> {
  const res = await api.patch<unknown, ApiResponse<Note>>(`/notes/${noteId}`, input)
  return res.data as Note
}

export async function deleteNote(noteId: string): Promise<void> {
  await api.delete(`/notes/${noteId}`)
}

export async function moveNote(noteId: string, categoryId: string): Promise<Note> {
  const res = await api.patch<unknown, ApiResponse<Note>>(`/notes/${noteId}/move`, { categoryId })
  return res.data as Note
}

export async function searchNotes(query: string): Promise<Note[]> {
  const res = await api.get<unknown, PaginatedResponse<Note>>('/notes/search', {
    params: { query },
  })
  return res.data
}
