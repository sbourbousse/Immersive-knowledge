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
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-white hover:text-indigo-400 transition-colors">
              Timeline IA
            </a>
            <div className="flex items-center gap-6">
              <a 
                href="/" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Timeline
              </a>
              <a 
                href="/multi-lane" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <span>Multi-Lane</span>
                <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-[10px]">NEW</span>
              </a>
            </div>
          </div>
        </nav>
        
        <SmoothScrollProvider>
          <div className="pt-14">
            {children}
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
