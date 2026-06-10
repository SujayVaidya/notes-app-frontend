import { useState } from 'react'
import { Hash, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'
import type { Category } from '@/types/category'
import { cn } from '@/lib/utils'

interface Props {
  category: Category
  noteCount?: number
  onNavigate?: () => void
}

export function CategoryItem({ category, noteCount, onNavigate }: Props) {
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const setActiveCategory = useUIStore((s) => s.setActiveCategory)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const deleteCategory = useDeleteCategory()
  const updateCategory = useUpdateCategory()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(category.name)

  const isActive = activeCategoryId === category._id

  function handleClick() {
    setActiveCategory(category._id)
    setActiveNote(null)
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
          <button
            onClick={handleClick}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left group',
              isActive
                ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
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
                className="h-5 py-0 px-1 text-sm bg-transparent border-zinc-600"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 truncate">{category.name}</span>
            )}
            {noteCount !== undefined && noteCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-zinc-800 text-zinc-500">
                {noteCount}
              </Badge>
            )}
          </button>
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
