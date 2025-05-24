/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  typescript: {
    // WARNING: this will let **any** TS error through in production builds!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;