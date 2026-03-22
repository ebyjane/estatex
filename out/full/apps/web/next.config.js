/**
 * RSC payload errors ("development React on server, production on client") happen if
 * NODE_ENV is production while running `next dev`, or if the browser caches old prod chunks.
 * Turbo / Windows shells sometimes leak NODE_ENV — force development for dev invocations.
 */
(() => {
  const fromNpm = process.env.npm_lifecycle_event === 'dev';
  /** `next dev -p 3002` → argv[2] is `dev`; some runners pass extra args — use includes. */
  const fromArgv = process.argv.includes('dev');
  if (fromNpm || fromArgv) {
    process.env.NODE_ENV = 'development';
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@real-estate/shared'],
  /**
   * After `next build` then `next dev`, browsers often cache old `/_next/static/*` URLs → 404 on
   * webpack.js / layout.css / main-app.js. Disable caching for dev chunks only.
   */
  async headers() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/properties/:id',
        destination: '/property/:id',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: '*.unsplash.com', pathname: '/**' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  },
};
module.exports = nextConfig;
