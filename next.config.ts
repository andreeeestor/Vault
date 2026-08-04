import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Excalidraw usa ESM e precisa ser transpilado pelo Next.js
  transpilePackages: ["@excalidraw/excalidraw", "@excalidraw/utils", "@excalidraw/math"],

  webpack: (config) => {
    // Excalidraw depende de canvas em alguns polyfills — informamos ao webpack para ignorar
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
