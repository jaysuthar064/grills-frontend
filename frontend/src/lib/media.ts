export const PUBLIC_WP_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://grills.launchpreview.live';

/**
 * Normalizes an image or media URL so that local development URLs
 * (e.g., http://localhost:8885) resolve against the public
 * WordPress host ONLY in production environments or when NEXT_PUBLIC_WORDPRESS_URL is configured.
 * In local development, local WordPress URLs (http://localhost:8885) are preserved so newly uploaded
 * images load properly from the local WordPress server.
 */
export function normalizeMediaUrl(url: string): string {
  if (!url) return '';

  // In local development, keep localhost:8885 so newly uploaded images are fetched directly
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd && !process.env.NEXT_PUBLIC_WORDPRESS_URL) {
    return url;
  }

  if (url.startsWith('http://localhost:8885')) {
    return url.replace('http://localhost:8885', PUBLIC_WP_URL);
  }
  if (url.startsWith('http://127.0.0.1:8885')) {
    return url.replace('http://127.0.0.1:8885', PUBLIC_WP_URL);
  }
  return url;
}

/**
 * Helper to build an absolute URL to a media upload.
 */
export function getWpUploadUrl(filename: string): string {
  const base =
    process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_WORDPRESS_URL
      ? PUBLIC_WP_URL
      : process.env.WP_API_BASE_URL || 'http://localhost:8885';
  return `${base}/wp-content/uploads/2026/09/${filename}`;
}
