export const DEFAULT_SITE_URL = 'https://bettergattaran.org';

export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME || 'Better Gattaran',
  description:
    import.meta.env.VITE_SITE_DESCRIPTION ||
    'A community-driven civic information portal for Gattaran, Cagayan.',
  governmentName:
    import.meta.env.VITE_GOVERNMENT_NAME || 'Municipality of Gattaran',
  /** Origin without a trailing slash. */
  url: (import.meta.env.VITE_WEBSITE_URL || DEFAULT_SITE_URL).replace(
    /\/+$/,
    ''
  ),
  /** Default social-preview image path, resolved against `url`. */
  defaultImagePath: '/bettergattaran.png',
};

export function absoluteUrl(path: string, base = siteConfig.url): string {
  return new URL(path, `${base}/`).toString();
}
