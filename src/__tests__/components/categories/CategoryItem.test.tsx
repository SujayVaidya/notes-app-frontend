import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockCategory } from '@/test/utils'
import { CategoryItem } from '@/components/categories/CategoryItem'
import { useUIStore } from '@/stores/uiStore'

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
    renderWithProviders(<CategoryItem category={defaultCat} />)
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('renders note count badge when notes are provided', () => {
    const mockNotes = [
      { _id: 'n1', title: 'Note 1', noteType: 'text', categoryId: 'cat-1', markdownContent: '', plainTextContent: '', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
      { _id: 'n2', title: 'Note 2', noteType: 'text', categoryId: 'cat-1', markdownContent: '', plainTextContent: '', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    ] as any[]
    renderWithProviders(<CategoryItem category={defaultCat} notes={mockNotes} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('sets active category on click', async () => {
    renderWithProviders(<CategoryItem category={customCat} />)
    await userEvent.click(screen.getByRole('button', { name: /work/i }))
    expect(useUIStore.getState().activeCategoryId).toBe('cat-2')
  })

  it('applies active styling when category is active', () => {
    useUIStore.setState({ activeCategoryId: 'cat-2' })
    renderWithProviders(<CategoryItem category={customCat} />)
    const btn = screen.getByRole('button', { name: /work/i })
    expect(btn.className).toContain('purple')
  })

  it('shows delete option for non-default categories (right-click)', async () => {
    renderWithProviders(<CategoryItem category={customCat} />)
    await userEvent.pointer({ target: screen.getByRole('button', { name: /work/i }), keys: '[MouseRight]' })
    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })
  })

  it('hides delete option for the default General category', async () => {
    renderWithProviders(<CategoryItem category={defaultCat} />)
    await userEvent.pointer({ target: screen.getByRole('button', { name: /general/i }), keys: '[MouseRight]' })
    await waitFor(() => {
      expect(screen.getByText(/rename/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument()
  })
})
