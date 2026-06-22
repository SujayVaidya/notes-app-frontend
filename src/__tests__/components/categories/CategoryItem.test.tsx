import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockCategory } from '@/test/utils'
import { CategoryItem } from '@/components/categories/CategoryItem'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useUIStore } from '@/stores/uiStore'

// SidebarMenuButton calls useSidebar() — wrap every render with SidebarProvider
function withSidebar(ui: React.ReactElement) {
  return <SidebarProvider>{ui}</SidebarProvider>
}

const mockDelete = { mutate: vi.fn(), isPending: false }
const mockUpdate = { mutate: vi.fn(), isPending: false }

vi.mock('@/hooks/useCategories', () => ({
  useDeleteCategory: () => mockDelete,
  useUpdateCategory: () => mockUpdate,
}))

beforeEach(() => {
  vi.clearAllMocks()
  useUIStore.setState({ activeCategoryId: null, activeNoteId: null })
})

describe('CategoryItem', () => {
  const defaultCat = createMockCategory({ _id: 'cat-1', name: 'General', isDefault: true })
  const customCat = createMockCategory({ _id: 'cat-2', name: 'Work', isDefault: false })

  it('renders the category name', () => {
    renderWithProviders(withSidebar(<CategoryItem category={defaultCat} />))
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('renders note count badge when notes are provided', () => {
    const mockNotes = [
      { _id: 'n1', title: 'Note 1', noteType: 'text', categoryId: 'cat-1', markdownContent: '', plainTextContent: '', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
      { _id: 'n2', title: 'Note 2', noteType: 'text', categoryId: 'cat-1', markdownContent: '', plainTextContent: '', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    ] as any[]
    renderWithProviders(withSidebar(<CategoryItem category={defaultCat} notes={mockNotes} />))
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('sets active category on click', async () => {
    renderWithProviders(withSidebar(<CategoryItem category={customCat} />))
    await userEvent.click(screen.getByRole('button', { name: /work/i }))
    expect(useUIStore.getState().activeCategoryId).toBe('cat-2')
  })

  it('applies active styling when category is active', () => {
    useUIStore.setState({ activeCategoryId: 'cat-2' })
    renderWithProviders(withSidebar(<CategoryItem category={customCat} />))
    const btn = screen.getByRole('button', { name: /work/i })
    expect(btn.className).toContain('purple')
  })

  it('shows delete option for non-default categories (right-click)', async () => {
    renderWithProviders(withSidebar(<CategoryItem category={customCat} />))
    await userEvent.pointer({ target: screen.getByRole('button', { name: /work/i }), keys: '[MouseRight]' })
    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })
  })

  it('hides delete option for the default General category', async () => {
    renderWithProviders(withSidebar(<CategoryItem category={defaultCat} />))
    await userEvent.pointer({ target: screen.getByRole('button', { name: /general/i }), keys: '[MouseRight]' })
    await waitFor(() => {
      expect(screen.getByText(/rename/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument()
  })
})

describe('CategoryItem — mobile onNavigate behaviour (bug #5 fix)', () => {
  const customCat = createMockCategory({ _id: 'cat-2', name: 'Work', isDefault: false })

  const mockNotes = [
    {
      _id: 'note-1',
      userId: 'user-1',
      title: 'My Note',
      noteType: 'text' as const,
      categoryId: 'cat-2',
      markdownContent: '',
      plainTextContent: '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    useUIStore.setState({ activeCategoryId: null, activeNoteId: null })
  })

  it('does NOT call onNavigate when a category row is clicked', async () => {
    const onNavigate = vi.fn()
    renderWithProviders(withSidebar(<CategoryItem category={customCat} onNavigate={onNavigate} />))
    await userEvent.click(screen.getByRole('button', { name: /work/i }))
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('expands the note accordion without closing the mobile sheet', async () => {
    const onNavigate = vi.fn()
    renderWithProviders(withSidebar(
      <CategoryItem category={customCat} notes={mockNotes} onNavigate={onNavigate} />
    ))
    await userEvent.click(screen.getByRole('button', { name: /work/i }))
    // Notes are now visible
    expect(screen.getByText('My Note')).toBeInTheDocument()
    // Sheet must still be open (onNavigate not called)
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('calls onNavigate when a note inside the expanded category is clicked', async () => {
    const onNavigate = vi.fn()
    renderWithProviders(withSidebar(
      <CategoryItem category={customCat} notes={mockNotes} onNavigate={onNavigate} />
    ))
    // Expand the category first
    await userEvent.click(screen.getByRole('button', { name: /work/i }))
    // Click the note
    await userEvent.click(screen.getByText('My Note'))
    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('sets the clicked note as the active note', async () => {
    renderWithProviders(withSidebar(<CategoryItem category={customCat} notes={mockNotes} />))
    await userEvent.click(screen.getByRole('button', { name: /work/i }))
    await userEvent.click(screen.getByText('My Note'))
    expect(useUIStore.getState().activeNoteId).toBe('note-1')
  })
})
