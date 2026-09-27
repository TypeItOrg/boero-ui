import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
  output: "standalone",
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
