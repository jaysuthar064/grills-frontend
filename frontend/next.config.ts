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
  const patterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
    {
      protocol: 'https',
      hostname: 'grills.launchpreview.live',
      pathname: '/wp-content/uploads/**',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8885',
      pathname: '/wp-content/uploads/**',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8885',
      pathname: '/wp-content/uploads/**',
    },
  ];

  const envBases = [process.env.WP_API_BASE_URL, process.env.NEXT_PUBLIC_WORDPRESS_URL].filter(
    (b): b is string => Boolean(b)
  );

  for (const base of envBases) {
    try {
      const url = new URL(base);
      const protocol = url.protocol === 'https:' ? 'https' : 'http';
      patterns.push({
        protocol,
        hostname: url.hostname,
        pathname: '/wp-content/uploads/**',
        ...(url.port ? { port: url.port } : {}),
      });
    } catch {
      // Ignore invalid URL in env
    }
  }

  return patterns;
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
