import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InnerRoot - Discover the Deeper You',
  description: 'Where your story becomes your strength. Personal growth and self-discovery wellness platform.',
  keywords: 'personal growth, self-discovery, wellness, emotional wellness, life coaching, personal development',
  authors: [{ name: 'InnerRoot Team' }],
  openGraph: {
    title: 'InnerRoot - Personal Growth & Self-Discovery',
    description: 'Empowering individuals through self-discovery, pattern recognition, and personal insight.',
    type: 'website',
    url: 'https://innerroot.com',
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
        {children}
      </body>
    </html>
  )
}