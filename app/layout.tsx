import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Évolution de l\'IA Générative | Timeline Interactive',
  description: 'Explorez l\'histoire de l\'intelligence artificielle générative de GPT-1 à aujourd\'hui. Une expérience immersive avec animations GSAP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-ui-background text-ui-primary antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
