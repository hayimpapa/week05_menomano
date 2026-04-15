# Menő Manó – La Linea Runner

An endless runner game inspired by the classic Italian animated character **La Linea** by Osvaldo Cavandoli. Guide Mano along an infinite road, placing the correct element to overcome each obstacle before it's too late!

## Gameplay

Mano runs automatically. Obstacles appear from the right — you must choose the correct action before he reaches them:

| Obstacle | Correct Action(s) | Description |
|----------|-------------------|-------------|
| **Gap** | Bridge | Creates an arc bridge across the pothole |
| **Wall** | Trampoline / Ladder | Jump over or climb the construction barrier |
| **Bird** | Duck | Crouch to avoid the flying crow |

Choosing the wrong action — or acting too late — ends the game. The speed increases with every point scored.

## Controls

### Keyboard

| Action | Keys |
|--------|------|
| Bridge | `1` / `A` / `←` |
| Trampoline | `2` / `S` / `↑` |
| Ladder | `3` / `D` / `→` |
| Duck | `4` / `F` / `↓` |
| Start Game | `Space` / `Enter` |

### Touch / Mobile

Tap the on-screen buttons at the bottom of the screen.

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal to play.

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- Vanilla JavaScript with HTML5 Canvas
- Vite for bundling and dev server
- Supabase (used only server-side from `api/scores.js`) for the global
  leaderboard

## Global Leaderboard

The game over screen shows a top-10 global leaderboard per difficulty
(Easy / Normal / Hard), backed by Supabase. All database access goes through
a single serverless function at `api/scores.js` — the client never talks to
Supabase directly.

### Supabase setup

1. Create a Supabase project.
2. Open the Supabase dashboard → **SQL editor** → **New query**.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and
   run it. This creates the `menomano_scores` table (single table, rows
   partitioned by a `difficulty` column so each category has its own
   leaderboard).

### Environment variables

The serverless function reads these two env vars. Set them on your hosting
platform (e.g. Vercel → Project → Settings → Environment Variables) and,
for local development, in a `.env.local` file at the project root:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key. **Never** expose this to the client — it bypasses Row Level Security. Always keep it server-side only. |

`.env.local` is already in `.gitignore`. Do not commit these values.

### Leaderboard rules

- Top 10 per difficulty, ordered by `score DESC`, then `created_at ASC`
  (earliest submission wins a tie).
- Max score: 99999 (clamped on both client and server).
- Max name length: 5 characters, `A–Z` and `0–9` only.
- No auth, no rate limiting, no duplicate prevention — keep it simple.
