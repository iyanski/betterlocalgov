/** Languages visitors can select. */
export type LanguageType = 'en';

/** Scaffolded languages that stay disabled until a human speaker approves them. */
export type PlannedLanguageType = 'fil' | 'ilo' | 'ibg';

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}
