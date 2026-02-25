# Source layout

Short overview of the `src/` folder structure.

## Entry point

- **`main.ts`** — Loads styles and instantiates `TetrisGame`.

## Folders

| Folder | Role |
|--------|------|
| **`app/`** | Application orchestration. |
| **`app/session/`** | One game session: `GameSession`, `GameLoop`, input/event wiring (`gameSessionHandlers`). |
| **`app/setup/`** | UI setup: modals (mode select, game over), settings toggles, DOM i18n. |
| **`core/`** | Game rules and state only (no DOM, no I/O): `GameEngine`, `Board`, `Tetromino`, scoring, collisions. |
| **`input/`** | Keyboard and touch → actions (callbacks). |
| **`rendering/`** | Drawing: canvas, animations, theme. |
| **`ui/`** | Shared UI layer: HUD, modals display, audio, music, high scores, FPS. |
| **`i18n/`** | Translations (keys, locales, i18n instance). |
| **`types/`** | Shared types and enums. |
| **`constants/`** | Config (levels, keys, colors, paths). |
| **`styles/`** | SCSS (main entry, base, abstracts, components). |

## Flow

- **`core`**, **`input`**, **`rendering`**, **`ui`**, **`i18n`** are reusable layers.
- **`app/`** wires them: `TetrisGame` creates a `GameSession` (from `app/session/`) and uses `app/setup/` for modals and settings.
- **`app/session/`** runs a single game (engine + loop + handlers).
- **`app/setup/`** attaches UI to the app (modals, toggles, DOM translations).
