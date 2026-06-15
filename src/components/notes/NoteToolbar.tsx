import { useState, useEffect } from 'react'
import { Copy, Maximize2, Trash2, ChevronLeft, FolderInput } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AnimatedTooltip } from '@/components/aceternity/animated-tooltip'
import { useDeleteNote, useUpdateNote, useMoveNote } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'
import type { Note } from '@/types/note'
import { cn } from '@/lib/utils'

interface Props {
  note: Note
  saveStatus: 'idle' | 'saving' | 'saved'
}

export function NoteToolbar({ note, saveStatus }: Props) {
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote(note._id)
  const moveNote = useMoveNote()
  const { data: categories } = useCategories()
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const setActiveNote = useUIStore((s) => s.setActiveNote)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [typeWarnOpen, setTypeWarnOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  const currentCategory = categories?.find((c) => c._id === note.categoryId)

  function handleTypeChange(val: string) {
    if (!val) return
    if (note.noteType === 'markdown' && val === 'text') {
      setTypeWarnOpen(true)
    } else {
      updateNote.mutate({ noteType: val as 'text' | 'markdown' })
    }
  }

  function confirmTypeSwitch() {
    updateNote.mutate({ noteType: 'text' })
    setTypeWarnOpen(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(note.markdownContent ?? note.plainTextContent ?? '')
    toast.success('Copied to clipboard')
  }

  const tooltipItems = [
    { id: 1, name: 'Copy content', icon: <Copy className="h-4 w-4" />, onClick: handleCopy },
    { id: 2, name: 'Focus mode', icon: <Maximize2 className="h-4 w-4" />, onClick: toggleFocusMode },
  ]
  console.log('rendering toolbar', note.noteType)

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-950/50">
        <button
          onClick={() => setActiveNote(null)}
          className="md:hidden p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <ToggleGroup
          type="single"
          value={note.noteType}
          onValueChange={handleTypeChange}
          disabled
          className="border border-zinc-800 rounded-md p-0.5 opacity-60 cursor-not-allowed"
        >
          <ToggleGroupItem value="text" className={`h-6 px-2.5 text-xs disabled:pointer-events-none transition-colors ${note.noteType === 'text' ? 'bg-purple-600/20 border border-purple-600 text-purple-300' : 'data-[state=on]:bg-zinc-700'}`}>
            Text
          </ToggleGroupItem>
          <ToggleGroupItem value="markdown" className={`h-6 px-2.5 text-xs disabled:pointer-events-none transition-colors ${note.noteType === 'markdown' ? 'bg-purple-600/20 border border-purple-600 text-purple-300' : 'data-[state=on]:bg-zinc-700'}`}>
            Markdown
          </ToggleGroupItem>
        </ToggleGroup>

        <Popover open={moveOpen} onOpenChange={setMoveOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
            >
              <FolderInput className="h-3.5 w-3.5" />
              <span className="max-w-[80px] truncate">{currentCategory?.name ?? 'Move'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 bg-zinc-900 border-zinc-800">
            <Command>
              <CommandInput placeholder="Search..." className="h-8" />
              <CommandList>
                <CommandEmpty>No categories</CommandEmpty>
                <CommandGroup>
                  {categories
                    ?.filter((c) => c._id !== note.categoryId)
                    .map((cat) => (
                      <CommandItem
                        key={cat._id}
                        onSelect={() => {
                          moveNote.mutate({ noteId: note._id, categoryId: cat._id })
                          setMoveOpen(false)
                        }}
                        className="cursor-pointer"
                      >
                        {cat.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <AnimatedTooltip items={tooltipItems} />
        </div>

        <span
          className={cn(
            'text-xs transition-opacity',
            saveStatus === 'saving' ? 'text-zinc-500 opacity-100' : '',
            saveStatus === 'saved' ? 'text-green-500 opacity-100' : '',
            saveStatus === 'idle' ? 'opacity-0' : ''
          )}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </span>

        <button
          onClick={() => setDeleteOpen(true)}
          className="p-1.5 rounded-md hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <AlertDialog open={typeWarnOpen} onOpenChange={setTypeWarnOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to Plain Text?</AlertDialogTitle>
            <AlertDialogDescription>
              Markdown syntax will remain as raw characters (e.g. **bold** stays as **bold**). The content
              is not deleted but will no longer be rendered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTypeSwitch}>Switch anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{note.title || 'Untitled'}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteNote.mutate(note._id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
