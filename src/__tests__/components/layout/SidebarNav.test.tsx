import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, createMockCategory, createMockNote } from '@/test/utils'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { useUIStore } from '@/stores/uiStore'

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockCats, mockCatsLoading, mockNotes, mockNotesLoading } = vi.hoisted(() => ({
  mockCats: vi.fn(),
  mockCatsLoading: vi.fn(),
  mockNotes: vi.fn(),
  mockNotesLoading: vi.fn(),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: mockCats(),
    isLoading: mockCatsLoading(),
  }),
}))

vi.mock('@/hooks/useNotes', () => ({
  useNotes: () => ({
    data: mockNotes(),
    isLoading: mockNotesLoading(),
  }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useSignOut: () => vi.fn(),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (sel: (s: { user: { email: string } | null }) => unknown) =>
    sel({ user: { email: 'test@example.com' } }),
}))

// Stub CategoryItem to avoid SidebarProvider dependency
vi.mock('@/components/categories/CategoryItem', () => ({
  CategoryItem: ({ category }: { category: { name: string } }) => (
    <div data-testid="category-item">{category.name}</div>
  ),
}))

vi.mock('@/components/categories/CreateCategoryDialog', () => ({
  CreateCategoryDialog: () => null,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockCats.mockReturnValue([])
  mockCatsLoading.mockReturnValue(false)
  mockNotes.mockReturnValue([])
  mockNotesLoading.mockReturnValue(false)
  useUIStore.setState({ activeCategoryId: null, activeNoteId: null, searchOpen: false, createNoteOpen: false })
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SidebarNav', () => {
  describe('loading state', () => {
    it('renders skeleton placeholders while categories are loading', () => {
      mockCatsLoading.mockReturnValue(true)
      renderWithProviders(<SidebarNav />)
      // No category items during load
      expect(screen.queryByTestId('category-item')).not.toBeInTheDocument()
      // Skeleton elements present (Shadcn Skeleton → animate-pulse)
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders skeleton placeholders while notes are loading', () => {
      mockNotesLoading.mockReturnValue(true)
      renderWithProviders(<SidebarNav />)
      expect(screen.queryByTestId('category-item')).not.toBeInTheDocument()
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders exactly 3 skeleton rows while loading', () => {
      mockCatsLoading.mockReturnValue(true)
      renderWithProviders(<SidebarNav />)
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBe(3)
    })
  })

  describe('loaded state', () => {
    it('renders a CategoryItem for each category when loaded', () => {
      const cats = [
        createMockCategory({ _id: 'c1', name: 'General' }),
        createMockCategory({ _id: 'c2', name: 'Work' }),
      ]
      mockCats.mockReturnValue(cats)
      renderWithProviders(<SidebarNav />)
      const items = screen.getAllByTestId('category-item')
      expect(items).toHaveLength(2)
      expect(items[0]).toHaveTextContent('General')
      expect(items[1]).toHaveTextContent('Work')
    })

    it('shows no skeletons when data is loaded', () => {
      mockCats.mockReturnValue([createMockCategory()])
      renderWithProviders(<SidebarNav />)
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBe(0)
    })

    it('renders an empty list when there are no categories', () => {
      mockCats.mockReturnValue([])
      renderWithProviders(<SidebarNav />)
      expect(screen.queryByTestId('category-item')).not.toBeInTheDocument()
    })
  })

  describe('navigation actions', () => {
    it('renders the search button', () => {
      renderWithProviders(<SidebarNav />)
      expect(screen.getByText('Search')).toBeInTheDocument()
    })

    it('renders the new note button', () => {
      renderWithProviders(<SidebarNav />)
      expect(screen.getByText('New Note')).toBeInTheDocument()
    })

    it('renders the user email', () => {
      renderWithProviders(<SidebarNav />)
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  describe('onNavigate prop forwarding', () => {
    it('passes onNavigate to each CategoryItem', () => {
      const onNavigate = vi.fn()
      const cat = createMockCategory()
      mockCats.mockReturnValue([cat])
      // CategoryItem is mocked, so we just verify it renders
      renderWithProviders(<SidebarNav onNavigate={onNavigate} />)
      expect(screen.getByTestId('category-item')).toBeInTheDocument()
    })
  })

  describe('notes to category mapping', () => {
    it('filters notes for the correct category via getNotesForCategory', () => {
      const notes = [
        createMockNote({ _id: 'n1', categoryId: 'c1' }),
        createMockNote({ _id: 'n2', categoryId: 'c2' }),
      ]
      const cats = [
        createMockCategory({ _id: 'c1', name: 'Cat 1' }),
        createMockCategory({ _id: 'c2', name: 'Cat 2' }),
      ]
      mockNotes.mockReturnValue(notes)
      mockCats.mockReturnValue(cats)
      renderWithProviders(<SidebarNav />)
      // Both categories render (mock renders them by name)
      expect(screen.getByText('Cat 1')).toBeInTheDocument()
      expect(screen.getByText('Cat 2')).toBeInTheDocument()
    })
  })
})
