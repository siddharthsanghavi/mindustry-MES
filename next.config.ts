import type { NextConfig } from "next";

// ELECTRON_BUILD=1 produces a static export in out/ for the desktop exe.
const isElectron = process.env.ELECTRON_BUILD === "1";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  ...(isElectron && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
