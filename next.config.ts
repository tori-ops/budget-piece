import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Exclude prisma/seed.ts from build
    // We'll run seed separately
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
