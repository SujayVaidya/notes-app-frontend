import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { MobileTopBar } from './MobileTopBar'
import { NoteListPanel } from '@/components/notes/NoteListPanel'
import { NoteEditorPanel } from '@/components/notes/NoteEditorPanel'
import { CreateNoteDialog } from '@/components/notes/CreateNoteDialog'
import { SearchCommand } from '@/components/shared/SearchCommand'
import { useUIStore } from '@/stores/uiStore'

export function AppShell() {
  const focusMode = useUIStore((s) => s.focusMode)
  const createNoteOpen = useUIStore((s) => s.createNoteOpen)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)
  const activeNoteId = useUIStore((s) => s.activeNoteId)

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
          {!focusMode && (
            <div className={`${activeNoteId ? 'hidden md:flex' : 'flex'} flex-1 md:flex-none min-h-0 flex-col`}>
              <NoteListPanel />
            </div>
          )}
          <div className={`${!activeNoteId ? 'hidden md:flex' : 'flex'} flex-1 min-h-0 flex-col`}>
            <NoteEditorPanel />
          </div>
        </div>
      </SidebarInset>

      <CreateNoteDialog open={createNoteOpen} onOpenChange={setCreateNoteOpen} />
      <SearchCommand />
    </SidebarProvider>
  )
}
