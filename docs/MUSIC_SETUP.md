# 🎵 Music Setup Guide

## How to Add Custom Tetris Music

### 1. Download Royalty-Free Music

Recommended sources:
- **Pixabay**: https://pixabay.com/music/search/korobeiniki/
- **SoundCloud**: https://soundcloud.com/musiqueslibresdedroit/musique-8-bits
- **Freesound**: https://freesound.org/search/?q=tetris (check CC0 license)

### 2. Place the MP3 File

```bash
# Copy your MP3 file to the public/ folder
cp ~/Downloads/tetris-theme.mp3 public/tetris-theme.mp3
```

### 3. Update the Code to Use MP3

In `src/main.ts`, around line ~47, change:

```typescript
// BEFORE (synthesized music)
this.musicManager = new MusicManager();

// AFTER (use your MP3)
this.musicManager = new MusicManager('/tetris-theme.mp3');
```

### 4. That's it! 🎉

The MP3 music will automatically loop.

## Available Options

### Use Synthesized Music (current)
```typescript
this.musicManager = new MusicManager();
```
- ✅ No external file needed
- ✅ Guaranteed royalty-free
- ⚠️ Basic retro/8-bit sound

### Use MP3 File
```typescript
this.musicManager = new MusicManager('/tetris-theme.mp3');
```
- ✅ Superior audio quality
- ✅ Professional music
- ⚠️ Check license requirements

## Volume Adjustment

In the game, the 🎵 button controls playback.

To change volume in code:
```typescript
musicManager.setVolume(0.5); // 50%
musicManager.setVolume(0.3); // 30% (default)
musicManager.setVolume(1.0); // 100%
```

## Supported Formats

- **MP3**: Recommended (best compatibility)
- **OGG**: Alternative (smaller file size)
- **WAV**: Not recommended (large files)

## Troubleshooting

### Music doesn't play
- Check browser console for errors
- Verify file path is correct (`/tetris-theme.mp3`)
- Ensure file is in `public/` folder
- Check browser autoplay policies (user interaction may be required)

### Music is too loud/quiet
- Use `setVolume()` method (see above)
- Default volume is 30% (0.3)

### Music doesn't loop
- The `MusicManager` handles looping automatically
- If using custom implementation, set `audio.loop = true`

