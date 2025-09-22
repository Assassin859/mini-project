/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Remove output: 'export' for proper deployment
  // output: 'export',
};

module.exports = nextConfig;