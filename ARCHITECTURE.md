# Frontend Architecture

## System Overview

```
Browser
  └── React App (Vite)
        ├── Supabase Auth  ──→ JWT token
        ├── TanStack Query ──→ cache layer
        └── Axios          ──→ Express API (port 5000)
                                  └── MongoDB
```

---

## Route Structure

```
/                          LandingPage        (public)
/auth                      AuthPage           (public, redirect to /app if logged in)
/app                       AppPage            (protected shell)
  /app/                    → redirect to first category or empty state
  /app/notes/:noteId       NoteEditorView     (split: list + editor)
  /app/search              SearchView
/404                       NotFoundPage
```

All `/app/*` routes are wrapped in `<ProtectedRoute>` which checks `authStore.session` and redirects to `/auth` if null.

---

## State Architecture

### Server State — TanStack Query

```
QueryKey Structure:
  ['categories']                          → all user categories
  ['notes', { categoryId }]               → notes in a category
  ['notes', 'search', { query }]          → search results
  ['note', noteId]                        → single note (full content)
```

Stale time: 30s for lists, 60s for single notes.
Refetch on window focus: disabled (noisy for a notes app).

### UI State — Zustand

```ts
// authStore
{
  session: Session | null
  user: { id: string; email: string } | null
  setSession: (s: Session | null) => void
}

// uiStore
{
  sidebarOpen: boolean
  activeCategoryId: string | null
  activeNoteId: string | null
  searchQuery: string
  noteListView: 'list' | 'grid'
  setSidebarOpen: (v: boolean) => void
  setActiveCategory: (id: string | null) => void
  setActiveNote: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setNoteListView: (v: 'list' | 'grid') => void
}
```

---

## Component Hierarchy

```
App
├── Router
│   ├── / → LandingPage
│   │         ├── FloatingNavbar (Aceternity)
│   │         ├── HeroSection
│   │         │     ├── Spotlight (Aceternity)
│   │         │     ├── TextGenerateEffect (Aceternity)
│   │         │     └── ShimmerButton (Aceternity)
│   │         ├── FeaturesSection
│   │         │     └── CardHoverEffect (Aceternity)
│   │         └── Footer
│   │
│   ├── /auth → AuthPage
│   │             ├── BackgroundBeams (Aceternity)
│   │             ├── LampContainer (Aceternity)
│   │             └── AuthCard
│   │                   ├── LoginForm
│   │                   └── SignupForm
│   │
│   └── /app → ProtectedRoute → AppPage
│                 ├── Sidebar (collapsible)
│                 │     ├── UserMenu (avatar + sign out)
│                 │     ├── SearchBar (opens SearchView)
│                 │     ├── NewNoteButton
│                 │     └── CategoryList
│                 │           ├── CategoryItem (x each)
│                 │           │     └── MovingBorder when active (Aceternity)
│                 │           └── CreateCategoryDialog
│                 │
│                 └── MainPanel (resizable)
│                       ├── NoteListPanel
│                       │     ├── NoteListHeader (category name + controls)
│                       │     ├── NoteCard (x each)
│                       │     │     └── MovingBorder when active (Aceternity)
│                       │     └── EmptyState → WavyBackground (Aceternity)
│                       │
│                       └── NoteEditorPanel
│                             ├── NoteToolbar
│                             │     ├── TypeToggle (text ↔ markdown)
│                             │     ├── CategoryMoveDropdown
│                             │     ├── AnimatedTooltip buttons (Aceternity)
│                             │     └── DeleteButton
│                             ├── TitleInput
│                             └── EditorContent
│                                   ├── PlainTextEditor (when noteType='text')
│                                   └── MarkdownEditor (when noteType='markdown')
│                                         ├── MDEditor (@uiw/react-md-editor)
│                                         └── Preview toggle
```

---

## Data Flow: Creating a Note

