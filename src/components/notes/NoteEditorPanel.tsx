import { useState, useEffect, useCallback } from 'react'
import { FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShootingStars } from '@/components/aceternity/shooting-stars'
import { StarsBackground } from '@/components/aceternity/stars-background'
import { TitleInput } from './TitleInput'
import { PlainTextEditor } from './PlainTextEditor'
import { MarkdownEditor } from './MarkdownEditor'
import { NoteToolbar } from './NoteToolbar'
import { useNote } from '@/hooks/useNotes'
import { useUIStore } from '@/stores/uiStore'

export function NoteEditorPanel() {
  const activeNoteId = useUIStore((s) => s.activeNoteId)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimeout = useCallback(() => {
    setSaveStatus('saving')
  }, [])
  const saveDone = useCallback(() => {
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [])

  const { data: note, isLoading } = useNote(activeNoteId)

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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
      <NoteToolbar note={note} saveStatus={saveStatus} />
      <div className="flex-1 flex flex-col min-h-0 px-6 pt-4 pb-6">
        <TitleInput
          noteId={note._id}
          initialTitle={note.title}
          onSaveStart={saveTimeout}
          onSaveEnd={saveDone}
        />
        <div className="mt-3 flex-1 min-h-0 flex flex-col">
          {note.noteType === 'markdown' ? (
            <MarkdownEditor
              noteId={note._id}
              initialContent={note.markdownContent ?? ''}
              onSaveStart={saveTimeout}
              onSaveEnd={saveDone}
            />
          ) : (
            <PlainTextEditor
              noteId={note._id}
              initialContent={note.markdownContent ?? ''}
              onSaveStart={saveTimeout}
              onSaveEnd={saveDone}
            />
          )}
        </div>
      </div>
    </div>
  )
}
