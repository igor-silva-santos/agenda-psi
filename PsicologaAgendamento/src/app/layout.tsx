import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dra. Jandira Frederick - Psicóloga | Agendamento Online',
  description: 'Agende sua consulta com a Dra. Jandira Frederick, psicóloga especialista em Terapia Cognitivo-Comportamental. Atendimento presencial e online em São Paulo.',
  keywords: 'psicóloga, terapia, agendamento, consulta, São Paulo, ansiedade, depressão, TCC',
  authors: [{ name: 'Dra. Jandira Frederick' }],
  creator: 'Dra. Jandira Frederick',
  publisher: 'Dra. Jandira Frederick',
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
    title: 'Dra. Jandira Frederick - Psicóloga | Agendamento Online',
    description: 'Agende sua consulta com a Dra. Jandira Frederick, psicóloga especialista em Terapia Cognitivo-Comportamental.',
    url: 'https://drajandira.com.br',
    siteName: 'Dra. Jandira Frederick - Psicóloga',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dra. Jandira Frederick - Psicóloga | Agendamento Online',
    description: 'Agende sua consulta com a Dra. Jandira Frederick, psicóloga especialista em Terapia Cognitivo-Comportamental.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

