export const PUBLIC_WP_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://grills.launchpreview.live';

/**
 * Normalizes an image or media URL.
 * Automatically maps any WordPress uploads (e.g. from local Laragon or CMS payloads)
 * directly to the fast, bundled local /media/uploads/ static directory so all
 * images and videos load seamlessly both on the live site and in local development,
 * without depending on an active local Laragon server or external WordPress host.
 */
export function normalizeMediaUrl(url: string): string {
  if (!url) return '';

  // If already a local media path, return as-is
  if (url.startsWith('/media/')) {
    return url;
  }

  // If URL references WordPress uploads, map to bundled static uploads
  if (url.includes('/wp-content/uploads/2026/09/')) {
    const filename = url.split('/wp-content/uploads/2026/09/')[1];
    if (filename) {
      return `/media/uploads/${filename}`;
    }
  }

  // If an external valid custom WordPress host is explicitly set (other than default placeholder)
  if (
    process.env.NEXT_PUBLIC_WORDPRESS_URL &&
    process.env.NEXT_PUBLIC_WORDPRESS_URL !== 'https://grills.launchpreview.live'
  ) {
    if (url.startsWith('http://localhost:8885')) {
      return url.replace('http://localhost:8885', process.env.NEXT_PUBLIC_WORDPRESS_URL);
    }
    if (url.startsWith('http://127.0.0.1:8885')) {
      return url.replace('http://127.0.0.1:8885', process.env.NEXT_PUBLIC_WORDPRESS_URL);
    }
  }

  return url;
}

/**
 * Helper to build a reliable URL to a media upload.
 * Resolves to the static bundled asset in /media/uploads/ for guaranteed availability
 * across all environments.
 */
export function getWpUploadUrl(filename: string): string {
  return `/media/uploads/${filename}`;
}

