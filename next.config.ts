import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // next-intl discovers messages through this alias. The official plugin
  // loads @swc/core, which refuses to start on this machine.
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["next-intl/config"] = path.join(
      __dirname,
      "src/i18n/request.ts",
    );
    return config;
  },
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
