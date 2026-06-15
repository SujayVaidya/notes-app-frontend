import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { MobileTopBar } from './MobileTopBar'
import { NoteEditorPanel } from '@/components/notes/NoteEditorPanel'
import { CreateNoteDialog } from '@/components/notes/CreateNoteDialog'
import { SearchCommand } from '@/components/shared/SearchCommand'
import { useUIStore } from '@/stores/uiStore'

export function AppShell() {
  const focusMode = useUIStore((s) => s.focusMode)
  const createNoteOpen = useUIStore((s) => s.createNoteOpen)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)

  return (
    <SidebarProvider>
      {!focusMode && (
        <div className="hidden md:flex h-screen">
          <AppSidebar />
        </div>
      )}

      <SidebarInset className="flex flex-col min-h-screen bg-zinc-950">
        <MobileTopBar />
        <div className="flex flex-1 min-h-0">
          <NoteEditorPanel />
        </div>
      </SidebarInset>

      <CreateNoteDialog open={createNoteOpen} onOpenChange={setCreateNoteOpen} />
      <SearchCommand />
    </SidebarProvider>
  )
}
