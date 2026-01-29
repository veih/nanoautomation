import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'standalone', // Isso é útil para Docker, mas não estritamente necessário para distDir
  // distDir: 'dist', // <-- AQUI VOCÊ DEFINE O NOME DA PASTA DE BUILD

  // Allow ngrok origins for development (wildcard for all ngrok domains)
  allowedDevOrigins: [
    '*.ngrok-free.dev',
    '*.ngrok.io',
    'localhost'
  ],

  // Configure headers to allow cross-origin requests during development
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ];
  }
};

export default nextConfig;