# 🎮 Simplistic Tetris V2 - Modern TypeScript Edition

![Simplistic Tetris V2](https://img.shields.io/badge/Simplistic%20Tetris-V2-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

> Refonte complète de mon projet Tetris original. Je voulais moderniser ce projet fun et pouvoir lancer une partie de Tetris n'importe où, n'importe quand.

[🎮 Play Live Demo](https://simplistic-tetris-v2.netlify.app) | [📝 Original Version](https://github.com/KevOneRedOne/Simplistic-Javascript-Tetris)

## 📸 Screenshots

<div align="center">
  <img src="./public/tetrispresentation.png" alt="Game Start Screen" width="600">
  <p><em>Modern start screen with game mode selection</em></p>
  
  <img src="./public/tetrisgame.png" alt="Gameplay" width="600">
  <p><em>Gameplay with next piece preview, hold system, and statistics</em></p>
</div>

## 🎯 Project Overview

This project is a complete modern rewrite of my original Tetris game. Built with TypeScript, Vite, and modern web technologies, it's designed to be playable anywhere, anytime. It demonstrates:

- **Refactor legacy code** into a clean, maintainable architecture
- **Apply SOLID principles** and design patterns
- **Write testable code** with proper separation of concerns
- **Implement modern UX features** that enhance gameplay
- **Build production-ready applications** with proper tooling

## ✨ What's New in V2

### 🏗️ Architecture & Code Quality

- **Full TypeScript rewrite** with strict mode enabled
- **Clean architecture** separating game engine, rendering, and UI logic
- **Event-driven design** for loose coupling between modules
- **Unit tests** with Vitest for critical game logic
- **ESLint & Prettier** configuration for code quality

### 🎮 Game Features

- **Classic Mode**: Play until game over, increase speed with levels
- **Ultra Mode**: 2-minute challenge for maximum points
- **Ghost Piece**: See where your piece will land
- **Hold System**: Save a piece for later use
- **Preview**: See the next piece coming
- **Combos & Achievements**: Special moves reward extra points

### 🎨 User Experience

- **4 Themes**: Classic, Dark, Neon, Retro
- **Smooth Animations**: Particle effects for line clears and events
- **Responsive Design**: Works on desktop and mobile
- **Touch Controls**: Swipe gestures for mobile play
- **Sound Effects**: Optional audio feedback
- **Internationalization**: French and English support

### 🛠️ Technical Stack

- **Language**: TypeScript 5.x (strict mode)
- **Build Tool**: Vite 6.x
- **Testing**: Vitest
- **Styling**: SCSS with BEM methodology
- **Deployment**: Netlify with optimized build
- **Code Quality**: ESLint, Prettier

## 📊 Before & After Comparison

| Aspect | V1 (Original) | V2 (Modern Rewrite) |
|--------|---------------|---------------------|
| **Language** | Vanilla JavaScript | TypeScript (strict) |
| **Architecture** | Mixed concerns | Clean, separated layers |
| **Testing** | None | Unit tests with Vitest |
| **Styling** | Basic CSS | SCSS with design system |
| **Build** | None | Vite with optimizations |
| **Features** | 1 game mode | 2 modes + extras |
| **i18n** | French only | FR/EN with extensible system |
| **Themes** | 1 theme | 4 themes |
| **Mobile** | Basic | Full touch support |
| **Code Lines** | ~600 | ~3000+ (modular) |

## 🏛️ Architecture

```
src/
├── core/              # Game engine (pure logic)
│   ├── Board.ts         - Grid state management
│   ├── Tetromino.ts     - Piece definitions & factory
│   ├── GameEngine.ts    - Main game orchestrator
│   ├── CollisionDetector.ts - Collision logic
│   ├── ScoringSystem.ts - Points & levels
│   └── GameModes.ts     - Mode configurations
│
├── rendering/         # Visual layer
│   ├── CanvasRenderer.ts - Canvas drawing
│   ├── AnimationEngine.ts - Particle effects
│   └── ThemeManager.ts   - Theme switching
│
├── input/             # User input
│   └── InputHandler.ts  - Keyboard & touch
│
├── ui/                # UI Management
│   ├── UIManager.ts        - DOM updates
│   ├── AudioManager.ts     - Sound effects
│   └── HighScoreManager.ts - Score persistence
│
├── i18n/              # Internationalization
│   ├── i18n.ts         - Translation system
│   └── locales/        - Language files
│
└── styles/            # SCSS architecture
    ├── abstracts/      - Variables & mixins
    ├── base/           - Reset & typography
    └── main.scss       - Main stylesheet
```

### Design Patterns Used

- **Factory Pattern**: Tetromino creation
- **Observer Pattern**: Event-driven game events
- **Singleton Pattern**: i18n, ThemeManager
- **Strategy Pattern**: Game modes
- **Module Pattern**: Organized file structure

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/KevOneRedOne/Simplistic-Tetris.git
cd Simplistic-Tetris

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
```

## 🎮 How to Play

### Keyboard Controls

- **← →** : Move left/right
- **↑** or **Z** : Rotate piece
- **↓** or **S** : Soft drop
- **Space** : Hard drop
- **C** or **Shift** : Hold piece
- **Esc** or **P** : Pause game
- **Enter** : Restart game

### Mobile Controls

- **Swipe left/right** : Move piece
- **Swipe down** : Soft drop
- **Tap** : Rotate piece

### Game Modes

**Classic Mode**: Traditional Tetris. Play until game over. Clear lines to level up and increase falling speed.

**Ultra Mode**: Time attack mode. Score as many points as possible in 2 minutes!

## 🧪 Testing

The project includes unit tests for critical game logic:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Test coverage focuses on:
- Board state management
- Collision detection
- Scoring calculations
- Tetromino rotations

## 📝 Technical Decisions

### Why TypeScript?

TypeScript provides type safety, better IDE support, and catches errors at compile time. The strict mode ensures maximum type coverage.

### Why Vite?

Vite offers fast HMR, optimized builds, and excellent DX. It's perfect for modern frontend projects.

### Why Custom i18n?

A lightweight custom solution keeps bundle size small while providing exactly what we need. Easy to understand and extend.

### Architecture Philosophy

The codebase follows these principles:

1. **Separation of Concerns**: Game logic, rendering, and UI are independent
2. **Testability**: Pure functions and dependency injection enable testing
3. **Immutability**: Game state updates create new objects
4. **Event-Driven**: Loose coupling through event emitters
5. **SOLID Principles**: Single responsibility, open for extension

## 🚀 Deployment

The project is configured for Netlify deployment:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Features:
- Automatic deploys on push to main
- Optimized asset caching
- Security headers configured
- SPA redirects handled

## 📈 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Bundle Size**: < 150KB gzipped
- **First Load**: < 1s on 3G
- **60 FPS**: Smooth gameplay on all devices

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome! Feel free to open an issue.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original project by [Average-JS-Enjoyers](https://github.com/KevOneRedOne/Simplistic-Javascript-Tetris)
- Inspired by classic Tetris and modern game implementations
- Thanks to the open-source community for tools and libraries

## 📫 Contact

**Kevin Alves**
- GitHub: [@KevOneRedOne](https://github.com/KevOneRedOne)
- Project Link: [https://github.com/KevOneRedOne/Simplistic-Tetris](https://github.com/KevOneRedOne/Simplistic-Tetris)

---

⭐ **Star this repo** if you found it interesting or useful for your learning journey!

*This project demonstrates my growth as a developer and my ability to refactor legacy code into modern, production-ready applications.*

