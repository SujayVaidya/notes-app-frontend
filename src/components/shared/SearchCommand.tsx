import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Hash } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { useSearchNotes } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'

export function SearchCommand() {
  const open = useUIStore((s) => s.searchOpen)
  const setOpen = useUIStore((s) => s.setSearchOpen)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const handleInput = useCallback((val: string) => {
    setInputValue(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300)
  }, [])

  const { data: notes } = useSearchNotes(debouncedQuery)
  const { data: categories } = useCategories()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  function getCategoryName(categoryId: string) {
    return categories?.find((c) => c._id === categoryId)?.name ?? 'Unknown'
  }

  function handleSelect(noteId: string) {
    setActiveNote(noteId)
    navigate(`/app/notes/${noteId}`)
    setOpen(false)
    setInputValue('')
    setDebouncedQuery('')
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search notes..."
        value={inputValue}
        onValueChange={handleInput}
      />
      <CommandList>
        <CommandEmpty>No notes found.</CommandEmpty>
        {notes && notes.length > 0 && (
          <CommandGroup heading="Results">
            {notes.map((note) => (
              <CommandItem
                key={note._id}
                value={note._id}
                onSelect={() => handleSelect(note._id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{note.title || 'Untitled'}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    <span>{getCategoryName(note.categoryId)}</span>
                    {note.plainTextContent && (
                      <span className="truncate max-w-[200px]">
                        {note.plainTextContent.slice(0, 60)}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={note.noteType === 'markdown' ? 'text-purple-400 border-purple-800' : 'text-zinc-500 border-zinc-700'}
                >
                  {note.noteType}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
