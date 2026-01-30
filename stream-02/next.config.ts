import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // SSH2などのネイティブモジュールをサーバー外部パッケージとして設定
  serverExternalPackages: ["ssh2", "cpu-features"],

  // スタンドアローン構成：stream-02内のモジュールのみを参照
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // スタンドアローン：stream-02内のsrc/を参照
      "@": path.resolve(__dirname, "./src"),
      // ssh2 をstream-02のnode_modulesから解決（ネイティブモジュール対応）
      "ssh2": path.resolve(__dirname, "node_modules/ssh2"),
    };

    // .nodeファイルを無視
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
