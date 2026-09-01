import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.110.136.164', 'localhost:3000'],
  serverExternalPackages: ['node:sqlite', 'bcryptjs'],
};

export default nextConfig;