```
1. User clicks "New Note" button in sidebar
2. uiStore.setActiveCategory(currentCategoryId)
3. CreateNoteDialog opens (or inline in editor panel)
4. User fills title, picks type (text/markdown)
5. onSubmit → useCreateNote().mutate({ title, markdownContent: '', categoryId, noteType })
6. API POST /api/v1/notes
7. On success:
   a. TanStack Query invalidates ['notes', { categoryId }]
   b. uiStore.setActiveNote(newNote._id)
   c. Router navigates to /app/notes/:newNoteId
   d. Sonner toast: "Note created"
```

## Data Flow: Editing a Note (Autosave)

```
1. User types in editor
2. Local state updated immediately (optimistic)
3. Debounce 800ms after last keystroke
4. useUpdateNote().mutate({ title, markdownContent, noteType })
5. API PATCH /api/v1/notes/:id
6. On success: TanStack Query invalidates ['note', noteId] and ['notes', ...]
7. Subtle "Saved" indicator in toolbar (not a toast — too noisy)
```

## Data Flow: Authentication

```
1. User submits login form
2. supabase.auth.signInWithPassword({ email, password })
3. On success: session returned
4. authStore.setSession(session)
5. axios interceptor picks up session.access_token for all future requests
6. router.navigate('/app')

On app load:
1. supabase.auth.getSession() called in App.tsx useEffect
2. If session exists: authStore.setSession(session), proceed to /app
3. If no session: user stays on / or /auth
4. supabase.auth.onAuthStateChange listener updates authStore on changes
```

---

## Note Editor Architecture

### Text Mode (`noteType = 'text'`)

```tsx
<textarea
  value={content}
  onChange={...}
  placeholder="Start writing..."
  className="w-full h-full resize-none bg-transparent text-foreground ..."
/>
```

Rendered with: plain `<pre>` or `<p>` tags, monospace optional.
Autosave: debounced 800ms.

### Markdown Mode (`noteType = 'markdown'`)

```tsx
<MDEditor
  value={content}
  onChange={...}
  preview="live"           // or "edit" | "preview"
  height="100%"
  data-color-mode="dark"
/>
```

The `@uiw/react-md-editor` handles split view internally.
Custom theme via CSS overrides in `src/styles/md-editor.css`.

### Type Toggle

Shown in NoteToolbar. When switching:
- `text → markdown`: just change noteType, content stays
- `markdown → text`: show `<AlertDialog>` warning that markdown syntax will be visible as raw text, require confirmation

---

## API Service Layer

```ts
// src/services/api.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().setSession(null)
      window.location.href = '/auth'
    }
    return Promise.reject(err.response?.data || err)
  }
)
```

---

## TanStack Query Setup

```ts
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## Environment Config

```ts
// src/config/env.ts
export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
}
```

---

## TypeScript Types

```ts
// src/types/note.ts
export type NoteType = 'text' | 'markdown'

export interface Note {
  _id: string
  userId: string
  categoryId: string
  title: string
  markdownContent?: string   // only present on getOne
  plainTextContent?: string
  noteType: NoteType
  createdAt: string
  updatedAt: string
}

// src/types/category.ts
export interface Category {
  _id: string
  userId: string
  name: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

---

## Responsive Layout Strategy

| Viewport | Layout |
|----------|--------|
| Mobile `< md` | Sidebar is a `Sheet` (drawer). Bottom tab bar with: Home, Search, New Note, Settings. |
| Tablet `md–lg` | Sidebar collapsible icon rail (icons only, expands on hover). |
| Desktop `> lg` | Full sidebar always visible. Note list + editor side-by-side (resizable). |

The `<Sidebar>` component from shadcn/ui handles the collapsible behavior with the `useSidebar()` hook.

---

## Key UX Behaviors

1. **Autosave**: Debounced 800ms. Show a small "Saved ✓" in toolbar that fades after 2s.
2. **Optimistic updates**: Title shown immediately in note list before API responds.
3. **Search**: Debounced 300ms. Results appear below search bar in sidebar or in a full search view.
4. **Category deletion**: AlertDialog confirmation. Notes move to General (backend handles this).
5. **New note shortcut**: `Cmd/Ctrl + N` opens create dialog.
6. **Focus mode**: `Cmd/Ctrl + .` hides sidebar and note list, full-screen editor.
7. **Dark mode**: Only dark mode. No toggle needed.
