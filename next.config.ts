import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Frontend-Backend Mismatches (Deployment Skew Protection)
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@tanstack/react-query"],
  },
};

export default nextConfig;
