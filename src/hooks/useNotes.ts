import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  moveNote,
  searchNotes,
} from '@/services/notes.service'
import type { CreateNoteInput, UpdateNoteInput } from '@/types/note'
import { useUIStore } from '@/stores/uiStore'

export const notesKey = (categoryId?: string) => ['notes', { categoryId }] as const
export const noteKey = (noteId: string) => ['note', noteId] as const
export const searchKey = (query: string) => ['notes', 'search', { query }] as const

export function useNotes(categoryId?: string) {
  return useQuery({
    queryKey: notesKey(categoryId),
    queryFn: () => getNotes(categoryId),
  })
}

export function useNote(noteId: string | null) {
  return useQuery({
    queryKey: noteKey(noteId ?? ''),
    queryFn: () => getNote(noteId!),
    enabled: Boolean(noteId),
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setActiveNote(note._id)
      navigate(`/app/notes/${note._id}`)
      toast.success('Note created')
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to create note')
    },
  })
}

export function useUpdateNote(noteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(noteId, input),
    onSuccess: (note) => {
      qc.setQueryData(noteKey(noteId), note)
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to save note')
    },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setActiveNote(null)
      navigate('/app')
      toast.success('Note deleted')
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to delete note')
    },
  })
}

export function useMoveNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, categoryId }: { noteId: string; categoryId: string }) =>
      moveNote(noteId, categoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note moved')
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to move note')
    },
  })
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: searchKey(query),
    queryFn: () => searchNotes(query),
    enabled: query.length > 1,
  })
}
