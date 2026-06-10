import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'
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
import { Badge } from '@/components/ui/badge'
import { Trash2, FolderInput } from 'lucide-react'
import { useDeleteNote, useMoveNote } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'
import type { Note } from '@/types/note'
import { cn } from '@/lib/utils'

interface Props {
  note: Note
}

export function NoteCard({ note }: Props) {
  const activeNoteId = useUIStore((s) => s.activeNoteId)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const navigate = useNavigate()
  const deleteNote = useDeleteNote()
  const moveNote = useMoveNote()
  const { data: categories } = useCategories()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isActive = activeNoteId === note._id

  function handleClick() {
    setActiveNote(note._id)
    navigate(`/app/notes/${note._id}`)
  }

  const preview = note.plainTextContent?.trim().split('\n')[0] ?? ''

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              'w-full text-left p-3 rounded-md transition-colors group',
              isActive
                ? 'bg-purple-600/10 border border-purple-600/30'
                : 'hover:bg-zinc-800/50 border border-transparent'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn('font-medium text-sm truncate', isActive ? 'text-purple-200' : 'text-zinc-100')}>
                {note.title || 'Untitled'}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 text-[10px] px-1.5 py-0 h-4',
                  note.noteType === 'markdown'
                    ? 'text-purple-400 border-purple-800'
                    : 'text-zinc-500 border-zinc-700'
                )}
              >
                {note.noteType}
              </Badge>
            </div>
            {preview && (
              <p className="text-xs text-zinc-500 truncate mb-1.5">{preview}</p>
            )}
            <p className="text-[10px] text-zinc-600">
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </p>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-zinc-900 border-zinc-800">
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <FolderInput className="h-3.5 w-3.5" /> Move to...
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-zinc-900 border-zinc-800">
              {categories
                ?.filter((c) => c._id !== note.categoryId)
                .map((cat) => (
                  <ContextMenuItem
                    key={cat._id}
                    onSelect={() => moveNote.mutate({ noteId: note._id, categoryId: cat._id })}
                    className="cursor-pointer"
                  >
                    {cat.name}
                  </ContextMenuItem>
                ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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
