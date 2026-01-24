import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Kasa Learning',
  description: 'Aprende a invertir en bienes raices con Kasa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`dark ${inter.variable}`}>
      <body className="bg-kasa-body text-white min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
