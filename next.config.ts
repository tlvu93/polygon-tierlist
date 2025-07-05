import type { NextConfig } from "next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  webpack: (config, { dev, isServer }) => {
    console.log(`${dev} ${isServer}`);
    config.plugins.push(codeInspectorPlugin({ bundler: "webpack" }));
    return config;
  },
};

export default nextConfig;
