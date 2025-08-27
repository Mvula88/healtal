import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { APP_CONFIG } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
  keywords: 'personal growth coach, root cause analysis, pattern discovery, self-understanding, personal development, AI coaching, deeper patterns, life transformation',
  authors: [{ name: 'Healtal Team' }],
  openGraph: {
    title: `${APP_CONFIG.name} - AI Personal Growth Coach`,
    description: 'Specialized root cause exploration and pattern discovery for lasting personal transformation.',
    type: 'website',
    url: APP_CONFIG.url,
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}