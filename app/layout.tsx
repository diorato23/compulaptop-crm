import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compulaptop CRM',
  description: 'Sistema de gestión de leads y atención al cliente — Compulaptop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
