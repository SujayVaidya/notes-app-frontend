# Frontend Build Prompt

> Paste this entire prompt into a new Claude Code session inside the `notes-app-frontend` directory (after running the setup commands in SETUP.md).

---

## Context

Build a complete, production-quality frontend for a markdown note-taking application.

Backend is already running at `http://localhost:5000`. It is a Node/Express/MongoDB REST API with Supabase JWT auth. The full API contract is:

```
GET    /health
GET    /api/v1/categories
POST   /api/v1/categories          body: { name: string }
PATCH  /api/v1/categories/:id      body: { name: string }
DELETE /api/v1/categories/:id

GET    /api/v1/notes               query: ?categoryId&page&limit&sort
GET    /api/v1/notes/search        query: ?query&page&limit
GET    /api/v1/notes/:id
POST   /api/v1/notes               body: { title, markdownContent, categoryId, noteType }
PATCH  /api/v1/notes/:id           body: { title?, markdownContent?, noteType? }
DELETE /api/v1/notes/:id
PATCH  /api/v1/notes/:id/move      body: { categoryId }
```

All `/api/v1/*` routes require `Authorization: Bearer <supabase_access_token>`.

User hierarchy: User → Categories → Notes. Every user has a default `General` category that cannot be deleted.

Notes have two types:
- `text` (default): plain text content
- `markdown`: raw markdown stored as string, rendered as formatted HTML

---

## Tech Stack (already installed)

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4
- Shadcn/ui (New York, dark, CSS variables)
- Framer Motion + Aceternity UI components (in `src/components/aceternity/`)
- React Router v6
- Zustand
- TanStack Query v5
- Axios
- Supabase JS
- React Hook Form + Zod
- Sonner (toasts)
- @uiw/react-md-editor
- react-markdown + remark-gfm + rehype-highlight
- Lucide React icons
- date-fns

---

## What to build

Build **everything** listed below, in order. Do not skip any section.

---

### STEP 1 — Project foundation

1. Set up `src/config/env.ts` that reads and exports `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` from `import.meta.env`.

2. Set up `src/lib/supabase.ts` — create and export the Supabase client using `createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)`.

3. Set up `src/lib/utils.ts` — export `cn()` using `clsx` + `tailwind-merge`.

4. Set up `src/lib/queryClient.ts` — export a `QueryClient` with `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`.

5. Set up `src/types/note.ts`, `src/types/category.ts`, `src/types/api.ts` with the following types:

```ts
// note.ts
export type NoteType = 'text' | 'markdown'
export interface Note {
  _id: string
  userId: string
  categoryId: string
  title: string
  markdownContent?: string
  plainTextContent?: string
  noteType: NoteType
  createdAt: string
  updatedAt: string
}
export interface CreateNoteInput { title: string; markdownContent: string; categoryId: string; noteType: NoteType }
export interface UpdateNoteInput { title?: string; markdownContent?: string; noteType?: NoteType }

// category.ts
export interface Category {
  _id: string; userId: string; name: string; isDefault: boolean; createdAt: string; updatedAt: string
}

// api.ts
export interface ApiResponse<T> { success: boolean; message?: string; data?: T }
export interface PaginatedResponse<T> { success: boolean; data: T[]; pagination: { page: number; limit: number; total: number; pages: number } }
```

6. Set up `src/services/api.ts` — axios instance:
   - baseURL = `env.API_BASE_URL`
   - request interceptor: read `useAuthStore.getState().session?.access_token`, attach as `Authorization: Bearer ...`
   - response interceptor: on 401, call `useAuthStore.getState().setSession(null)` and `window.location.href = '/auth'`; otherwise return `res.data`; on error return `Promise.reject(err.response?.data ?? err)`

7. Set up `src/stores/authStore.ts` (Zustand):
```ts
{ session: Session | null; user: { id: string; email: string } | null; setSession: (s) => void; clearSession: () => void }
```

8. Set up `src/stores/uiStore.ts` (Zustand):
```ts
{
  sidebarOpen: boolean
  activeCategoryId: string | null
  activeNoteId: string | null
  searchQuery: string
  noteListView: 'list' | 'grid'
  focusMode: boolean
  setSidebarOpen: (v) => void
  setActiveCategory: (id) => void
  setActiveNote: (id) => void
  setSearchQuery: (q) => void
  setNoteListView: (v) => void
  toggleFocusMode: () => void
}
```

9. Set up `src/services/notes.service.ts` with functions: `getNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote`, `moveNote`, `searchNotes` — all using the `api` axios instance.

