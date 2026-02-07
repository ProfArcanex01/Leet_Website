import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disables React Strict Mode's intentional double-invocation in development,
  // which can look like "re-rendering" even when nothing is wrong.
  reactStrictMode: false,
};

export default nextConfig;
