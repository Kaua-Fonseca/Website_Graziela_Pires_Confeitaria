import type { NextConfig } from "next";

// GitHub Pages (somente front) usa STATIC_EXPORT=true; o servidor com API/banco não.
const staticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(staticExport && {
    output: "export" as const,
    basePath: "/Website_Graziela_Pires_Confeitaria",
  }),
  env: { NEXT_PUBLIC_STATIC_EXPORT: staticExport ? "true" : "false" },
  images: { unoptimized: true },
  serverExternalPackages: ["@node-rs/argon2", "pg"],
};

export default nextConfig;
