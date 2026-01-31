

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ["learn.local.inviertekasa.shop:3001", "learn.local.inviertekasa.shop"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.kasa.com",
      },
      {
        protocol: "https",
        hostname: "ncghpvggrjvfufhlprlw.supabase.co",
      },
      {
        protocol: "https",
        hostname: "tfstrmqthvxrdhepjfoi.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.decateca.com',
      },
      {
        protocol: 'https',
        hostname: '**.decateca.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;