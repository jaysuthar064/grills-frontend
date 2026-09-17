export const PUBLIC_WP_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://grills.launchpreview.live';

/**
 * Normalizes an image or media URL so that local development URLs
 * (e.g., http://localhost:8885) automatically resolve against the public
 * WordPress host in production or when accessed remotely.
 */
export function normalizeMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://localhost:8885')) {
    return url.replace('http://localhost:8885', PUBLIC_WP_URL);
  }
  if (url.startsWith('http://127.0.0.1:8885')) {
    return url.replace('http://127.0.0.1:8885', PUBLIC_WP_URL);
  }
  return url;
}

/**
 * Helper to build an absolute URL to a 2026/09 media upload.
 */
export function getWpUploadUrl(filename: string): string {
  return `${PUBLIC_WP_URL}/wp-content/uploads/2026/09/${filename}`;
}
