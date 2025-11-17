/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [],
    // Allow local images from /uploads directory
    domains: [],
  },
  // Ensure static files are served correctly
  output: 'standalone',
}

module.exports = nextConfig

