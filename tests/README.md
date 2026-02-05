# Tests

## 🚀 Quick Start

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Generate coverage
npm run test:coverage

# View coverage
open coverage/index.html
```

---

## 📊 Coverage

| Module | Coverage | Tests |
|--------|----------|-------|
| GameEngine | 77% | 36 |
| UIManager | 96% | 43 |
| AnimationEngine | 96% | 25 |
| InputHandler | 74% | 22 |
| Board | 66% | 13 |
| Tetromino | 83% | 15 |
| ScoringSystem | 39% | 16 |

**Total: 170 tests**

---

## 📁 Structure

```
tests/
├── core/
│   ├── Board.test.ts
│   ├── GameEngine.test.ts
│   ├── ScoringSystem.test.ts
│   └── Tetromino.test.ts
├── input/
│   └── InputHandler.test.ts
├── rendering/
│   └── AnimationEngine.test.ts
└── ui/
    └── UIManager.test.ts
```

---

## ✍️ Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Component', () => {
  let component: Component;

  beforeEach(() => {
    component = new Component();
  });

  it('should do something', () => {
    const result = component.doSomething();
    expect(result).toBe(expected);
  });
});
```

---

## 🔧 Configuration

- **Framework:** Vitest 4.0.18
- **Environment:** jsdom
- **Coverage:** v8

See `vite.config.ts` for full config.

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