10. Set up `src/services/categories.service.ts` with: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`.

11. Set up `src/hooks/useCategories.ts`:
    - `useCategories()` → `useQuery(['categories'], getCategories)`
    - `useCreateCategory()` → `useMutation` that invalidates `['categories']` on success, shows `toast.success('Category created')`
    - `useUpdateCategory()` → `useMutation` with same invalidation
    - `useDeleteCategory()` → `useMutation` with same invalidation, shows warning toast

12. Set up `src/hooks/useNotes.ts`:
    - `useNotes(categoryId?)` → `useQuery(['notes', { categoryId }], ...)`
    - `useNote(noteId)` → `useQuery(['note', noteId], ...)`
    - `useCreateNote()` → `useMutation` invalidates `['notes']`, navigates to new note
    - `useUpdateNote()` → `useMutation` invalidates `['note', noteId]` and `['notes']`
    - `useDeleteNote()` → `useMutation`, navigates away, shows toast
    - `useMoveNote()` → `useMutation`, invalidates both old and new category note lists
    - `useSearchNotes(query)` → `useQuery(['notes', 'search', { query }], ...)`, enabled when `query.length > 1`

13. Set up `src/hooks/useAuth.ts`:
    - `useSignIn()` → calls `supabase.auth.signInWithPassword`, sets session, navigates to `/app`
    - `useSignUp()` → calls `supabase.auth.signUp`
    - `useSignOut()` → calls `supabase.auth.signOut`, clears stores, navigates to `/`
    - `useSession()` → returns current session from authStore

14. Set up `src/App.tsx`:
    - Wrap with `<QueryClientProvider>`, `<BrowserRouter>`, `<Toaster />` (Sonner)
    - On mount: call `supabase.auth.getSession()` → if session, call `authStore.setSession(session)`
    - Subscribe to `supabase.auth.onAuthStateChange` → update `authStore.setSession`
    - Routes: `/` → LandingPage, `/auth` → AuthPage, `/app/*` → ProtectedRoute → AppPage, `*` → NotFoundPage

15. Create `src/components/shared/ProtectedRoute.tsx` — reads `authStore.session`, redirects to `/auth` if null, otherwise renders `<Outlet />`.

---

### STEP 2 — Landing Page

File: `src/pages/LandingPage.tsx`

Design: Dark, dramatic, full-viewport hero. Think Linear/Vercel aesthetic.

Requirements:
1. **FloatingNavbar** (Aceternity): logo left, nav links center ("Features", "About"), "Sign In" button right.
2. **Hero section** — full viewport height, centered content:
   - `Spotlight` (Aceternity) as background layer
   - Badge: small pill "Now in beta" with a pulsing dot
   - **TextGenerateEffect** (Aceternity) for headline: `"Write without friction."`
   - Subheadline: `"A minimal note-taking app for focused writers. Plain text or rich markdown — your choice."` — static text, zinc-400, max-w-xl centered
   - Two buttons: `ShimmerButton` (Aceternity) "Get Started" → `/auth`, and ghost button "Learn more" → scrolls to features
3. **Features section** (below fold, `id="features"`):
   - Section title: "Everything you need, nothing you don't"
   - `CardHoverEffect` (Aceternity) grid of 6 feature cards:
     1. "Plain Text Notes" — Write fast without any markup
     2. "Markdown Support" — Full GFM markdown with live preview
     3. "Organized by Categories" — Group notes your way
     4. "Full-text Search" — Find anything instantly
     5. "Instant Autosave" — Never lose your work
     6. "Secure by Default" — Auth powered by Supabase
4. **Footer**: minimal, centered — "© 2025 Notes App" + GitHub link placeholder.

---

### STEP 3 — Auth Page

File: `src/pages/AuthPage.tsx`

Design: centered card on dark background with dramatic effects.

Requirements:
1. **BackgroundBeams** (Aceternity) as full-page background layer.
2. **LampContainer** (Aceternity) at top of page with the app logo / name inside it.
3. Centered `AuthCard` component with tabs: "Sign In" | "Sign Up" (shadcn `Tabs`).
4. **Sign In tab** — `LoginForm`:
   - Email + Password fields (React Hook Form + Zod: email required, password min 6)
   - "Sign In" button (shadcn `Button`, full width)
   - On success: navigate to `/app`, show `toast.success('Welcome back!')`
   - On error: show `toast.error(error.message)`
5. **Sign Up tab** — `SignupForm`:
   - Email + Password + Confirm Password fields
   - Confirm password validated to match password
   - "Create Account" button
   - On success: show `toast.success('Account created! Check your email.')` (Supabase sends confirmation)
   - On error: show `toast.error`
6. If already logged in, redirect to `/app`.
7. "Back to home" link below the card.

---

### STEP 4 — App Layout

File: `src/pages/AppPage.tsx` + `src/components/layout/`

This is the main protected application shell. Use the shadcn `Sidebar` component as the base.

#### AppPage.tsx
- Renders `<AppShell>` which contains the sidebar and main panel.
- On mount: if `activeCategoryId` is null, auto-select the first category returned from `useCategories()`.
- Keyboard shortcut: `Cmd/Ctrl+N` → trigger new note creation.
- Keyboard shortcut: `Cmd/Ctrl+.` → toggle `uiStore.focusMode`.

#### AppShell (`src/components/layout/AppShell.tsx`)
- Left: `<AppSidebar />` (260px, collapsible)
- Right: `<MainPanel />` (flex-1)
- When `focusMode` is true: hide sidebar and note list panel, show only full-screen editor

#### AppSidebar (`src/components/layout/AppSidebar.tsx`)
Use shadcn `Sidebar` component. Structure:
- **Top**: App logo + name, collapse toggle button
- **UserSection**: Avatar (initials from email), email truncated, sign out button
- **Search button**: clicking opens a full `CommandDialog` (shadcn) for search
- **"New Note" button**: plus icon, triggers `CreateNoteDialog`
- **Categories section** with header "Categories" + add button:
  - List of `CategoryItem` components
  - "All Notes" item at top (no category filter)
- **Bottom**: keyboard shortcuts hint

#### CategoryItem (`src/components/categories/CategoryItem.tsx`)
- Shows category name + note count badge
- Active state: wrap with `MovingBorder` (Aceternity) or use a purple left border indicator
- Right-click or hover → context menu (shadcn `ContextMenu`):
  - Rename → opens inline edit or dialog
  - Delete → `AlertDialog` confirmation. Show "Notes will be moved to General" in description.
- Default category (General) cannot be deleted — hide delete option for it

#### CreateCategoryDialog (`src/components/categories/CreateCategoryDialog.tsx`)
- shadcn `Dialog` with a single name input
- Validates: min 2 chars, max 50 chars
- On submit: `useCreateCategory().mutate`, close on success

---

### STEP 5 — Note List Panel

File: `src/components/notes/NoteListPanel.tsx`

Left panel in the main area (shown when a category is selected, hidden in focus mode).
Width: `280px` desktop. Full width mobile.

Structure:
1. **Header**: Category name (bold), note count, view toggle (list/grid icons)
2. **Note list**: `<ScrollArea>` containing `NoteCard` for each note
3. **Empty state**: When no notes in category, show `WavyBackground` (Aceternity) with text "No notes yet" and a "Create your first note" button
4. **Loading state**: 3x `<Skeleton>` cards

#### NoteCard (`src/components/notes/NoteCard.tsx`)
- Shows: title (bold, truncated), first line of `plainTextContent` (truncated, zinc-400), `noteType` badge (`text` = gray, `markdown` = purple), last updated relative time (date-fns `formatDistanceToNow`)
- Active (matches `activeNoteId`): Wrap entire card in `MovingBorder` (Aceternity) with purple color
- On click: `uiStore.setActiveNote(note._id)`, navigate to `/app/notes/:id`
- Right-click: `ContextMenu` with: Move to..., Delete
- Hover: show subtle zinc-800 background

---

### STEP 6 — Note Editor Panel

File: `src/components/notes/NoteEditorPanel.tsx`

The main editing area. Takes up remaining space after the note list panel.

When no note is selected:
- Show centered `EmptyState` with icon + "Select a note or create a new one"

When a note is selected (`activeNoteId` is set):
- Load note via `useNote(activeNoteId)`
- Show `<Skeleton>` during loading
- Render the full editor

#### NoteToolbar (`src/components/notes/NoteToolbar.tsx`)
Sticky top bar inside editor. Contains:
1. **Back button** (mobile only) — goes back to note list
2. **TypeToggle** — a `ToggleGroup` (shadcn) with two options: "Text" / "Markdown". When switching markdown→text show `AlertDialog` warning.
3. **Category move button** — icon + current category name → `Popover` with category list (shadcn `Command` inside) to move the note
4. **AnimatedTooltip** (Aceternity) wrapping icon buttons:
   - Copy content icon
   - Focus mode toggle icon
5. **Autosave indicator**: small text "Saved" or "Saving..." or dot indicator — appears after save, fades after 2s
6. **Delete button** (trash icon) → `AlertDialog` confirmation → `useDeleteNote()`

#### TitleInput (`src/components/notes/TitleInput.tsx`)
- Plain `<input>` styled as large heading (2xl, bold, no border, transparent bg)
- Placeholder: "Untitled"
- On change: update local state, debounce 800ms → `useUpdateNote().mutate({ title })`

#### PlainTextEditor (`src/components/notes/PlainTextEditor.tsx`)
- Shown when `noteType === 'text'`
- Full-height resizable `<textarea>` (or shadcn `Textarea` with `resize-none`)
- Font: monospace or sans-serif (user preference can be added later)
- No toolbar
- On change: update local state, debounce 800ms → `useUpdateNote().mutate({ markdownContent: value })`

#### MarkdownEditor (`src/components/notes/MarkdownEditor.tsx`)
- Shown when `noteType === 'markdown'`
- Use `@uiw/react-md-editor` (`MDEditor` from `@uiw/react-md-editor`)
- Props: `value`, `onChange`, `height="100%"`, `data-color-mode="dark"`, `preview="live"`
- Custom CSS to match app dark theme (override `--color-canvas-default`, etc.)
- On change: debounce 800ms → `useUpdateNote().mutate({ markdownContent: value })`

---

### STEP 7 — Search

File: `src/components/shared/SearchCommand.tsx`

Triggered by clicking the search button in the sidebar or `Cmd/Ctrl+K`.

Use shadcn `CommandDialog`:
1. Input at top (auto-focused)
2. While typing (debounced 300ms): call `useSearchNotes(query)` and show results
3. Results grouped by category name (use `CommandGroup`)
4. Each result: note title + first 60 chars of `plainTextContent` + `noteType` badge
5. On select: close dialog, `uiStore.setActiveNote`, navigate to `/app/notes/:id`
6. Empty state: "No notes found"

---

### STEP 8 — CreateNoteDialog

File: `src/components/notes/CreateNoteDialog.tsx`

Triggered by "New Note" button or `Cmd+N`.

shadcn `Dialog`:
1. Title input (React Hook Form, required, min 1 char)
2. Category selector: `Select` (shadcn) showing all user categories, default = `activeCategoryId`
3. Note type selector: `RadioGroup` (shadcn) — "Plain Text" (default) | "Markdown"
4. Brief description under each option:
   - Plain Text: "Simple, distraction-free writing"
   - Markdown: "Headers, bold, code blocks, and more"
5. "Create Note" button
6. On success: close dialog, navigate to the new note, focus title input

---

### STEP 9 — Global styles and theming

File: `src/index.css`

Define CSS variables for dark theme:
```css
@import "tailwindcss";

:root {
  --background: 9 9 11;
  --foreground: 250 250 250;
  --card: 24 24 27;
  --card-foreground: 250 250 250;
  --popover: 24 24 27;
  --popover-foreground: 250 250 250;
  --primary: 147 51 234;
  --primary-foreground: 250 250 250;
  --secondary: 39 39 42;
  --secondary-foreground: 250 250 250;
  --muted: 39 39 42;
  --muted-foreground: 161 161 170;
  --accent: 39 39 42;
  --accent-foreground: 250 250 250;
  --destructive: 239 68 68;
  --border: 39 39 42;
  --input: 39 39 42;
  --ring: 147 51 234;
  --radius: 0.5rem;
  --sidebar-background: 18 18 18;
  --sidebar-foreground: 250 250 250;
  --sidebar-border: 39 39 42;
}
```

Also add global styles:
- `body`: `background-color: rgb(9,9,11)`, Inter font
- Scrollbar: thin, dark thumb, transparent track
- Selection: purple-900 background
- `@uiw/react-md-editor` theme overrides to match app dark theme

---

### STEP 10 — Error and loading states

1. **NotFoundPage** (`src/pages/NotFoundPage.tsx`):
   - `BackgroundBeamsWithCollision` (Aceternity) as background
   - Large "404" text
   - "Page not found" subtitle
   - "Go home" button

2. **ErrorBoundary** (`src/components/shared/ErrorBoundary.tsx`):
   - Class component wrapping routes
   - On error: show "Something went wrong" with retry button

3. **LoadingSpinner** (`src/components/shared/LoadingSpinner.tsx`):
   - Centered spinner using a Lucide `Loader2` icon with `animate-spin`

4. **EmptyState** (`src/components/shared/EmptyState.tsx`):
   - Accepts `icon`, `title`, `description`, optional `action` button
   - Used for empty note lists, empty search results

---

### STEP 11 — Mobile navigation

For mobile (`< 768px`):
1. The sidebar becomes a `Sheet` (shadcn) opened by a hamburger button in a top bar
2. Top bar: hamburger icon (left) + current category name (center) + new note button (right)
3. File: `src/components/layout/MobileTopBar.tsx`
4. The note list and editor stack vertically instead of side-by-side
5. When a note is selected on mobile, the note list is hidden and the editor takes full screen
6. Back button in NoteToolbar navigates back to the note list

---

### STEP 12 — Final wiring

1. Ensure all routes work correctly with React Router `<Routes>` and `<Route>` in `App.tsx`
2. Ensure `ProtectedRoute` correctly guards `/app/*`
3. Ensure auth state is initialized before rendering routes (use a loading state while checking session)
4. Ensure Sonner `<Toaster>` is present in `App.tsx` with `theme="dark"` and `position="bottom-right"`
5. Ensure `<QueryClientProvider>` wraps everything
6. Add a global loading state for auth initialization: while `supabase.auth.getSession()` is in-flight, show a full-screen spinner
7. Ensure `useEffect` in `App.tsx` correctly listens to `onAuthStateChange` and cleans up the subscription

---

## Design requirements

- **Dark only**. No light mode toggle.
- **Accent color**: Purple (`#9333ea` / `purple-600`). Use sparingly on active states, badges, CTAs.
- **Typography**: Clean, hierarchical. Notes titles in `text-xl font-semibold`. Body in `text-sm`. Muted text in `text-zinc-400`.
- **Spacing**: Comfortable. Not cramped. At least `p-4` for content areas.
- **Borders**: Subtle. `border-zinc-800` everywhere.
- **Hover states**: Subtle `bg-zinc-800/50` or `bg-zinc-900`.
- **Transitions**: `transition-colors duration-150` on interactive elements.
- **No hard white backgrounds** anywhere in the app.
- **Aceternity effects**: Only on Landing, Auth, and 404 pages. The app dashboard should be clean and professional.

---

## Quality checklist (ensure before finishing)

- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No `any` types
- [ ] All forms show proper validation errors
- [ ] Loading skeletons shown while data loads
- [ ] Toasts appear on success and error for all mutations
- [ ] Autosave works for both text and markdown editors (debounced)
- [ ] Switching note types works with confirmation dialog for markdown→text
- [ ] Moving notes between categories works
- [ ] Category deletion moves notes to General (confirmed by backend)
- [ ] Search works and is debounced
- [ ] `Cmd/Ctrl+N` creates a new note
- [ ] `Cmd/Ctrl+K` opens search
- [ ] `Cmd/Ctrl+.` toggles focus mode
- [ ] Auth redirects work correctly
- [ ] Mobile layout doesn't break
- [ ] Aceternity components render correctly with no hydration errors
- [ ] Empty states appear when no notes/categories exist
- [ ] The `General` category cannot be deleted (no delete button shown)

---

## Important implementation notes

1. **Aceternity components**: These are already copied into `src/components/aceternity/`. Import directly from there.

2. **MDEditor SSR**: `@uiw/react-md-editor` has SSR issues. Since this is Vite (client-only), this is not a problem. But wrap it in a check: `typeof window !== 'undefined'`.

3. **Debounce autosave**: Use `useCallback` with a `useRef` to hold the timeout. Do NOT use a third-party debounce hook — implement it directly to keep control.

4. **Query key consistency**: Always use the exact same key structure when querying and invalidating. Use the constants defined in `hooks/useNotes.ts` for query keys.

5. **Optimistic updates**: For the note title in the list, update the query cache optimistically on `useUpdateNote` so the list feels instant.

6. **Supabase session refresh**: Supabase automatically refreshes tokens. The `onAuthStateChange` listener in `App.tsx` handles this — when the event is `TOKEN_REFRESHED`, update `authStore.setSession`.

7. **axios interceptor and Zustand**: The axios interceptor reads `useAuthStore.getState().session` directly (not via a hook) because it runs outside of React. This is correct Zustand usage.

8. **Category fetch on mount**: Categories are fetched immediately on entering `/app`. The first category is auto-selected. If no categories exist (shouldn't happen since General is always created), show an empty state.
