import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/admin", destination: "/dashboard", permanent: false },
      {
        source: "/admin/:path*",
        destination: "/dashboard/:path*",
        permanent: false,
      },
    ];
  },
  serverExternalPackages: ["postgres"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
