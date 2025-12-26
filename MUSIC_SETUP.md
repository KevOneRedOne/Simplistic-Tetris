# 🎵 Configuration de la Musique MP3

## Étapes pour ajouter une musique Tetris

### 1. Télécharger une musique libre de droits

Sites recommandés :
- **Pixabay** : https://pixabay.com/fr/music/search/korobeiniki/
- **SoundCloud** : https://soundcloud.com/musiqueslibresdedroit/musique-8-bits
- **Freesound** : https://freesound.org/search/?q=tetris (vérifier licence CC0)

### 2. Placer le fichier MP3

```bash
# Copiez votre fichier MP3 dans le dossier public/
cp ~/Downloads/tetris-theme.mp3 public/tetris-theme.mp3
```

### 3. Modifier le code pour utiliser le MP3

Dans `src/main.ts`, ligne ~30, changez :

```typescript
// AVANT (musique synthétisée)
this.musicManager = new MusicManager();

// APRÈS (utiliser votre MP3)
this.musicManager = new MusicManager('/tetris-theme.mp3');
```

### 4. C'est tout ! 🎉

La musique MP3 sera lue en boucle automatiquement.

## Options disponibles

### Utiliser la musique synthétisée (actuel)
```typescript
this.musicManager = new MusicManager();
```
- ✅ Pas de fichier externe
- ✅ Libre de droits garanti
- ⚠️ Son rétro/8-bit basique

### Utiliser un fichier MP3
```typescript
this.musicManager = new MusicManager('/tetris-theme.mp3');
```
- ✅ Qualité audio supérieure
- ✅ Musique professionnelle
- ⚠️ Vérifier la licence

## Ajustement du volume

Dans le jeu, le bouton 🎵 contrôle la lecture.

Pour changer le volume dans le code :
```typescript
musicManager.setVolume(0.5); // 50%
musicManager.setVolume(0.3); // 30% (défaut)
musicManager.setVolume(1.0); // 100%
```

