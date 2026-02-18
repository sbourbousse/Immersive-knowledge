/**
 * Layout racine avec providers
 * Configuration globale de l'application
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Évolution de l\'IA Générative | Timeline Interactive',
  description: 'Explorez l\'histoire fascinante de l\'intelligence artificielle générative à travers une timeline immersive et interactive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Préconnexion pour les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
