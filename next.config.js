/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  // NOTA: Turbopack se desactiva desde el comando npm, no desde config
  // Usar: npm run dev:no-turbo
  // Ver: PROBLEMA_SPECS_AUDITORIAS.md
};

module.exports = nextConfig;
