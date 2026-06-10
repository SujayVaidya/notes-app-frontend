import { useState } from 'react'
import { Plus, Search, LogOut, ChevronRight } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CategoryItem } from '@/components/categories/CategoryItem'
import { CreateCategoryDialog } from '@/components/categories/CreateCategoryDialog'
import { useCategories } from '@/hooks/useCategories'
import { useNotes } from '@/hooks/useNotes'
import { useSignOut } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

export function AppSidebar() {
  const { data: categories } = useCategories()
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const setActiveCategory = useUIStore((s) => s.setActiveCategory)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()
  const [createCatOpen, setCreateCatOpen] = useState(false)

  const { data: allNotes } = useNotes()

  function getNotesCount(categoryId: string) {
    return allNotes?.filter((n) => n.categoryId === categoryId).length ?? 0
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <>
      <Sidebar className="border-r border-zinc-800">
        <SidebarHeader className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-500 text-lg">⬡</span>
              <span className="font-semibold text-zinc-100">Notes</span>
            </div>
            <SidebarTrigger className="text-zinc-400 hover:text-zinc-100" />
          </div>
        </SidebarHeader>

        <SidebarContent className="py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setSearchOpen(true)}
                    className="text-zinc-400 hover:text-zinc-100 gap-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                    <span className="ml-auto text-xs text-zinc-600">⌘K</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCreateNoteOpen(true)}
                    className="text-zinc-400 hover:text-zinc-100 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Note</span>
                    <span className="ml-auto text-xs text-zinc-600">⌘N</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between px-3 text-xs text-zinc-500 uppercase tracking-wider">
              <span>Categories</span>
              <button
                onClick={() => setCreateCatOpen(true)}
                className="hover:text-zinc-300 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-0.5">
                <button
                  onClick={() => { setActiveCategory(null); setActiveNote(null) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeCategoryId === null
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  All Notes
                </button>
                {categories?.map((cat) => (
                  <CategoryItem
                    key={cat._id}
                    category={cat}
                    noteCount={getNotesCount(cat._id)}
                  />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-zinc-800 px-4 py-3">
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
        </SidebarFooter>
      </Sidebar>

      <CreateCategoryDialog open={createCatOpen} onOpenChange={setCreateCatOpen} />
    </>
  )
}
