/**
 * Internationalization system for Tetris V2
 * Lightweight custom solution
 */

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEYS } from '@constants/config';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}
type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number];

export class I18n {
  private locale: SupportedLocale;
  private translations: Map<SupportedLocale, TranslationObject>;
  private fallbackLocale: SupportedLocale = DEFAULT_LANGUAGE;

  constructor() {
    this.locale = this.detectLocale();
    this.translations = new Map();
  }

  /**
   * Detect user's preferred locale
   */
  private detectLocale(): SupportedLocale {
    // Try to load from localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (stored && this.isSupportedLocale(stored)) {
        return stored as SupportedLocale;
      }
    } catch (e) {
      // Ignore storage errors
    }

    // Try to detect from browser
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && this.isSupportedLocale(browserLang)) {
      return browserLang as SupportedLocale;
    }

    return this.fallbackLocale;
  }

  /**
   * Check if locale is supported
   */
  private isSupportedLocale(locale: string): boolean {
    return SUPPORTED_LANGUAGES.includes(locale as SupportedLocale);
  }

  /**
   * Load translations for a locale
   */
  public async loadTranslations(locale: SupportedLocale): Promise<void> {
    if (this.translations.has(locale)) {
      return;
    }

    try {
      const module = await import(`./locales/${locale}.ts`);
      this.translations.set(locale, module.default as TranslationObject);
    } catch (e) {
      console.error(`Failed to load translations for ${locale}:`, e);
    }
  }

  /**
   * Get translation by key
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    const translations = this.translations.get(this.locale);

    if (!translations) {
      return key;
    }

    let value: string | TranslationObject | undefined = translations;

    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // If not found, try fallback locale
    if (value === undefined && this.locale !== this.fallbackLocale) {
      const fallbackTranslations = this.translations.get(this.fallbackLocale);
      if (fallbackTranslations) {
        value = fallbackTranslations;
        for (const k of keys) {
          if (typeof value === 'object' && value !== null) {
            value = value[k];
          } else {
            value = undefined;
            break;
          }
        }
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = (value as string).replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return value;
  }

  /**
   * Set current locale
   */
  public async setLocale(locale: SupportedLocale): Promise<void> {
    if (!this.isSupportedLocale(locale)) {
      console.warn(`Locale ${locale} is not supported`);
      return;
    }

    await this.loadTranslations(locale);
    this.locale = locale;

    // Update HTML lang attribute
    document.documentElement.lang = locale;

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, locale);
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Get current locale
   */
  public getLocale(): SupportedLocale {
    return this.locale;
  }

  /**
   * Get available locales
   */
  public getAvailableLocales(): SupportedLocale[] {
    return [...SUPPORTED_LANGUAGES];
  }

  /**
   * Initialize i18n system
   */
  public async init(): Promise<void> {
    // Load default locale translations
    await this.loadTranslations(this.locale);

    // Load fallback locale if different
    if (this.locale !== this.fallbackLocale) {
      await this.loadTranslations(this.fallbackLocale);
    }

    // Update HTML lang attribute
    document.documentElement.lang = this.locale;
  }
}

// Export singleton instance
export const i18n = new I18n();

