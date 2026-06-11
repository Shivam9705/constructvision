import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "constructvision-api.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
  // Silence annoying build warnings
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
  // Log slow pages during build
  logging: { fetches: { fullUrl: false } },
};

export default nextConfig;
