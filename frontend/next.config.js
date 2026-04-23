/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Em produção: BACKEND_URL = URL do Railway (ex: https://meu-app.railway.app)
    // Em desenvolvimento: usa 127.0.0.1 para evitar conflito com Docker
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
