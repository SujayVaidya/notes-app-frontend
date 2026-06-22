import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/uiStore'
import { useCategories } from '@/hooks/useCategories'
import { SidebarNav } from './SidebarNav'

export function MobileTopBar() {
  const [open, setOpen] = useState(false)
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c._id === activeCategoryId)

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-65 bg-zinc-950 border-zinc-800">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <span className="text-sm font-medium text-zinc-300">
        {activeCategoryId ? (category?.name ?? 'Notes') : 'All Notes'}
      </span>

      <button
        onClick={() => setCreateNoteOpen(true)}
        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}
