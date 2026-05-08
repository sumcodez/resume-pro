import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "@napi-rs/canvas-win32-x64-msvc",
    "pdf-parse",
    "pdfjs-dist",
  ],
};

export default nextConfig;
