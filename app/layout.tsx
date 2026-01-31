import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Kasa Learning',
  description: 'Aprende a invertir en bienes raices con Kasa',
}

import { UserProvider } from '@/context/UserContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${montserrat.variable}`}>
      <body className=" text-white min-h-screen font-sans antialiased relative">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
