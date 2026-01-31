import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSH2などのネイティブモジュールをサーバー外部パッケージとして設定
  serverExternalPackages: ["ssh2", "cpu-features"],

  // Turbopack設定（Next.js 16対応）- 空の設定でデフォルト動作を有効化
  turbopack: {},
};

export default nextConfig;
