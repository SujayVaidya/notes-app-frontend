import { useState, useCallback, useEffect, useRef } from 'react'
import { FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShootingStars } from '@/components/aceternity/shooting-stars'
import { StarsBackground } from '@/components/aceternity/stars-background'
import { TitleInput } from './TitleInput'
import { PlainTextEditor, plainDraftKey } from './PlainTextEditor'
import { MarkdownEditor, mdDraftKey } from './MarkdownEditor'
import { NoteToolbar } from './NoteToolbar'
import { useNote, useUpdateNote } from '@/hooks/useNotes'
import { useUIStore } from '@/stores/uiStore'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function NoteEditorPanel() {
  const activeNoteId = useUIStore((s) => s.activeNoteId)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const syncedRef = useRef(false)

  const saveTimeout = useCallback(() => { setSaveStatus('saving') }, [])
  const saveDone = useCallback(() => {
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [])
  const saveError = useCallback(() => {
    setSaveStatus('error')
    setTimeout(() => setSaveStatus('idle'), 4000)
  }, [])

  const { data: note, isLoading } = useNote(activeNoteId)
  const updateNote = useUpdateNote(activeNoteId ?? '')

  // On note load, check for a locally-stored draft that failed to save previously
  useEffect(() => {
    if (!note) {
      syncedRef.current = false
      return
    }
    if (syncedRef.current) return
    syncedRef.current = true

    const draftKey = note.noteType === 'text' ? plainDraftKey(note._id) : mdDraftKey(note._id)
    const draft = localStorage.getItem(draftKey)
    if (!draft) return

    setSaveStatus('saving')
    const payload = note.noteType === 'text'
      ? { plainTextContent: draft }
      : { markdownContent: draft }

    updateNote.mutate(payload, {
      onSuccess: () => {
        localStorage.removeItem(draftKey)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      },
      onError: () => {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 4000)
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?._id, note?.noteType])

  if (!activeNoteId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <StarsBackground />
        <ShootingStars />
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="No note selected"
          description="Select a note from the list or create a new one"
          className="relative z-10"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-6 gap-4 bg-zinc-950">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Note not found"
          description="This note may have been deleted"
        />
      </div>
    )
  }

  const draftPlain = localStorage.getItem(plainDraftKey(note._id))
  const draftMd = localStorage.getItem(mdDraftKey(note._id))

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
      <NoteToolbar note={note} saveStatus={saveStatus} />
      <div className="flex-1 flex flex-col min-h-0 px-6 pt-4 pb-6 lg:ml-6">
        <TitleInput
          noteId={note._id}
          initialTitle={note.title}
          onSaveStart={saveTimeout}
          onSaveEnd={saveDone}
          onSaveError={saveError}
        />
        <div className="mt-3 flex-1 min-h-0 flex flex-col">
          {note.noteType === 'markdown' ? (
            <MarkdownEditor
              noteId={note._id}
              initialContent={draftMd ?? note.markdownContent ?? ''}
              onSaveStart={saveTimeout}
              onSaveEnd={saveDone}
              onSaveError={saveError}
            />
          ) : (
            <PlainTextEditor
              noteId={note._id}
              initialContent={draftPlain ?? note.plainTextContent ?? ''}
              onSaveStart={saveTimeout}
              onSaveEnd={saveDone}
              onSaveError={saveError}
            />
          )}
        </div>
      </div>
    </div>
  )
}
