# 🎵 Music Setup Guide

## How to Add Custom Tetris Music

### 1. Download Royalty-Free Music

Recommended sources:
- **Pixabay**: https://pixabay.com/music/search/korobeiniki/
- **SoundCloud**: https://soundcloud.com/musiqueslibresdedroit/musique-8-bits
- **Freesound**: https://freesound.org/search/?q=tetris (check CC0 license)

#### ⚠️ Important Legal Considerations

**Pixabay License:**
- ✅ Free for personal and commercial use
- ✅ Modification and adaptation allowed
- ✅ No attribution required (but appreciated)
- ❌ Cannot sell/redistribute content as-is without significant modification

**Special Note for "Korobeiniki" Arrangements:**
The melody "Korobeiniki" (Tetris Theme) is a traditional Russian folk song (public domain), but **specific arrangements may be copyrighted**. For example:
- The arrangement by Gregor Quendel on Pixabay may require a commercial license for commercial projects
- Check the specific license terms for each arrangement
- For commercial use, consider acquiring a commercial license from the arranger

### 2. Place the MP3 File

```bash
# Copy your MP3 file to the public/ folder
cp ~/Downloads/tetris-theme.mp3 public/tetris-theme.mp3
```

### 3. Update the Code to Use MP3 with Credits

In `src/main.ts`, around line ~73, replace the music manager initialization:

```typescript
// BEFORE (synthesized music)
this.musicManager = new MusicManager();

// AFTER (use your MP3 with proper credits)
import { MusicManager, MusicCredits } from '@ui/MusicManager';

// Define music credits (REQUIRED for legal compliance)
const musicCredits: MusicCredits = {
  source: 'Pixabay',
  author: 'Gregor Quendel', // Optional: artist name if available
  license: 'Pixabay License',
  licenseUrl: 'https://pixabay.com/service/license-summary/',
  trackUrl: 'https://pixabay.com/music/lullabies-tetris-theme-korobeiniki-rearranged-arr-for-music-box-184978/', // Optional: link to original track
};

// Initialize with MP3 and credits
this.musicManager = new MusicManager('/tetris-theme.mp3', musicCredits);
```

### 4. Credits Display

The credits will **automatically appear in the footer** when using an MP3 file with credits. This ensures legal compliance and proper attribution.

**Example footer display:**
```
Music: Music by Gregor Quendel (Pixabay) - Pixabay License - Source
```

### 5. That's it! 🎉

The MP3 music will automatically loop and credits will be displayed in the footer.

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
const musicCredits: MusicCredits = {
  source: 'Pixabay',
  author: 'Gregor Quendel',
  license: 'Pixabay License',
  licenseUrl: 'https://pixabay.com/service/license-summary/',
  trackUrl: 'https://pixabay.com/music/...',
};
this.musicManager = new MusicManager('/tetris-theme.mp3', musicCredits);
```
- ✅ Superior audio quality
- ✅ Professional music
- ✅ Automatic credits display in footer
- ⚠️ Check license requirements
- ⚠️ **Always include credits for legal compliance**

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

## Legal Compliance Checklist

When using external music files, ensure you:

- ✅ **Include credits** in the `MusicCredits` object
- ✅ **Verify license** allows your use case (personal/commercial)
- ✅ **Check attribution requirements** (some licenses require attribution)
- ✅ **Display credits** in footer (automatic when using `MusicCredits`)
- ✅ **Respect license restrictions** (e.g., no redistribution as-is)

### Example: Pixabay Music Setup

```typescript
// 1. Download MP3 from Pixabay
// 2. Place in public/ folder
// 3. Configure credits:

const musicCredits: MusicCredits = {
  source: 'Pixabay',
  author: 'Artist Name', // From Pixabay track page
  license: 'Pixabay License',
  licenseUrl: 'https://pixabay.com/service/license-summary/',
  trackUrl: 'https://pixabay.com/music/...', // Link to original track
};

this.musicManager = new MusicManager('/your-music.mp3', musicCredits);
```

Credits will automatically appear in the footer, ensuring legal compliance! ✅

