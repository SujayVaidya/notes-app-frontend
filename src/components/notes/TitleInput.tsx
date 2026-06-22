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

  useEffect(() => {
    setValue(initialTitle)
  }, [initialTitle])

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
