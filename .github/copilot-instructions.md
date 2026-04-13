# Copilot Instructions — Workshop Pulse

## Build & Lint

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint (flat config)
```

No test framework is configured.

## Architecture

React 19 SPA with Supabase backend (Postgres + Realtime). No auth system — participants join via 6-character codes and are tracked in localStorage.

### Routing (React Router v6)

| Route | Page | Role |
|-------|------|------|
| `/` | Landing | Entry point — trainer or participant |
| `/trainer` | TrainerHome | List/manage workshops |
| `/create` | TrainerSetup | Create workshop + sections |
| `/dashboard/:workshopId` | Dashboard | Live feedback view (trainer) |
| `/survey/:joinCode` | Survey | Submit feedback (participant) |

### Data Flow

Pages consume custom hooks (`src/hooks/`) which call Supabase directly — no state management library. Trainer dashboard receives live updates via Supabase Realtime subscriptions on the `feedback` table.

### Supabase Schema

Four tables: `workshops` → `sections` + `participants` → `feedback`. Schema lives in `supabase-schema.sql`. The Supabase client is a singleton in `src/supabase.ts`, configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Realtime Pattern

`useRealtimeFeedback` buffers incoming realtime events until the initial fetch completes, then merges and deduplicates by ID. This prevents double-rendering on slow connections.

## Conventions

### Components & Hooks

- Components use **default exports** (`export default function Name`).
- Hooks use **named exports** and live in `src/hooks/`.
- Props are defined via `interface Props` above each component.
- Hooks return `{ data, loading, error }` tuples consistently.

### Styling

All styles are in `src/styles/global.css` — no CSS modules or utility frameworks. Use existing CSS custom properties:

- Colors: `--purple`, `--blue`, `--green`, `--yellow`, `--orange`
- Spacing: `--space-xs` through `--space-2xl`
- Fonts: `--font-display` (Fraunces serif), `--font-body` (DM Sans)
- Classes follow kebab-case naming (`.section-nav-item`, `.feedback-entry`)

### Animations

- Entry animations: apply `.animate-in` with `.stagger-{1-4}` for sequential fade-in-up.
- Hover effects use the `--ease-spring` cubic-bezier timing.

### Error Handling

- Always check `err instanceof Error` before accessing `.message`.
- Errors display inline in the UI with `color: var(--orange)` — no toast/modal system.

### TypeScript

- Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled.
- Always type props, hook returns, and API responses — avoid `any`.
