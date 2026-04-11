# Workshop Pulse

Real-time feedback for live coding workshops. Participants share thoughts as the workshop happens — not just at the end. Trainers see a live dashboard of responses.

## Quick Start

### 1. Set up Supabase

1. Create a [Supabase](https://supabase.com) project (free tier is fine)
2. Go to **SQL Editor** → New Query → paste the contents of `supabase-schema.sql` → Run
3. Copy your project URL and anon key from **Settings → API**

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

Or edit `.env` directly:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
npm install
npm run dev
```

### 4. Create a workshop

1. Go to `http://localhost:5173`
2. Click **"I'm a trainer — Create Workshop"**
3. Fill in title, your name, and section names
4. Share the **6-character join code** with participants

### 5. Participants join

1. Participants go to `http://localhost:5173`
2. Enter the join code and a nickname
3. Give feedback per section as the workshop progresses

## Tech Stack

- **React 19** + Vite + TypeScript
- **Supabase** (Postgres + Realtime)
- **Motion** for animations
- Custom CSS design system (editorial aesthetic)

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Purple | `#533473` | Primary brand |
| Soft Blue | `#697FBF` | Interactive elements |
| Green | `#3CA661` | Positive sentiment |
| Yellow | `#F2C849` | Neutral / highlights |
| Orange | `#F26B1D` | Negative / CTAs |

## Deploy to GitHub Pages

```bash
npm run build
# dist/ folder is ready for deployment
```
