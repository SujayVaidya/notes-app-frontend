import { useRef, useCallback, useEffect, useState } from 'react'
import { useUpdateNote } from '@/hooks/useNotes'

interface Props {
  noteId: string
  initialContent: string
  onSaveStart?: () => void
  onSaveEnd?: () => void
  onSaveError?: () => void
}

export const mdDraftKey = (id: string) => `draft_md_${id}`

export function MarkdownEditor({ noteId, initialContent, onSaveStart, onSaveEnd, onSaveError }: Props) {
  const [value, setValue] = useState(initialContent)
  const updateNote = useUpdateNote(noteId)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [MDEditor, setMDEditor] = useState<typeof import('@uiw/react-md-editor').default | null>(null)
  const loadedNoteIdRef = useRef(noteId)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@uiw/react-md-editor').then((mod) => setMDEditor(() => mod.default))
    }
  }, [])

  // Only resync from the server/draft value when switching notes — not on every
  // cache update from our own save, which would otherwise overwrite in-progress
  // typing with the stale snapshot and snap the cursor to the end.
  useEffect(() => {
    if (loadedNoteIdRef.current !== noteId) {
      loadedNoteIdRef.current = noteId
      setValue(initialContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const handleChange = useCallback(
    (newVal?: string) => {
      const v = newVal ?? ''
      setValue(v)
      localStorage.setItem(mdDraftKey(noteId), v)
      clearTimeout(debounceRef.current)
      onSaveStart?.()
      debounceRef.current = setTimeout(() => {
        updateNote.mutate(
          { markdownContent: v },
          {
            onSuccess: () => {
              localStorage.removeItem(mdDraftKey(noteId))
              onSaveEnd?.()
            },
            onError: () => {
              onSaveError?.()
            },
          }
        )
      }, 800)
    },
    [noteId, updateNote, onSaveStart, onSaveEnd, onSaveError]
  )

  if (!MDEditor) {
    return <div className="flex-1 animate-pulse bg-zinc-900 rounded" />
  }

  return (
    <div className="flex-1 overflow-hidden" data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={handleChange}
        preview="live"
        height="100%"
        style={{ background: 'transparent' }}
      />
    </div>
  )
}
