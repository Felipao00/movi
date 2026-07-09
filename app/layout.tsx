import type { Metadata } from 'next';
import { Inter, Playfair_Display, Great_Vibes } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  variable: '--font-signature',
  display: 'swap',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'MOVI',
  description: 'Seu espaço fotográfico',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📷</text></svg>" />
        <style>{`
          html, body {
            background-color: #FAFAFA !important;
            margin: 0;
            padding: 0;
          }
        `}</style>
      </head>
      <body className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
        {children}
      </body>
    </html>
  );
}