/**
 * Theme Manager for Tetris V2
 * Handles theme switching and color schemes
 */

import type { Theme } from '@/types/index';
import { THEME_NAMES, DEFAULT_THEME } from '@constants/config';

const THEMES: Record<string, Theme> = {
  [THEME_NAMES.CLASSIC]: {
    name: 'Classic',
    colors: {
      background: '#f0f0f0',
      boardBackground: '#ffffff',
      gridLines: '#d0d0d0',
      text: '#333333',
      primary: '#4CAF50',
      secondary: '#2196F3',
      accent: '#FF5722',
    },
  },
  [THEME_NAMES.DARK]: {
    name: 'Dark',
    colors: {
      background: '#1a1a1a',
      boardBackground: '#2a2a2a',
      gridLines: '#404040',
      text: '#ffffff',
      primary: '#00e676',
      secondary: '#00b0ff',
      accent: '#ff3d00',
    },
  },
  [THEME_NAMES.NEON]: {
    name: 'Neon',
    colors: {
      background: '#0a0015',
      boardBackground: '#1a0030',
      gridLines: '#4a0080',
      text: '#ff00ff',
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
    },
  },
  [THEME_NAMES.RETRO]: {
    name: 'Retro',
    colors: {
      background: '#2d2b55',
      boardBackground: '#46425a',
      gridLines: '#5f5981',
      text: '#f0f0f0',
      primary: '#e43b44',
      secondary: '#63c74d',
      accent: '#feae34',
    },
  },
};

export class ThemeManager {
  private currentTheme: Theme;

  constructor(themeName?: string) {
    this.currentTheme = THEMES[themeName || DEFAULT_THEME] || THEMES[DEFAULT_THEME]!;
    this.applyTheme();
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): Theme {
    return { ...this.currentTheme };
  }

  /**
   * Set theme by name
   */
  public setTheme(themeName: string): void {
    const theme = THEMES[themeName];
    if (theme) {
      this.currentTheme = theme;
      this.applyTheme();
    }
  }

  /**
   * Apply theme to CSS variables
   */
  private applyTheme(): void {
    const root = document.documentElement;

    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Store theme in localStorage
    try {
      localStorage.setItem('tetris_v2_theme', this.currentTheme.name);
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Get available themes
   */
  public getAvailableThemes(): string[] {
    return Object.keys(THEMES);
  }

  /**
   * Get theme display names
   */
  public getThemeNames(): Array<{ value: string; label: string }> {
    return Object.entries(THEMES).map(([key, theme]) => ({
      value: key,
      label: theme.name,
    }));
  }

  /**
   * Load theme from localStorage
   */
  public loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('tetris_v2_theme');
      if (savedTheme && THEMES[savedTheme]) {
        this.setTheme(savedTheme);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Get color value
   */
  public getColor(colorKey: string): string {
    return this.currentTheme.colors[colorKey] || '#000000';
  }
}

