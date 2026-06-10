import { useRef, useCallback, useEffect, useState } from 'react'
import { useUpdateNote } from '@/hooks/useNotes'

interface Props {
  noteId: string
  initialContent: string
  onSaveStart?: () => void
  onSaveEnd?: () => void
}

export function MarkdownEditor({ noteId, initialContent, onSaveStart, onSaveEnd }: Props) {
  const [value, setValue] = useState(initialContent)
  const updateNote = useUpdateNote(noteId)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [MDEditor, setMDEditor] = useState<typeof import('@uiw/react-md-editor').default | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@uiw/react-md-editor').then((mod) => setMDEditor(() => mod.default))
    }
  }, [])

  useEffect(() => {
    setValue(initialContent)
  }, [initialContent])

  const handleChange = useCallback(
    (newVal?: string) => {
      const v = newVal ?? ''
      setValue(v)
      clearTimeout(debounceRef.current)
      onSaveStart?.()
      debounceRef.current = setTimeout(() => {
        updateNote.mutate({ markdownContent: v }, { onSettled: () => onSaveEnd?.() })
      }, 800)
    },
    [updateNote, onSaveStart, onSaveEnd]
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
