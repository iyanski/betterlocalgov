export type LanguageType = 'en';

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}
