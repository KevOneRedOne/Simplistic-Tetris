# 📱 Mobile Features & Responsive Design

![Mobile](https://img.shields.io/badge/Mobile-Optimized-00C853?style=for-the-badge&logo=android&logoColor=white)
![Touch](https://img.shields.io/badge/Touch-Enabled-2196F3?style=for-the-badge&logo=gesture&logoColor=white)


> **Play Tetris anywhere, anytime.** Full mobile support with intuitive touch controls and adaptive responsive design.

[🎮 Try it on Mobile](https://simplistic-tetris-v2.netlify.app) | [📚 Back to Docs](../README.md)

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **🔒 Prevent Zoom** | Viewport configuration prevents unwanted zoom |
| **📐 Adaptive Canvas** | Dynamic canvas resizing based on screen size |
| **👆 Touch Gestures** | Swipe & tap controls with adaptive sensitivity |
| **🎨 Compact Layout** | Mobile-first responsive design (< 768px) |
| **🔊 Audio Fix** | AudioContext resume after user interaction |
| **💾 Score Fallback** | In-memory storage when localStorage is blocked |
| **📱 Touch-Friendly** | Minimum 44px buttons (iOS HIG) |

---

## 🎮 Touch Controls

### Gesture Reference

```mermaid
graph TD
    A[Touch Input] --> B{Gesture Type}
    B -->|Swipe Left| C[Move Left ⬅️]
    B -->|Swipe Right| D[Move Right ➡️]
    B -->|Swipe Down| E[Soft Drop ⬇️]
    B -->|Swipe Up| F[Rotate ⬆️]
    B -->|Single Tap| G[Rotate 👆]
    B -->|Double Tap| H[Hard Drop 👆👆]
    
    style A fill:#f4c790,stroke:#d6a86f,stroke-width:2px,color:#333
    style C fill:#8fc994,stroke:#5a9,stroke-width:2px,color:#fff
    style D fill:#8fc994,stroke:#5a9,stroke-width:2px,color:#fff
    style E fill:#7ba4db,stroke:#4a8ad6,stroke-width:2px,color:#fff
    style F fill:#d9a7c7,stroke:#c77aa4,stroke-width:2px,color:#fff
    style G fill:#d9a7c7,stroke:#c77aa4,stroke-width:2px,color:#fff
    style H fill:#f5b5b5,stroke:#c77,stroke-width:2px,color:#333
```

| Gesture | Action | Threshold |
|---------|--------|-----------|
| **Swipe Left** ⬅️ | Move piece left | 20-30px |
| **Swipe Right** ➡️ | Move piece right | 20-30px |
| **Swipe Down** ⬇️ | Soft drop (faster) | 20-30px |
| **Swipe Up** ⬆️ | Rotate clockwise | 20-30px |
| **Single Tap** 👆 | Rotate clockwise | Quick tap |
| **Double Tap** 👆👆 | Hard drop (instant) | < 400ms |

**Adaptive Sensitivity:** Small screens (< 576px) use 20px threshold, larger screens use 30px.

---

## 📱 Responsive Design

### Breakpoint System

```mermaid
graph LR
    A[375px<br/>XS] --> B[576px<br/>SM]
    B --> C[768px<br/>MD]
    C --> D[992px<br/>LG]
    D --> E[1200px<br/>XL]
    
    style A fill:#f5b5b5,stroke:#c77,stroke-width:2px,color:#333
    style B fill:#f4c790,stroke:#d6a86f,stroke-width:2px,color:#333
    style C fill:#8fc994,stroke:#5a9,stroke-width:2px,color:#fff
    style D fill:#7ba4db,stroke:#4a8ad6,stroke-width:2px,color:#fff
    style E fill:#c9a0dc,stroke:#a67bc8,stroke-width:2px,color:#fff
```

**Layout Behavior:**
- **< 576px**: Stacked layout, compact UI, canvas max 90vw
- **576px - 768px**: Two-column side panels, canvas max 400px
- **768px - 992px**: Two-column (stats | board+controls)
- **992px+**: Three-column (stats | board | controls)

### Canvas Auto-Resize

Canvas automatically resizes based on container size while maintaining 10:20 aspect ratio:

```typescript
public autoResize(): void {
  const container = this.canvas.parentElement;
  const maxWidthBasedSize = Math.floor(container.clientWidth / BOARD_COLS);
  const maxHeightBasedSize = Math.floor(container.clientHeight / BOARD_ROWS);
  const optimalCellSize = Math.min(maxWidthBasedSize, maxHeightBasedSize, CELL_SIZE);
  
  if (Math.abs(this.cellSize - optimalCellSize) > 1) {
    this.resize(optimalCellSize);
  }
}
```

**Resize handler:** Debounced 250ms to prevent excessive redraws.

---

## 🔊 Mobile Audio

Mobile browsers block autoplay audio until user interaction.

**Solution:** Resume AudioContext after first user interaction (game start):

```typescript
public async resumeAudioContext(): Promise<void> {
  if (this.audioContext?.state === 'suspended') {
    await this.audioContext.resume();
  }
}
```

Mobile users see a "🔊 Audio activé" notification when audio starts.

---

## 💾 High Scores on Mobile

Some browsers block localStorage in private mode. **Fallback strategy:**

```mermaid
graph TD
    A[Save Score] --> B{localStorage?}
    B -->|Yes| C[Save to localStorage ✅]
    B -->|No| D[Save to Memory ⚠️]
    D --> E[Session only]
    
    style A fill:#f4c790,stroke:#d6a86f,stroke-width:2px,color:#333
    style C fill:#8fc994,stroke:#5a9,stroke-width:2px,color:#fff
    style D fill:#f5b5b5,stroke:#c77,stroke-width:2px,color:#333
```

Scores saved to memory are lost on page reload but game remains fully playable.
 
---

## 🐛 Known Issues

| Issue | Status | Solution |
|-------|--------|----------|
| Audio doesn't start on iOS | ✅ Fixed | AudioContext.resume() after interaction |
| Scores not saving in Private Mode | ✅ Fixed | In-memory fallback |
| Lag on older devices | 🟡 Mitigated | Reduced animations |

---

## 💡 Tips for Mobile Players

- 📱 **Portrait mode** for phones, **landscape** for tablets
- 👆 Use **single taps** for quick rotations
- ➡️ Use **swipes** for precise movement
- 👆👆 **Double tap** for instant drop
- 🔊 **Headphones** for best audio experience

---

## 📞 Reporting Issues

Include: Device model, OS version, Browser, Description, Steps to reproduce.

🐛 [GitHub Issues](https://github.com/KevOneRedOne/Simplistic-Tetris/issues)

