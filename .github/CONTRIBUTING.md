# Contributing to Simplistic Tetris V2

Thank you for your interest in contributing! 🎮

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Simplistic-Tetris.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit: `git commit -m "feat(scope): add your feature description"`
6. Push: `git push origin feature/your-feature-name`
7. Open a Pull Request

## 📝 Code Style

- Follow TypeScript strict mode guidelines
- Use ESLint and Prettier (run `pnpm lint` and `pnpm format`)
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Add tests for new features

## 📋 Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with commitlint. Your commit messages must follow this format:

```
<type>(<scope>): <subject>
```

### Rules

- Type and scope must be **lowercase**
- Scope is **recommended** but not required
- Header cannot exceed **250 characters**
- Use imperative mood ("add" not "added" or "adds")
- Don't end the subject with a period

## 🧪 Testing

Before submitting a PR, make sure:
- All tests pass: `pnpm test`
- No linting errors: `pnpm lint`
- Code is formatted: `pnpm format`
- Build succeeds: `pnpm build`

## 🎯 Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🌍 Additional translations
- ⚡ Performance optimizations
- 🧪 Test coverage improvements

## 📋 Pull Request Process

1. Update the README.md if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Follow the [PR template](.github/pull_request_template.md)
5. Link to related issues if applicable

## 🔍 Code Structure

- **`src/core/`** - Game logic and engine
- **`src/rendering/`** - Canvas rendering and animations
- **`src/ui/`** - User interface components
- **`src/input/`** - Input handling
- **`src/i18n/`** - Internationalization
- **`src/styles/`** - SCSS stylesheets
- **`tests/`** - Unit tests

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 💬 Questions or Need Help?

If you have a question, need clarification, or want to discuss your contribution:

- Check if your question is answered in the [README](../README.md) or project documentation
- Search [existing issues](https://github.com/KevOneRedOne/Simplistic-Tetris/issues) to see if it's already addressed
- If not, [open a new issue](https://github.com/KevOneRedOne/Simplistic-Tetris/issues/new) with clear details—screenshots or code snippets welcome!

We're happy to help and appreciate your engagement!

Thank you for contributing! 🙏

