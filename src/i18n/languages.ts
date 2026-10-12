import type { LanguageType, PlannedLanguageType } from '../types';

export interface LanguageInfo {
  code: LanguageType;
  name: string;
  nativeName: string;
}

/** Languages a visitor can select. Only reviewed locale resources belong here. */
export const LANGUAGES: Record<LanguageType, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
};

export const DEFAULT_LANGUAGE: LanguageType = 'en';

export type LocaleReviewStatus = 'needs_review' | 'placeholder';

export interface PlannedLanguage {
  code: PlannedLanguageType;
  name: string;
  nativeName: string;
  /** Always false until a human speaker approves the strings. */
  enabled: false;
  reviewStatus: LocaleReviewStatus;
  /** Where the locale resources live, if any exist. */
  resource?: string;
}

/**
 * Languages that are scaffolded but disabled. They are not selectable, not
 * listed in the switcher, and not accepted by i18next (`supportedLngs`).
 * To enable one: have a fluent human speaker write and approve the strings,
 * move its entry into `LANGUAGES`, and update the tests.
 */
export const PLANNED_LANGUAGES: Record<PlannedLanguageType, PlannedLanguage> = {
  fil: {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    enabled: false,
    reviewStatus: 'needs_review',
    resource: 'src/i18n/locales/fil.json (unused starter-kit strings)',
  },
  ilo: {
    code: 'ilo',
    name: 'Ilocano',
    nativeName: 'Ilokano',
    enabled: false,
    reviewStatus: 'needs_review',
    resource: 'public/locales/ilo/common.json (empty scaffold)',
  },
  ibg: {
    code: 'ibg',
    name: 'Ibanag',
    nativeName: 'Ibanag',
    enabled: false,
    reviewStatus: 'placeholder',
    resource: 'public/locales/ibg/common.json (placeholder)',
  },
};
