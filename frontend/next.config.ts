import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
