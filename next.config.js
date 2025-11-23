/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [],
    // Allow local images from /uploads directory
    domains: [],
  },
}

module.exports = nextConfig

