# Frontend Setup — Installation & Commands

## 1. Backend change required first

Add `noteType` to the Note model before starting the frontend.

### `src/models/note.model.ts` — add field
```ts
noteType: { type: String, enum: ['text', 'markdown'], default: 'text' },
```

### `src/validators/note.validator.ts` — update schemas
```ts
// add to createNoteSchema
noteType: z.enum(['text', 'markdown']).optional().default('text'),

// add to updateNoteSchema
noteType: z.enum(['text', 'markdown']).optional(),
```

---

## 2. Create the Vite project

```bash
npm create vite@latest notes-app-frontend -- --template react-ts
cd notes-app-frontend
npm install
```

---

## 3. Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/vite
```

In `vite.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

In `src/index.css`:
```css
@import "tailwindcss";
```

---

## 4. Shadcn/ui

```bash
npx shadcn@latest init
```

Choose: TypeScript, default style (New York), dark mode, CSS variables.

Then add components:
```bash
npx shadcn@latest add button card dialog dropdown-menu form input label \
  separator sheet tabs textarea tooltip badge scroll-area skeleton \
  popover command alert-dialog context-menu toggle toggle-group \
  resizable sidebar avatar
```

---

## 5. Core dependencies

```bash
npm install react-router-dom @supabase/supabase-js zustand @tanstack/react-query axios
```

## 6. Markdown editor

```bash
npm install @uiw/react-md-editor react-markdown remark-gfm rehype-highlight rehype-sanitize
```

## 7. Aceternity UI dependencies

```bash
npm install framer-motion clsx tailwind-merge
```

Aceternity components are **copy-paste** — visit https://ui.aceternity.com/components and copy the source for:
- `spotlight`
- `background-beams`
- `background-beams-with-collision`
- `text-generate-effect`
- `moving-border`
- `animated-tooltip`
- `wavy-background`
- `shimmer-button`
- `card-hover-effect`
- `floating-navbar`
- `lamp`

Place each copied component in `src/components/aceternity/`.

## 8. Utilities and extras

```bash
npm install lucide-react sonner date-fns react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query-devtools --save-dev
```

---

## 9. Environment variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 10. Run dev server

```bash
npm run dev
```
