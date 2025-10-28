/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost', 
      'i.ytimg.com', 
      'img.youtube.com',
      // Add your OVH backend domain here
      // Example: 'your-backend-domain.ovh'
    ],
  },
  // Output standalone for easier deployment
  output: 'standalone',
}

module.exports = nextConfig
