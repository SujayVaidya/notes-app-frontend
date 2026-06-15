import { useState } from 'react'
import { Plus, Search, LogOut } from 'lucide-react'
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

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-zinc-800"
        style={{ '--sidebar-width-icon': '4.5rem' } as React.CSSProperties}
      >
        {/* Header — both layouts always in DOM, toggled via CSS */}
        <SidebarHeader className="border-b border-zinc-800 p-0 overflow-hidden">
          {/* Expanded */}
          <div className="flex items-center justify-between px-4 py-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <span className="text-purple-500 text-lg">⬡</span>
              <span className="font-semibold text-zinc-100">JayNotes</span>
            </div>
            <SidebarTrigger className="text-zinc-400 hover:text-zinc-100" />
          </div>
          {/* Collapsed */}
          <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2 py-4 w-full">
            <span className="text-purple-500 text-xl leading-none">⬡</span>
            <span className="text-[9px] font-bold text-zinc-500 tracking-[0.2em] uppercase select-none">
              Jay
            </span>
            <SidebarTrigger className="mt-1 text-zinc-400 hover:text-zinc-100" />
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
                    tooltip="Search"
                  >
                    <Search className="h-4 w-4 shrink-0" />
                    <span>Search</span>
                   
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCreateNoteOpen(true)}
                    className="text-zinc-400 hover:text-zinc-100 gap-2"
                    tooltip="New Note"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>New Note</span>
                    
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
              <SidebarMenu>
                {categories?.map((cat) => (
                  <SidebarMenuItem key={cat._id}>
                    <CategoryItem
                      category={cat}
                      notes={getNotesForCategory(cat._id)}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-zinc-800 p-0 overflow-hidden">
          {/* Expanded */}
          <div className="flex items-center gap-3 px-4 py-3 group-data-[collapsible=icon]:hidden">
            <Avatar className="h-7 w-7 border border-zinc-700 shrink-0">
              <AvatarFallback className="bg-purple-900 text-purple-200 text-xs">{initials}</AvatarFallback>
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
          {/* Collapsed */}
          <div className="hidden group-data-[collapsible=icon]:flex justify-center py-3">
            <Avatar className="h-7 w-7 border border-zinc-700">
              <AvatarFallback className="bg-purple-900 text-purple-200 text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </SidebarFooter>
      </Sidebar>

      <CreateCategoryDialog open={createCatOpen} onOpenChange={setCreateCatOpen} />
    </>
  )
}
