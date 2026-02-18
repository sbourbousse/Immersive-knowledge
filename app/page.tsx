'use client';

import { Hero } from '@/components/Hero';
import { Timeline } from '@/components/Timeline';
import { ProgressBar } from '@/components/ProgressBar';
import { FocusModeProvider } from '@/components/FocusMode/FocusModeProvider';
import { facts, categories } from '@/lib/data';

export default function Home() {
  return (
    <FocusModeProvider>
      <main className="relative min-h-screen">
        {/* Progress Bar */}
        <ProgressBar />
        
        {/* Hero Section */}
        <Hero 
          title="L'Évolution de l'IA Générative"
          subtitle="De GPT-1 (2018) aux agents autonomes (2025) — une exploration immersive des moments clés qui ont défini l'intelligence artificielle moderne."
          theme="reveal"
        />
        
        {/* Timeline Section */}
        <section className="relative">
          <Timeline 
            facts={facts}
            categories={categories}
          />
        </section>
        
        {/* Footer */}
        <footer className="py-20 px-6 text-center text-gray-500">
          <p className="font-display text-sm">
            Architecture de l'Information Immersive
          </p>
          <p className="text-xs mt-2">
            Propulsé par Next.js, GSAP & Intelligence Artificielle
          </p>
        </footer>
      </main>
    </FocusModeProvider>
  );
}
