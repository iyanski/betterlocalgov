import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Local Government Website',
}: SEOProps) {
  const defaultTitle = `${siteName} - Official Government Website`;
  const defaultDescription =
    import.meta.env.VITE_SITE_DESCRIPTION ||
    `Official website of ${siteName}. Access government services, information, and resources.`;
  const defaultKeywords =
    import.meta.env.VITE_SITE_KEYWORDS ||
    'government, local government, services, public services, civic services';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const fullUrl = url || import.meta.env.VITE_WEBSITE_URL || '';
  const fullImage =
    image || import.meta.env.VITE_OG_IMAGE_URL || `${fullUrl}/og-image.jpg`;
  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || '';

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (
      selector: string,
      content: string,
      attribute: string = 'content'
    ) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('name=')) {
          element.setAttribute(
            'name',
            selector.match(/name="([^"]+)"/)?.[1] || ''
          );
        } else if (selector.includes('property=')) {
          element.setAttribute(
            'property',
            selector.match(/property="([^"]+)"/)?.[1] || ''
          );
        } else if (selector.includes('http-equiv=')) {
          element.setAttribute(
            'http-equiv',
            selector.match(/http-equiv="([^"]+)"/)?.[1] || ''
          );
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Helper function to update or create link tags
    const updateLinkTag = (selector: string, href: string, rel: string) => {
      let element = document.querySelector(selector) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic Meta Tags
    updateMetaTag('meta[name="description"]', fullDescription);
    updateMetaTag('meta[name="keywords"]', fullKeywords);
    updateMetaTag('meta[name="author"]', siteName);
    updateMetaTag('meta[name="robots"]', 'index, follow');
    updateMetaTag('meta[name="language"]', 'English');
    updateMetaTag('meta[name="revisit-after"]', '7 days');

    // Open Graph / Facebook
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:url"]', fullUrl);
    updateMetaTag('meta[property="og:title"]', fullTitle);
    updateMetaTag('meta[property="og:description"]', fullDescription);
    updateMetaTag('meta[property="og:image"]', fullImage);
    updateMetaTag('meta[property="og:site_name"]', siteName);
    updateMetaTag('meta[property="og:locale"]', 'en_US');

    // Twitter
    updateMetaTag('meta[property="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[property="twitter:url"]', fullUrl);
    updateMetaTag('meta[property="twitter:title"]', fullTitle);
    updateMetaTag('meta[property="twitter:description"]', fullDescription);
    updateMetaTag('meta[property="twitter:image"]', fullImage);

    if (twitterHandle) {
      updateMetaTag('meta[property="twitter:site"]', twitterHandle);
    }

    // Additional Meta Tags
    updateMetaTag(
      'meta[name="viewport"]',
      'width=device-width, initial-scale=1.0'
    );
    updateMetaTag(
      'meta[http-equiv="Content-Type"]',
      'text/html; charset=utf-8'
    );
    updateMetaTag('meta[name="theme-color"]', '#0066eb');

    // Canonical URL
    updateLinkTag('link[rel="canonical"]', fullUrl, 'canonical');

    // Favicon
    updateLinkTag(
      'link[rel="icon"][type="image/x-icon"]',
      '/favicon.ico',
      'icon'
    );
    updateLinkTag(
      'link[rel="apple-touch-icon"][sizes="180x180"]',
      '/apple-touch-icon.png',
      'apple-touch-icon'
    );
    updateLinkTag(
      'link[rel="icon"][type="image/png"][sizes="32x32"]',
      '/favicon-32x32.png',
      'icon'
    );
    updateLinkTag(
      'link[rel="icon"][type="image/png"][sizes="16x16"]',
      '/favicon-16x16.png',
      'icon'
    );

    // Preconnect to external domains
    updateLinkTag(
      'link[rel="preconnect"][href="https://fonts.googleapis.com"]',
      'https://fonts.googleapis.com',
      'preconnect'
    );
    updateLinkTag(
      'link[rel="preconnect"][href="https://fonts.gstatic.com"]',
      'https://fonts.gstatic.com',
      'preconnect'
    );
  }, [
    fullTitle,
    fullDescription,
    fullKeywords,
    fullUrl,
    fullImage,
    twitterHandle,
    type,
    siteName,
  ]);

  // This component doesn't render anything visible
  return null;
}
