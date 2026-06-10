# Frontend Project Rules

## Project Overview

This is the frontend for a markdown-based note-taking application.
Backend API: Express/Node/MongoDB running on `VITE_API_BASE_URL`.
Auth: Supabase Auth — JWT token attached to every API request.

---

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4
- Shadcn/ui (New York style, CSS variables, dark theme)
- Aceternity UI (framer-motion based effects)
- React Router v6 (file-based routing pattern)
- Zustand (global UI state)
- TanStack Query v5 (server state, caching)
- Axios (HTTP, with auth interceptor)
- Supabase JS client (auth only)
- React Hook Form + Zod (forms)
- Sonner (toasts)
- @uiw/react-md-editor (markdown editing)
- react-markdown + remark-gfm + rehype-highlight (markdown preview/rendering)

---

## Architecture Rules

Required data flow:

```
pages → hooks (useQuery/useMutation) → services (axios) → backend API
pages → stores (zustand) → for UI state only (no server data in stores)
```

- Never fetch data directly in components — always through a custom hook
- Never put server data (notes, categories) in Zustand — use TanStack Query
- Zustand stores: only for `authStore` (session) and `uiStore` (sidebar open, current view, active note id)
- Every service function lives in `src/services/`
- Every API hook lives in `src/hooks/`
- No inline API calls anywhere

---

## Folder Structure

```
src/
  components/
    ui/              # shadcn auto-generated — never edit manually
    aceternity/      # aceternity copy-paste components
    layout/          # AppShell, Sidebar, TopBar
    notes/           # NoteCard, NoteList, NoteEditor, NoteToolbar, TypeToggle
    categories/      # CategoryItem, CategoryList, CreateCategoryDialog
    auth/            # LoginForm, SignupForm, AuthCard
    shared/          # ConfirmDialog, EmptyState, LoadingSpinner, SearchBar
  pages/
    LandingPage.tsx
    AuthPage.tsx
    AppPage.tsx       # protected shell, renders layout
  hooks/
    useNotes.ts       # useNotes, useNote, useCreateNote, useUpdateNote, useDeleteNote, useMoveNote, useSearchNotes
    useCategories.ts  # useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory
    useAuth.ts        # useSession, useSignIn, useSignUp, useSignOut
  stores/
    authStore.ts      # session, user
    uiStore.ts        # sidebarOpen, activeNoteId, searchQuery
  services/
    api.ts            # axios instance with auth interceptor
    notes.service.ts
    categories.service.ts
  lib/
    supabase.ts       # supabase client
    utils.ts          # cn() helper (clsx + tailwind-merge)
    queryClient.ts    # TanStack Query client config
  types/
    note.ts
    category.ts
    api.ts
  config/
    env.ts
  App.tsx
  main.tsx
```

---

## Note Types

Two note types exist. Both are stored as `markdownContent` (raw string) on the backend.

| Type | Editor | Description |
|------|--------|-------------|
| `text` | Textarea | Plain text. Default. No formatting. Stored as-is. |
| `markdown` | @uiw/react-md-editor | Markdown source + live preview. Stored as raw markdown. |

- `noteType` is set at note creation time and can be changed via a toggle in the editor toolbar
- When switching from `markdown` → `text`, warn the user that markdown syntax will remain as raw characters
- When in `text` mode, render the content in a `<pre>` or monospaced view
- When in `markdown` mode, offer split view (edit | preview) or toggle-able preview

---

## Design System

**Dark theme only.**

Color tokens (defined in `index.css` CSS variables):
- Background: `#09090b` (zinc-950)
- Surface/Card: `#18181b` (zinc-900)
- Border: `#27272a` (zinc-800)
- Primary accent: purple-600 `#9333ea`
- Foreground: zinc-50
- Muted: zinc-400

Sidebar width: `260px` (desktop), full-screen drawer (mobile).
Font: Inter (via Google Fonts or Fontsource).
Border radius: `0.5rem` (md).

---

## Aceternity UI Usage

Use Aceternity effects **only** in these specific locations:

| Component | Where |
|-----------|-------|
| `Spotlight` | Landing page hero section background |
| `BackgroundBeams` | Auth page background |
| `TextGenerateEffect` | Landing page H1 headline |
| `FloatingNavbar` | Landing page navigation |
| `LampContainer` | Auth page top decoration |
| `ShimmerButton` | Landing page primary CTA |
| `CardHoverEffect` | Landing page feature cards grid |
| `WavyBackground` | Empty state (no notes in category) |
| `MovingBorder` | Active/selected note card in list |
| `AnimatedTooltip` | Toolbar icon buttons in note editor |
| `BackgroundBeamsWithCollision` | 404 / error page |

Do **not** add Aceternity effects inside the main app dashboard (too much noise). Keep the editor experience clean.

---

## API Integration

All requests go through `src/services/api.ts` — an axios instance that:
1. Attaches `Authorization: Bearer <supabase_access_token>` on every request
2. Handles 401 by redirecting to `/auth`
3. Transforms responses to extract `data` field

Base URL: `VITE_API_BASE_URL` from env.

---

## Forms

Use React Hook Form + Zod for all forms. Never use uncontrolled inputs for data that gets sent to the server. Validation schemas mirror the backend Zod schemas.

---

## Error Handling

- API errors → Sonner toast (`toast.error(message)`)
- Form errors → inline via React Hook Form
- Route-level errors → error boundary component
- Loading states → always show skeleton/spinner, never empty flicker

---

## Code Style

- Functional components only, no class components
- Prefer named exports over default exports (except for pages and App)
- No prop drilling deeper than 2 levels — use Zustand or TanStack Query
- TypeScript strict mode — no `any`, no `!` non-null assertions in production code
- Self-closing tags when no children
- Tailwind classes ordered: layout → spacing → color → typography → interactive
- No inline styles
- Keep components under 200 lines — extract subcomponents when longer

---

## Responsive Breakpoints

- Mobile (`< 768px`): Sidebar hidden, bottom nav or hamburger menu
- Tablet (`768px - 1024px`): Sidebar collapsible
- Desktop (`> 1024px`): Sidebar always visible, resizable panel layout

---

## Auth Flow

1. User visits `/` → Landing page
2. Clicks CTA → navigates to `/auth`
3. Signs in / signs up via Supabase Auth
4. On session established → redirect to `/app`
5. All `/app/*` routes are protected — redirect to `/auth` if no session
6. Supabase session is stored in `authStore`
7. Session token injected into all API requests by axios interceptor
8. On sign out → clear stores, redirect to `/`
