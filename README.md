<div align="center">

<img src="./public/icons/android-chrome-192x192.png" alt="Logo" width="128">

# Simplistic Tetris V2

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=sass&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

<br>

> **Modern rewrite of my [first-year Bachelor's project](https://github.com/KevOneRedOne/Simplistic-Javascript-Tetris).** Rebuilding a fun project to create a production-ready game playable anywhere, anytime, while showcasing clean architecture and modern development practices. Have a break, play tetris !

<br>

[![🎮 Play Live Demo](https://img.shields.io/badge/🎮_Play_Live_Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white&labelColor=0A0E27&color=00C7B7)](https://simplistic-tetris.netlify.app)

[📝 Original Version](https://github.com/KevOneRedOne/Simplistic-Javascript-Tetris) | [📚 Documentation](./docs/)

</div>

<div align="center">

![Game Screenshot](./public/images/game-view.png)

</div>

<div align="center">

## 💖 Support

If you enjoy this game, please consider supporting the project. Your support helps me dedicate more time and energy to improve and expand the project.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-ffdd00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/kevoneredone)

</div>

---

## 📖 About The Project

This project is a modern TypeScript rewrite of my first-year Bachelor's group project. It transforms a simple academic project into a production-ready game that demonstrates:

- Clean architecture with separation of concerns
- Modern development practices and patterns
- TypeScript mastery with strict mode
- Professional code organization and testing
- Responsive design and mobile support

### ✨ Key Features

- 🎮 **Two Game Modes** - Classic (infinite) and Ultra (2-minute challenge)
- 👻 **Ghost Piece** - See where your piece will land
- 💾 **Hold System** - Save a piece for later use
- 🎨 **4 Themes** - Classic, Dark, Neon, Retro
- 🌍 **i18n Support** - French and English with extensible system
- 📱 **Fully Responsive** - Adaptive touch controls with gesture support for mobile
- 🎵 **Audio System** - Background music and sound effects
- 📊 **FPS Counter** - Real-time performance monitoring
- 🏆 **High Scores** - Persistent leaderboard per game mode

### 🛠️ Built With

- **TypeScript 5.x** - Strict mode for type safety
- **Vite 6.x** - Fast build tool with HMR
- **Vitest** - Unit testing framework
- **SCSS** - CSS preprocessor with modules
- **Canvas API** - Game rendering

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/KevOneRedOne/Simplistic-Tetris.git
   cd Simplistic-Tetris
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start development server

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

### Available Scripts

```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

---

## 🎮 Usage

### How to Play

#### Keyboard Controls

| Key              | Action          |
| ---------------- | --------------- |
| **← →**          | Move left/right |
| **↑**            | Rotate piece    |
| **↓**            | Soft drop       |
| **Space**        | Hard drop       |
| **Shift**        | Hold piece      |
| **Esc** or **P** | Pause game      |
| **Enter**        | Restart game    |

#### Mobile Controls

- **Swipe left/right** ⬅️➡️: Move piece
- **Swipe down** ⬇️: Soft drop
- **Swipe up** ⬆️: Rotate piece
- **Single tap** 👆: Rotate piece
- **Double tap** 👆👆: Hard drop

> 📱 **Full mobile support** with adaptive swipe sensitivity! See [Mobile Features Guide](./docs/MOBILE-FEATURES.md) for details.

### Game Modes

- **🎮 Classic Mode**: Traditional Tetris. Play until game over. Clear lines to level up.
- **⚡ Ultra Mode**: Time attack. Score maximum points in 2 minutes!

---

## 🏗️ Architecture

### From Monolith to Modular

<details>
<summary><strong>🔴 Before (V1 - Vanilla JS)</strong> - Click to view diagram</summary>

```mermaid
graph TD
    A[index.html] --> B[main.js]
    B --> C[Piece.js]
    B --> D[tetrominoes.js]
    B --> E[fps.js]
    B --> F[styles.css]

    C --> G[Mixed Logic:<br/>Game + Rendering + UI]
    D --> G

    style G fill:#f5b5b5,stroke:#c77,stroke-width:2px,color:#333
    style B fill:#f4d190,stroke:#d6a86f,stroke-width:2px,color:#333
    style C fill:#f4d190,stroke:#d6a86f,stroke-width:2px,color:#333
```

**Characteristics:**

- ❌ Vanilla JavaScript (no typing)
- ❌ Mixed concerns in single files
- ❌ No test coverage
- ❌ Basic CSS styling
- ❌ Manual FPS counter
- ❌ French only

</details>

<details>
<summary><strong>🟢 After (V2 - TypeScript Modern)</strong> - Click to view diagram</summary>

```mermaid
graph TD
    A[index.html] --> B[main.ts]

    B --> C[Core Layer]
    B --> D[Rendering Layer]
    B --> E[UI Layer]
    B --> F[Input Layer]
    B --> G[i18n Layer]

    C --> C1[GameEngine.ts]
    C --> C2[Board.ts]
    C --> C3[Tetromino.ts]
    C --> C4[CollisionDetector.ts]
    C --> C5[ScoringSystem.ts]
    C --> C6[GameModes.ts]

    D --> D1[CanvasRenderer.ts]
    D --> D2[AnimationEngine.ts]
    D --> D3[ThemeManager.ts]

    E --> E1[UIManager.ts]
    E --> E2[AudioManager.ts]
    E --> E3[HighScoreManager.ts]
    E --> E4[FPSCounter.ts]

    F --> F1[InputHandler.ts]

    G --> G1[i18n.ts]
    G --> G2[locales/]

    H[Tests] --> C

    style C fill:#8fc994,stroke:#5a9,stroke-width:2px,color:#fff
    style D fill:#7ba4db,stroke:#4a8ad6,stroke-width:2px,color:#fff
    style E fill:#d9a7c7,stroke:#c77aa4,stroke-width:2px,color:#fff
    style F fill:#f4c790,stroke:#d6a86f,stroke-width:2px,color:#333
    style G fill:#c9a0dc,stroke:#a67bc8,stroke-width:2px,color:#fff
    style H fill:#8b9dc3,stroke:#6a7fa8,stroke-width:2px,color:#fff
```

**Characteristics:**

- ✅ TypeScript strict mode
- ✅ Clean separation of concerns
- ✅ Unit tests (Vitest)
- ✅ Modern SCSS architecture
- ✅ Integrated FPS counter
- ✅ Multi-language (FR/EN)
- ✅ Optimized Vite build

</details>

### Architecture Principles

1. **Separation of Concerns** - Game logic, rendering, and UI are independent
2. **Testability** - Pure functions and dependency injection
3. **Immutability** - Game state updates create new objects
4. **Event-Driven** - Loose coupling through event emitters
5. **SOLID Principles** - Single responsibility, open for extension

### Design Patterns

- 🏭 Factory Pattern (Tetromino creation)
- 👁️ Observer Pattern (Event-driven game events)
- 🔒 Singleton Pattern (i18n, ThemeManager)
- 🎯 Strategy Pattern (Game modes)
- 📦 Module Pattern (Organized file structure)

---

## 📚 Documentation

- [🎵 Music Setup](./docs/MUSIC_SETUP.md) - How to add custom background music
- [📱 Mobile Features](./docs/MOBILE-FEATURES.md) - Complete guide to touch controls, responsive design, and mobile optimization

---

## 🧪 Testing

### Quick Start

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# View coverage HTML
open coverage/index.html
```

### Test Suite

| Test Type | Files | Tests | Coverage |
|-----------|-------|-------|----------|
| Unit Tests | 7 | 170 | 30-95% |
| E2E Tests | - | Planned | - |

**Coverage Highlights:**

- ✅ GameEngine: 77.18% (36 tests)
- ✅ UIManager: 95.72% (43 tests)
- ✅ AnimationEngine: 96.22% (25 tests)
- ✅ InputHandler: 74.41% (22 tests)
- ✅ Board: 66.34% (13 tests)
- ✅ Tetromino: 82.5% (15 tests)
- ✅ ScoringSystem: 38.88% (16 tests)

**Tested Functionality:**

- ✅ Board state management and collision detection
- ✅ Game engine orchestration and event system
- ✅ Scoring calculations and level progression
- ✅ Tetromino rotation and movement
- ✅ Input handling (keyboard and touch)
- ✅ UI management and modal system
- ✅ Animation system and particle effects

See [Testing Guide](./docs/TESTING.md) for detailed information.

---

## 🔍 SEO & discoverability

The site is set up for search engines and crawlers:

- **Meta & Open Graph**: Title, description, and social cards are set in `index.html`; align with the main tagline when changing copy.
- **robots.txt** (`public/robots.txt`): Allows indexing of the app and static assets; disallows `/reports/` and `/assets/` (build artifacts). Points to the sitemap.
- **sitemap.xml** (`public/sitemap.xml`): Single-page sitemap with alternates and image entries. Update `lastmod` when you make meaningful content or SEO changes.
- **Structured data**: JSON-LD for `VideoGame`, `WebApplication`, `WebSite`, and `BreadcrumbList` is included in the main HTML.

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome! Feel free to open an issue or submit a pull request.

### How to Contribute

1. 🐛 **Report Bugs**: Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
2. 💡 **Suggest Features**: Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. 🔧 **Submit PRs**: Follow the [pull request template](.github/pull_request_template.md)

For more details, see our [Contributing Guide](.github/CONTRIBUTING.md).

---

## ☕ Support

If you enjoy this game, consider supporting the project:

- [☕ Buy me a coffee](https://buymeacoffee.com/kevoneredone) - Support with a small donation
- [🐛 Report an issue](https://github.com/KevOneRedOne/Simplistic-Tetris/issues/new/choose) - Help improve the game
- [🔧 Contribute](https://github.com/KevOneRedOne/Simplistic-Tetris) - Submit a pull request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This project is a modern rewrite of my first-year Bachelor's group project. The original V1 project was built with the help of the following resources:

### Tutorials & Learning Resources

- [Javascript Tetris tutorial](https://www.codeexplained.org/2018/08/create-tetris-game-using-javascript.html) by CodeExplained
- [JSON tutorial](https://www.youtube.com/watch?v=DFhmNLKwwGw) by James Q Quick
- [MDN Web Docs](https://developer.mozilla.org/fr/docs/Web/JavaScript) - JavaScript documentation
- [DevDocs](https://devdocs.io/javascript/) - JavaScript API documentation
- [W3Schools](https://www.w3schools.com/js/default.asp) - JavaScript tutorials
- Lyon YNOV Campus's Object and DOM tutorials
- [Chrono JavaScript tutorial](https://forum.alsacreations.com/topic-5-76681-1-Chronometre-en-Javascript-demarrage-automatique.html) by Alsacréations
- [Best-README-Template] (https://github.com/othneildrew/Best-README-Template) by othneildrew

### Original Project Contributors

The original V1 project was a group effort with:

- Me (KevOneRedOne)
- Djoudi Yanis (Tadayoshi123)
- Moren Yohan (BoSswosile)

---

<div align="center">

⭐ **Star this repo** if you found it interesting or useful for your learning journey!

</div>
