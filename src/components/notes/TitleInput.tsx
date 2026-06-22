import { useRef, useCallback, useEffect, useState } from 'react'
import { useUpdateNote } from '@/hooks/useNotes'

interface Props {
  noteId: string
  initialTitle: string
  onSaveStart?: () => void
  onSaveEnd?: () => void
  onSaveError?: () => void
}

export function TitleInput({ noteId, initialTitle, onSaveStart, onSaveEnd, onSaveError }: Props) {
  const [value, setValue] = useState(initialTitle)
  const updateNote = useUpdateNote(noteId)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const loadedNoteIdRef = useRef(noteId)

  // Only resync from the server value when switching notes — not on every cache
  // update from our own save, which would otherwise overwrite in-progress typing
  // with the stale snapshot and snap the cursor to the end.
  useEffect(() => {
    if (loadedNoteIdRef.current !== noteId) {
      loadedNoteIdRef.current = noteId
      setValue(initialTitle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value
      setValue(newVal)
      clearTimeout(debounceRef.current)
      onSaveStart?.()
      debounceRef.current = setTimeout(() => {
        updateNote.mutate(
          { title: newVal },
          {
            onSuccess: () => onSaveEnd?.(),
            onError: () => onSaveError?.(),
          }
        )
      }, 800)
    },
    [updateNote, onSaveStart, onSaveEnd]
  )

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Untitled"
      className="w-full bg-transparent text-2xl font-semibold text-zinc-100 placeholder:text-zinc-600 outline-none border-none px-0 py-2"
    />
  )
}
