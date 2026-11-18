import type { Metadata, Viewport } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'Natal em Cores | Amigo secreto da família',
  description: 'Sorteio de amigo secreto das cores da família, com presentes de até R$ 30.',
  icons: { icon: '/favicon.svg' },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0b2d24',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0b2d24] text-[#17362d] antialiased">{children}</body>
    </html>
  )
}
