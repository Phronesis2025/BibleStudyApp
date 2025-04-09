/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
    serverActions: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/public/favicon.ico",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
