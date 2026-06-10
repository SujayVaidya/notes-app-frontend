import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeCategoryId: string | null
  activeNoteId: string | null
  searchQuery: string
  noteListView: 'list' | 'grid'
  focusMode: boolean
  searchOpen: boolean
  createNoteOpen: boolean
  setSidebarOpen: (v: boolean) => void
  setActiveCategory: (id: string | null) => void
  setActiveNote: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setNoteListView: (v: 'list' | 'grid') => void
  toggleFocusMode: () => void
  setSearchOpen: (v: boolean) => void
  setCreateNoteOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeCategoryId: null,
  activeNoteId: null,
  searchQuery: '',
  noteListView: 'list',
  focusMode: false,
  searchOpen: false,
  createNoteOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setActiveCategory: (id) => set({ activeCategoryId: id }),
  setActiveNote: (id) => set({ activeNoteId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setNoteListView: (v) => set({ noteListView: v }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setCreateNoteOpen: (v) => set({ createNoteOpen: v }),
}))
