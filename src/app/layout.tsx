import Sidebar from '@/components/Sidebar'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MIRACH Social Manager',
  description: 'Advanced social media management for MIRACH POS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex h-screen bg-gray-50">
          <Sidebar linkedInConnected={false} />
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
