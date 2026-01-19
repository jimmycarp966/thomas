import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import NotificationCenter from '@/components/NotificationCenter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thomas - Daniel',
  description: 'Asistente personal de trading inteligente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background dark flex">
          <Sidebar />
          <main className="flex-1 h-screen overflow-y-auto bg-background-dark relative">
            {/* Header con NotificationCenter */}
            <div className="sticky top-0 z-30 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark px-8 py-3 flex items-center justify-end gap-4">
              <NotificationCenter />
            </div>
            <div className="relative z-10 max-w-[1400px] mx-auto p-8 md:p-12 flex flex-col gap-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
