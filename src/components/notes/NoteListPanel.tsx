import { LayoutList, LayoutGrid, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { NoteCard } from './NoteCard'
import { WavyBackground } from '@/components/aceternity/wavy-background'
import { useNotes } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'

export function NoteListPanel() {
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const noteListView = useUIStore((s) => s.noteListView)
  const setNoteListView = useUIStore((s) => s.setNoteListView)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)
  const { data: categories } = useCategories()
  const { data: notes, isLoading } = useNotes(activeCategoryId ?? undefined)
  const { open: sidebarOpen } = useSidebar()

  const category = categories?.find((c) => c._id === activeCategoryId)
  const categoryName = activeCategoryId ? (category?.name ?? 'Notes') : 'All Notes'

  return (
    <div className="w-full md:w-70 md:shrink-0 md:border-r border-zinc-800 flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <SidebarTrigger className="hidden md:flex text-zinc-400 hover:text-zinc-100 -ml-1 shrink-0" />
          )}
          <div>
            <h2 className="font-semibold text-sm text-zinc-100">{categoryName}</h2>
            {notes && (
              <p className="text-xs text-zinc-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setNoteListView('list')}
            className={`p-1 rounded transition-colors ${noteListView === 'list' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setNoteListView('grid')}
            className={`p-1 rounded transition-colors ${noteListView === 'grid' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className={`p-2 ${noteListView === 'grid' ? 'grid grid-cols-2 gap-1' : 'space-y-1'}`}>
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        ) : (
          <div className="relative h-64 overflow-hidden">
            <WavyBackground containerClassName="h-full" waveOpacity={0.3}>
              <div className="text-center space-y-3">
                <p className="text-zinc-300 font-medium text-sm">No notes yet</p>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 gap-1.5"
                  onClick={() => setCreateNoteOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create first note
                </Button>
              </div>
            </WavyBackground>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
