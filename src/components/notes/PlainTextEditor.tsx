import { useRef, useCallback, useEffect, useState } from 'react'
import { useUpdateNote } from '@/hooks/useNotes'

interface Props {
  noteId: string
  initialContent: string
  onSaveStart?: () => void
  onSaveEnd?: () => void
}

export function PlainTextEditor({ noteId, initialContent, onSaveStart, onSaveEnd }: Props) {
  const [value, setValue] = useState(initialContent)
  const updateNote = useUpdateNote(noteId)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setValue(initialContent)
  }, [initialContent])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value
      setValue(newVal)
      clearTimeout(debounceRef.current)
      onSaveStart?.()
      debounceRef.current = setTimeout(() => {
        updateNote.mutate({ markdownContent: newVal }, { onSettled: () => onSaveEnd?.() })
      }, 800)
    },
    [updateNote, onSaveStart, onSaveEnd]
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
