import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/stores/uiStore'

beforeEach(() => {
  useUIStore.setState({
    sidebarOpen: true,
    activeCategoryId: null,
    activeNoteId: null,
    searchQuery: '',
    noteListView: 'list',
    focusMode: false,
    searchOpen: false,
    createNoteOpen: false,
  })
})

describe('uiStore', () => {
  it('setSidebarOpen toggles the sidebar', () => {
    useUIStore.getState().setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('setActiveCategory updates activeCategoryId', () => {
    useUIStore.getState().setActiveCategory('cat-abc')
    expect(useUIStore.getState().activeCategoryId).toBe('cat-abc')
    useUIStore.getState().setActiveCategory(null)
    expect(useUIStore.getState().activeCategoryId).toBeNull()
  })

  it('setActiveNote updates activeNoteId', () => {
    useUIStore.getState().setActiveNote('note-xyz')
    expect(useUIStore.getState().activeNoteId).toBe('note-xyz')
    useUIStore.getState().setActiveNote(null)
    expect(useUIStore.getState().activeNoteId).toBeNull()
  })

  it('setSearchQuery stores the query string', () => {
    useUIStore.getState().setSearchQuery('hello world')
    expect(useUIStore.getState().searchQuery).toBe('hello world')
  })

  it('setNoteListView switches between list and grid', () => {
    useUIStore.getState().setNoteListView('grid')
    expect(useUIStore.getState().noteListView).toBe('grid')
    useUIStore.getState().setNoteListView('list')
    expect(useUIStore.getState().noteListView).toBe('list')
  })

  it('toggleFocusMode flips focusMode each call', () => {
    expect(useUIStore.getState().focusMode).toBe(false)
    useUIStore.getState().toggleFocusMode()
    expect(useUIStore.getState().focusMode).toBe(true)
    useUIStore.getState().toggleFocusMode()
    expect(useUIStore.getState().focusMode).toBe(false)
  })

  it('setSearchOpen controls search dialog visibility', () => {
    useUIStore.getState().setSearchOpen(true)
    expect(useUIStore.getState().searchOpen).toBe(true)
    useUIStore.getState().setSearchOpen(false)
    expect(useUIStore.getState().searchOpen).toBe(false)
  })

  it('setCreateNoteOpen controls create dialog visibility', () => {
    useUIStore.getState().setCreateNoteOpen(true)
    expect(useUIStore.getState().createNoteOpen).toBe(true)
    useUIStore.getState().setCreateNoteOpen(false)
    expect(useUIStore.getState().createNoteOpen).toBe(false)
  })
})
