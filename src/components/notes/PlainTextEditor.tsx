import { useRef, useCallback, useEffect, useState } from 'react'
import { useUpdateNote } from '@/hooks/useNotes'

interface Props {
  noteId: string
  initialContent: string
  onSaveStart?: () => void
  onSaveEnd?: () => void
  onSaveError?: () => void
}

export const plainDraftKey = (id: string) => `draft_plain_${id}`

export function PlainTextEditor({ noteId, initialContent, onSaveStart, onSaveEnd, onSaveError }: Props) {
  const [value, setValue] = useState(initialContent)
  const updateNote = useUpdateNote(noteId)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loadedNoteIdRef = useRef(noteId)

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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value
      setValue(newVal)
      localStorage.setItem(plainDraftKey(noteId), newVal)
      clearTimeout(debounceRef.current)
      onSaveStart?.()
      debounceRef.current = setTimeout(() => {
        updateNote.mutate(
          { plainTextContent: newVal },
          {
            onSuccess: () => {
              localStorage.removeItem(plainDraftKey(noteId))
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

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder="Start writing..."
      className="w-full flex-1 resize-none bg-transparent text-zinc-300 placeholder:text-zinc-600 outline-none border-none text-sm leading-relaxed font-mono p-0"
      style={{ minHeight: '100%' }}
    />
  )
}
