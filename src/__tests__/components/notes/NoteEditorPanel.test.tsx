import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, act } from '@testing-library/react'
import { renderWithProviders, createMockNote } from '@/test/utils'
import { NoteEditorPanel } from '@/components/notes/NoteEditorPanel'
import { useUIStore } from '@/stores/uiStore'
import type { Note } from '@/types/note'

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockMutate, mockUseNote } = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockUseNote: vi.fn(),
}))

vi.mock('@/hooks/useNotes', () => ({
  useNote: (id: string | null) => mockUseNote(id),
  useUpdateNote: () => ({ mutate: mockMutate }),
}))

// Stub aceternity so they don't blow up jsdom
vi.mock('@/components/aceternity/shooting-stars', () => ({ ShootingStars: () => null }))
vi.mock('@/components/aceternity/stars-background', () => ({ StarsBackground: () => null }))

// Stub child editor components — we test them independently
vi.mock('@/components/notes/PlainTextEditor', () => ({
  PlainTextEditor: ({ initialContent }: { initialContent: string }) => (
    <textarea data-testid="plain-editor" defaultValue={initialContent} />
  ),
  plainDraftKey: (id: string) => `draft_plain_${id}`,
}))

vi.mock('@/components/notes/MarkdownEditor', () => ({
  MarkdownEditor: ({ initialContent }: { initialContent: string }) => (
    <div data-testid="md-editor">{initialContent}</div>
  ),
  mdDraftKey: (id: string) => `draft_md_${id}`,
}))

vi.mock('@/components/notes/TitleInput', () => ({
  TitleInput: ({ initialTitle }: { initialTitle: string }) => (
    <div data-testid="title-input">{initialTitle}</div>
  ),
}))

vi.mock('@/components/notes/NoteToolbar', () => ({
  NoteToolbar: ({ saveStatus }: { saveStatus: string }) => (
    <div data-testid="note-toolbar" data-save-status={saveStatus} />
  ),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

function setActiveNote(id: string | null) {
  useUIStore.setState({ activeNoteId: id })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  localStorage.clear()
  useUIStore.setState({ activeNoteId: null })
  // Default: no note loading, no note data
  mockUseNote.mockReturnValue({ data: null as Note | null, isLoading: false })
})
afterEach(() => {
  vi.useRealTimers()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NoteEditorPanel', () => {
  describe('empty / loading states', () => {
    it('shows "No note selected" when activeNoteId is null', () => {
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByText('No note selected')).toBeInTheDocument()
    })

    it('shows skeleton while note is loading', () => {
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: null, isLoading: true })
      renderWithProviders(<NoteEditorPanel />)
      // Shadcn Skeleton renders with animate-pulse
      expect(document.querySelector('[class*="animate-pulse"], .animate-pulse')).toBeInTheDocument()
      expect(screen.queryByTestId('plain-editor')).not.toBeInTheDocument()
    })

    it('shows "Note not found" when note fails to load', () => {
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: null, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByText('Note not found')).toBeInTheDocument()
    })
  })

  describe('note editor rendering', () => {
    it('renders the plain text editor for a text note', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('plain-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('md-editor')).not.toBeInTheDocument()
    })

    it('renders the markdown editor for a markdown note', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'markdown' })
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('md-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('plain-editor')).not.toBeInTheDocument()
    })

    it('passes server content to plain text editor when no draft exists', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text', plainTextContent: 'server content' })
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('plain-editor')).toHaveValue('server content')
    })

    it('passes server content to markdown editor when no draft exists', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'markdown', markdownContent: '# Server' })
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('md-editor')).toHaveTextContent('# Server')
    })
  })

  describe('localStorage draft restoration', () => {
    it('passes localStorage draft to plain text editor instead of server content', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text', plainTextContent: 'server' })
      localStorage.setItem('draft_plain_n1', 'local draft')
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('plain-editor')).toHaveValue('local draft')
    })

    it('passes localStorage draft to markdown editor instead of server content', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'markdown', markdownContent: '# Server' })
      localStorage.setItem('draft_md_n1', '# Local draft')
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('md-editor')).toHaveTextContent('# Local draft')
    })

    it('auto-syncs a plain text draft to the API on mount', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      localStorage.setItem('draft_plain_n1', 'offline work')
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(mockMutate).toHaveBeenCalledWith(
        { plainTextContent: 'offline work' },
        expect.anything()
      )
    })

    it('auto-syncs a markdown draft to the API on mount', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'markdown' })
      localStorage.setItem('draft_md_n1', '# Offline')
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(mockMutate).toHaveBeenCalledWith(
        { markdownContent: '# Offline' },
        expect.anything()
      )
    })

    it('does NOT call updateNote when there is no draft in localStorage', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('clears the draft from localStorage after a successful auto-sync', async () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      localStorage.setItem('draft_plain_n1', 'offline work')
      setActiveNote('n1')
      mockMutate.mockImplementation((_p: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      await act(async () => {
        renderWithProviders(<NoteEditorPanel />)
      })
      expect(localStorage.getItem('draft_plain_n1')).toBeNull()
    })

    it('keeps the draft in localStorage when auto-sync fails', async () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      localStorage.setItem('draft_plain_n1', 'offline work')
      setActiveNote('n1')
      mockMutate.mockImplementation((_p: unknown, cbs: { onError: () => void }) => cbs.onError())
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      await act(async () => {
        renderWithProviders(<NoteEditorPanel />)
      })
      expect(localStorage.getItem('draft_plain_n1')).toBe('offline work')
    })
  })

  describe('save status indicator', () => {
    it('toolbar shows idle status when no draft is pending', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      setActiveNote('n1')
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('note-toolbar')).toHaveAttribute('data-save-status', 'idle')
    })

    it('toolbar shows saving status while auto-sync is in progress', () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      localStorage.setItem('draft_plain_n1', 'draft')
      setActiveNote('n1')
      // mutate never calls callbacks so it stays "saving"
      mockMutate.mockImplementation(() => {})
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      renderWithProviders(<NoteEditorPanel />)
      expect(screen.getByTestId('note-toolbar')).toHaveAttribute('data-save-status', 'saving')
    })

    it('toolbar shows error status when auto-sync fails', async () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      localStorage.setItem('draft_plain_n1', 'draft')
      setActiveNote('n1')
      mockMutate.mockImplementation((_p: unknown, cbs: { onError: () => void }) => cbs.onError())
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      await act(async () => {
        renderWithProviders(<NoteEditorPanel />)
      })
      expect(screen.getByTestId('note-toolbar')).toHaveAttribute('data-save-status', 'error')
    })

    it('toolbar shows saved status after successful auto-sync', async () => {
      const note = createMockNote({ _id: 'n1', noteType: 'text' })
      localStorage.setItem('draft_plain_n1', 'draft')
      setActiveNote('n1')
      mockMutate.mockImplementation((_p: unknown, cbs: { onSuccess: () => void }) => cbs.onSuccess())
      mockUseNote.mockReturnValue({ data: note, isLoading: false })
      await act(async () => {
        renderWithProviders(<NoteEditorPanel />)
      })
      expect(screen.getByTestId('note-toolbar')).toHaveAttribute('data-save-status', 'saved')
    })
  })
})
