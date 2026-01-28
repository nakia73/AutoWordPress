import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark ssh2 as external to prevent Turbopack bundling issues
  // ssh2 uses native crypto modules that are not ESM-compatible
  serverExternalPackages: ['ssh2'],
};

export default nextConfig;
