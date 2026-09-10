import type { NextConfig } from "next";
import os from "node:os";

// Automatically discover local network IPs for mobile device preview
const getDevOrigins = (): string[] => {
  const origins = new Set<string>([
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '10.110.136.164',
    '10.110.136.164:3000',
    '192.168.1.6',
    '192.168.1.6:3000',
  ]);

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          origins.add(net.address);
          origins.add(`${net.address}:3000`);
        }
      }
    }
  } catch {
    // Fallback to static list
  }

  return Array.from(origins);
};

const nextConfig: NextConfig = {
  allowedDevOrigins: getDevOrigins(),
  serverExternalPackages: ['node:sqlite', 'bcryptjs'],
};

export default nextConfig;

