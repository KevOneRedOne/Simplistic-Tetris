# Changelog

All notable changes to Simplistic Tetris V2 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.1] - 2026-02-16

### Changed
- Updated CHANGELOG with complete version history and missing commits
- Enhanced automated release workflow with better commit categorization
- Removed obsolete code quality workflow (duplicate of CI)

## [3.0.0] - 2026-02-16

### Added
- Colorblind mode with distinctive patterns for each Tetromino type
- 3D rendering effects for Tetrominos with gradient, highlights and depth
- Accessibility toggle button in header with visual states
- GitHub workflow for automated release creation with changelog generation
- Prettier format check script

### Fixed
- Music not restarting when clicking replay button
- Music not restarting when pressing Enter after closing game over modal
- Input focus issue preventing keyboard shortcuts after game over
- Focus management in modals to prevent input interference

### Changed
- Tetromino blocks now have subtle 3D effect with gradients and highlights
- Grid lines made more subtle yet visible for better gameplay
- Enhanced visual depth with inner borders and shadows
- Improved block rendering to distinguish active pieces from board

## [2.1.1] - 2025-12-29

### Fixed
- Update Open Graph and Twitter Card descriptions for consistency
- Update live demo badge for improved visibility

### Added
- Clear scores functionality with confirmation modal
- Enhanced translations for confirmation modals

### Documentation
- Updated README and mobile features documentation

## [2.1.0] - 2025-12-28

### Added
- Input detection to prevent key interception while typing in input fields
- Enhanced high scores display with date formatting and translations
- Game mode selection and score mode toggle
- Support message in game over modal
- Enhanced stats display with improved layout

### Changed
- Improved responsiveness across all components
- Better mobile experience with adjusted paddings and margins
- Better layout adjustments for different screen sizes

### Removed
- Discussions link from README and issue templates
- Game mode selection screenshot

### Fixed
- Indentation in MusicManager.ts

### Dependencies
- Updated esbuild, @vitest/ui and vitest

## [2.0.5] - 2025-12-27

### Changed
- Implemented moderate padding, margin, and gap adjustments
- Added zoom and transform scaling for better cross-browser layout
- Improved layout consistency across different browsers

## [2.0.4] - 2025-12-27

### Changed
- Refined responsiveness for various screen sizes
- Enhanced padding, margin, and gap adjustments across components
- Better adaptation to medium and small screens

## [2.0.3] - 2025-12-27

### Changed
- Enhanced responsiveness for medium screens
- Adjusted paddings, margins, and gaps across stylesheets
- Improved mobile layout experience

## [2.0.2] - 2025-12-27

### Changed
- Standardized quotes in workflow files
- Enabled GitHub Pages deployment

## [2.0.1] - 2025-12-27

### Added
- Initial tagged release of Simplistic Tetris V2

## [2.0.0]

### Added
- Modern TypeScript rewrite with strict mode
- Two game modes: Classic and Ultra (2-minute challenge)
- Ghost piece preview
- Hold piece system
- Next piece preview
- 4 themes: Classic, Dark, Neon, Retro
- Internationalization (French and English)
- Responsive design with mobile touch controls
- Audio system with background music and sound effects
- FPS counter
- High scores with persistent leaderboard per game mode
- Unit tests with Vitest
- Clean architecture with separation of concerns
- Event-driven game engine
- Animation engine
- Theme manager

### Changed
- Complete rewrite from vanilla JavaScript to TypeScript
- Modern build system with Vite
- SCSS architecture with modules
- Professional code organization

### Technical
- TypeScript 5.x with strict mode
- Vite 6.x for build and HMR
- Vitest for testing
- ESLint + Prettier for code quality
- Conventional Commits with commitlint
