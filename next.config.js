/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'event-api-vzfj.onrender.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 