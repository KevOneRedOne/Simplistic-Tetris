# Music Setup

## Quick Start

### Using Synthesized Music (Default)

```typescript
this.musicManager = new MusicManager();
```

No external files required. Guaranteed royalty-free.

### Using Custom MP3 File

1. **Place file in `public/music/`**
   ```bash
   cp your-music.mp3 public/music/tetris-theme.mp3
   ```

2. **Configure in `src/main.ts`**
   ```typescript
   const musicCredits: MusicCredits = {
     source: 'Pixabay',
     author: 'Artist Name',
     license: 'Pixabay License',
     licenseUrl: 'https://pixabay.com/service/license-summary/',
     trackUrl: 'https://pixabay.com/music/...',
   };

   this.musicManager = new MusicManager('/music/tetris-theme.mp3', musicCredits);
   ```

Credits are automatically displayed in the footer.

## Configuration

### Volume Control

```typescript
musicManager.setVolume(0.3); // 30% (default)
musicManager.setVolume(0.5); // 50%
musicManager.setVolume(1.0); // 100%
```

### Supported Formats

- **MP3** (recommended)
- **OGG** (alternative)
- **WAV** (not recommended - large files)

## Legal Requirements

When using external music:

- ✅ Include credits in `MusicCredits` object
- ✅ Verify license allows your use case
- ✅ Check attribution requirements
- ✅ Respect license restrictions

**Note:** The "Korobeiniki" melody is public domain, but specific arrangements may be copyrighted. Always verify the license for each arrangement.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Music doesn't play | Check file path, verify file is in `public/` folder, check browser console |
| Volume too loud/quiet | Use `setVolume()` method |
| Music doesn't loop | Handled automatically by `MusicManager` |
