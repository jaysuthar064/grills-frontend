import type { NextConfig } from 'next';

/**
 * Derives an image remotePattern for the WordPress uploads directory from
 * WP_API_BASE_URL, so `next/image` may optimise media served by the CMS.
 * `01-TECH-STACK.md` §6: delivery is `<Image>` with `remotePatterns` allowing
 * the WordPress host, formats AVIF → WebP → original.
 */
function wordpressRemotePatterns(): NonNullable<
  NonNullable<NextConfig['images']>['remotePatterns']
> {
  const base = process.env.WP_API_BASE_URL;

  if (!base) {
    return [];
  }

  let url: URL;

  try {
    url = new URL(base);
  } catch {
    return [];
  }

  const protocol = url.protocol === 'https:' ? 'https' : 'http';

  return [
    {
      protocol,
      hostname: url.hostname,
      pathname: '/wp-content/uploads/**',
      ...(url.port ? { port: url.port } : {}),
    },
  ];
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowLocalIP: true,
    qualities: [75, 90],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: wordpressRemotePatterns(),
  },
} satisfies NextConfig;

export default nextConfig;
