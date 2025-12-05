import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ESTA LÍNEA ES LA SOLUCIÓN:
    unoptimized: true,

    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1', // Agregamos la IP directa por si acaso
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;