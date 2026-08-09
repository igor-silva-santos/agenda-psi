import type { Metadata } from 'next';
import { Archivo, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { InactivityProvider } from '../components/InactivityProvider';
import { ToastProvider } from '../context/ToastContext';
import { siteConfig } from '@/config/site';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: siteConfig.productName }],
  creator: siteConfig.productName,
  publisher: siteConfig.productName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.urls.site),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    url: siteConfig.urls.site,
    siteName: siteConfig.productName,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href={siteConfig.assets.logo} type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={siteConfig.themeColor} />
      </head>
      <body
        className={`${archivo.variable} ${spaceGrotesk.variable} font-body antialiased`}
      >
        <Providers>
          <InactivityProvider>
            <ToastProvider>{children}</ToastProvider>
          </InactivityProvider>
        </Providers>
        <div id="modal-root" style={{ backgroundColor: 'transparent' }} />
      </body>
    </html>
  );
}
