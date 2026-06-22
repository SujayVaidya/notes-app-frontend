import { useEffect } from 'react'
import { useMatch } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useCategories } from '@/hooks/useCategories'
import { useNote } from '@/hooks/useNotes'
import { useUIStore } from '@/stores/uiStore'

export default function AppPage() {
  const { data: categories } = useCategories()
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const activeNoteId = useUIStore((s) => s.activeNoteId)
  const setActiveCategory = useUIStore((s) => s.setActiveCategory)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)

  // Extract noteId from the URL path (e.g. after refresh at /app/notes/:noteId)
  const noteMatch = useMatch('/app/notes/:noteId')
  const urlNoteId = noteMatch?.params.noteId ?? null

  // Sync URL → store so a refresh at /app/notes/:id reopens the note
  useEffect(() => {
    if (urlNoteId) setActiveNote(urlNoteId)
  }, [urlNoteId, setActiveNote])

  // Fetch the active note so we know its categoryId.
  // TanStack Query deduplicates this with the identical call in NoteEditorPanel.
  const { data: activeNote } = useNote(activeNoteId)

  // Auto-select a category when none is chosen.
  // If the note is already known, prefer its category (keeps the sidebar in sync on refresh).
  // Otherwise fall back to General / the first category.
  useEffect(() => {
    if (!categories || categories.length === 0 || activeCategoryId !== null) return
    const fallback = categories.find((c) => c.isDefault) ?? categories[0]
    setActiveCategory(activeNote?.categoryId ?? fallback._id)
  }, [categories, activeCategoryId, activeNote, setActiveCategory])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'n') {
        e.preventDefault()
        setCreateNoteOpen(true)
      }
      if (mod && e.key === '.') {
        e.preventDefault()
        toggleFocusMode()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setCreateNoteOpen, toggleFocusMode])

  return <AppShell />
}
