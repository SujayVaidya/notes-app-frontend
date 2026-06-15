import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CreateCategoryDialog } from '@/components/categories/CreateCategoryDialog'
import { CategoryItem } from '@/components/categories/CategoryItem'
import { useCategories } from '@/hooks/useCategories'
import { useNotes } from '@/hooks/useNotes'
import { useSignOut } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { data: categories } = useCategories()
  const { data: allNotes } = useNotes()
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()
  const [createCatOpen, setCreateCatOpen] = useState(false)

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  function getNotesForCategory(categoryId: string) {
    return allNotes?.filter((n) => n.categoryId === categoryId) ?? []
  }

  function handleSearch() {
    setSearchOpen(true)
    onNavigate?.()
  }

  function handleNewNote() {
    setCreateNoteOpen(true)
    onNavigate?.()
  }

  return (
    <>
      <div className="flex flex-col h-full bg-zinc-950">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-500 text-lg">⬡</span>
            <span className="font-semibold text-zinc-100">Notes</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2 space-y-0.5 mb-4">
            <button
              onClick={handleSearch}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <span className="ml-auto text-xs text-zinc-600">⌘K</span>
            </button>
            <button
              onClick={handleNewNote}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
              <span className="ml-auto text-xs text-zinc-600">⌘N</span>
            </button>
          </div>

          <div className="px-3 mb-1 flex items-center justify-between">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Categories</span>
            <button
              onClick={() => setCreateCatOpen(true)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-2 space-y-0.5">
            {categories?.map((cat) => (
              <CategoryItem
                key={cat._id}
                category={cat}
                notes={getNotesForCategory(cat._id)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7 border border-zinc-700">
              <AvatarFallback className="bg-purple-900 text-purple-200 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-300 truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="text-zinc-500 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <CreateCategoryDialog open={createCatOpen} onOpenChange={setCreateCatOpen} />
    </>
  )
}
