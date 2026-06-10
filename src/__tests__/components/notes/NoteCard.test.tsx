import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockNote, createMockCategory } from '@/test/utils'
import { NoteCard } from '@/components/notes/NoteCard'
import { useUIStore } from '@/stores/uiStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockDeleteNote = { mutate: vi.fn(), isPending: false }
const mockMoveNote = { mutate: vi.fn(), isPending: false }
const mockCategories = { data: [createMockCategory({ _id: 'cat-2', name: 'Work', isDefault: false })] }

vi.mock('@/hooks/useNotes', () => ({
  useDeleteNote: () => mockDeleteNote,
  useMoveNote: () => mockMoveNote,
}))
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => mockCategories,
}))

beforeEach(() => {
  vi.clearAllMocks()
  useUIStore.setState({ activeNoteId: null })
})

describe('NoteCard', () => {
  const note = createMockNote({
    _id: 'note-1',
    title: 'My Test Note',
    plainTextContent: 'Some content here',
    noteType: 'text',
    categoryId: 'cat-1',
  })

  it('renders the note title', () => {
    renderWithProviders(<NoteCard note={note} />)
    expect(screen.getByText('My Test Note')).toBeInTheDocument()
  })

  it('renders the first line of plainTextContent', () => {
    renderWithProviders(<NoteCard note={note} />)
    expect(screen.getByText('Some content here')).toBeInTheDocument()
  })

  it('renders the noteType badge', () => {
    renderWithProviders(<NoteCard note={note} />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('renders markdown badge for markdown notes', () => {
    const mdNote = createMockNote({ noteType: 'markdown' })
    renderWithProviders(<NoteCard note={mdNote} />)
    expect(screen.getByText('markdown')).toBeInTheDocument()
  })

  it('shows "Untitled" when title is empty', () => {
    renderWithProviders(<NoteCard note={createMockNote({ title: '' })} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('calls setActiveNote and navigate on click', async () => {
    renderWithProviders(<NoteCard note={note} />)
    await userEvent.click(screen.getByRole('button'))
    expect(useUIStore.getState().activeNoteId).toBe('note-1')
    expect(mockNavigate).toHaveBeenCalledWith('/app/notes/note-1')
  })

  it('applies active styling when note matches activeNoteId', () => {
    useUIStore.setState({ activeNoteId: 'note-1' })
    renderWithProviders(<NoteCard note={note} />)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('purple')
  })
})
