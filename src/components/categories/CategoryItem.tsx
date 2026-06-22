import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hash, Pencil, Trash2, ChevronRight, FileText } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'
import type { Category } from '@/types/category'
import type { Note } from '@/types/note'
import { cn } from '@/lib/utils'

interface Props {
  category: Category
  notes?: Note[]
  onNavigate?: () => void
}

export function CategoryItem({ category, notes = [], onNavigate }: Props) {
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const setActiveCategory = useUIStore((s) => s.setActiveCategory)
  const activeNoteId = useUIStore((s) => s.activeNoteId)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const deleteCategory = useDeleteCategory()
  const updateCategory = useUpdateCategory()
  const navigate = useNavigate()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(category.name)
  const [expanded, setExpanded] = useState(false)

  const isActive = activeCategoryId === category._id

  function handleCategoryClick() {
    setActiveCategory(category._id)
    setActiveNote(null)
    setExpanded((v) => !v)
  }

  function handleNoteClick(note: Note) {
    setActiveNote(note._id)
    navigate(`/app/notes/${note._id}`)
    onNavigate?.()
  }

  function handleRename() {
    if (editValue.trim().length < 2) return
    updateCategory.mutate(
      { id: category._id, input: { name: editValue.trim() } },
      { onSuccess: () => setEditing(false) }
    )
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div>
            {/* Category row */}
            <SidebarMenuButton
              onClick={handleCategoryClick}
              className={cn(
                'w-full gap-2 min-w-0',
                isActive
                  ? 'bg-purple-600/20 text-purple-300'
                  : 'text-zinc-400 hover:text-zinc-100'
              )}
            >
              <Hash className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-purple-400' : 'text-zinc-500')} />
              {editing ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename()
                    if (e.key === 'Escape') setEditing(false)
                  }}
                  autoFocus
                  className="h-5 py-0 px-1 text-sm bg-transparent border-zinc-600 flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 truncate">{category.name}</span>
              )}
              {notes.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-zinc-800 text-zinc-500 shrink-0">
                  {notes.length}
                </Badge>
              )}
              <ChevronRight
                className={cn('h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200', expanded ? 'rotate-90' : '')}
              />
            </SidebarMenuButton>

            {/* Notes accordion */}
            {expanded && (
              <SidebarMenuSub>
                {notes.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-zinc-600 italic">No notes</div>
                ) : (
                  notes.map((note) => (
                    <SidebarMenuSubItem key={note._id}>
                      <SidebarMenuSubButton
                        onClick={() => handleNoteClick(note)}
                        className={cn(
                          'gap-2',
                          activeNoteId === note._id
                            ? 'bg-purple-600/10 text-purple-300'
                            : 'text-zinc-400 hover:text-zinc-100'
                        )}
                      >
                        <FileText className="h-3 w-3 shrink-0 text-zinc-600" />
                        <span className="flex-1 truncate text-xs">{note.title || 'Untitled'}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] px-1 py-0 h-3.5 shrink-0',
                            note.noteType === 'markdown'
                              ? 'text-purple-400 border-purple-800'
                              : 'text-zinc-500 border-zinc-700'
                          )}
                        >
                          {note.noteType}
                        </Badge>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                )}
              </SidebarMenuSub>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-zinc-900 border-zinc-800">
          <ContextMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" /> Rename
          </ContextMenuItem>
          {!category.isDefault && (
            <ContextMenuItem
              className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{category.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              All notes in this category will be moved to General. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                deleteCategory.mutate(category._id)
                if (activeCategoryId === category._id) setActiveCategory(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
