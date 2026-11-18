import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite abrir o servidor local pelo celular na mesma rede Wi-Fi (só vale em `npm run dev`).
  allowedDevOrigins: ['192.168.*.*'],
}

export default nextConfig
