import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

function resolvePageUrl(explicitUrl?: string): string {
  if (explicitUrl) return explicitUrl;

  const configuredBaseUrl = import.meta.env.VITE_WEBSITE_URL;
  if (!configuredBaseUrl) return '';

  try {
    return new URL(
      `${window.location.pathname}${window.location.search}`,
      configuredBaseUrl
    ).toString();
  } catch {
    return '';
  }
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = import.meta.env.VITE_SITE_NAME || 'Better Gattaran',
}: SEOProps) {
  const defaultTitle = `${siteName} - Community Civic Information Portal`;
  const defaultDescription =
    import.meta.env.VITE_SITE_DESCRIPTION ||
    'A community-driven civic information portal for Gattaran, Cagayan.';
  const defaultKeywords =
    import.meta.env.VITE_SITE_KEYWORDS ||
    'government, local government, services, public services, civic services';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const fullUrl = resolvePageUrl(url);
  const fullImage = image || import.meta.env.VITE_OG_IMAGE_URL || '';
  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || '';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      {fullImage && <meta property="og:image" content={fullImage} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {fullUrl && <meta property="twitter:url" content={fullUrl} />}
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      {fullImage && <meta property="twitter:image" content={fullImage} />}
      {twitterHandle && (
        <meta property="twitter:site" content={twitterHandle} />
      )}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#0066eb" />

      {/* Canonical URL */}
      {fullUrl && <link rel="canonical" href={fullUrl} />}

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
    </Helmet>
  );
}
