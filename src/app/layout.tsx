import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { useInactivityLogout } from '../components/useInactivityLogout';
import { InactivityProvider } from '../components/InactivityProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jandira C. Frederick - Psicóloga | Agendamento Online',
  description: 'Agende sua consulta com a Jandira C. Frederick, psicóloga especialista em Terapia Cognitivo-Comportamental. Atendimento presencial e online em São Paulo.',
  keywords: 'psicóloga, terapia, agendamento, consulta, São Paulo, ansiedade, depressão, TCC',
  authors: [{ name: 'Jandira C. Frederick' }],
  creator: 'Jandira C. Frederick',
  publisher: 'Jandira C. Frederick',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://drajandira.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Jandira C. Frederick - Psicóloga | Agendamento Online',
    description: 'Agende sua consulta com a Jandira C. Frederick, psicóloga especialista em Terapia Cognitivo-Comportamental.',
    url: 'https://drajandira.com.br',
    siteName: 'Jandira C. Frederick - Psicóloga',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jandira C. Frederick - Psicóloga | Agendamento Online',
    description: 'Agende sua consulta com a Jandira C. Frederick, psicóloga especialista em Terapia Cognitivo-Comportamental.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { ToastProvider } from '../context/ToastContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <Providers>
          <InactivityProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </InactivityProvider>
        </Providers>
        <div id="modal-root" style={{ backgroundColor: 'transparent' }}></div>
      </body>
    </html>
  )
}