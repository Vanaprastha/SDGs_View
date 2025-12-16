/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Abaikan error TypeScript saat build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Abaikan error ESLint saat build
    ignoreDuringBuilds: true,
  },
  // Fix Supabase ESM import error
  transpilePackages: ['@supabase/supabase-js'],

  // Proxy backend API requests to FastAPI server (using Docker container name - HTTP)
  async rewrites() {
    return [
      {
        source: '/run-clustering',
        destination: 'http://sdgs_backend_internal:8000/run-clustering',
      },
    ];
  },
};

export default nextConfig;

