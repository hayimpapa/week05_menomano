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
- No external runtime dependencies
