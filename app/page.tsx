'use client';

import { Hero } from '@/components/Hero';
import { Timeline } from '@/components/Timeline';
import { TimelineVertical } from '@/components/TimelineVertical';
import { ProgressBar } from '@/components/ProgressBar';
import { TimelineControls } from '@/components/TimelineControls';
import { FocusModeProvider } from '@/components/FocusMode/FocusModeProvider';
import { useTimelineStore } from '@/store/timelineStore';
import { timelines } from '@/lib/data';

export default function Home() {
  const { currentTimelineId, direction } = useTimelineStore();
  const currentTimeline = timelines[currentTimelineId];
  const TimelineComponent = direction === 'horizontal' ? Timeline : TimelineVertical;

  return (
    <FocusModeProvider>
      <main className="relative min-h-screen">
        {/* Controls */}
        <TimelineControls />
        
        {/* Progress Bar */}
        <ProgressBar />
        
        {/* Hero Section */}
        <Hero 
          title={currentTimeline.name}
          subtitle={currentTimeline.description}
          theme="reveal"
        />
        
        {/* Timeline Section */}
        <section className="relative pt-20">
          <TimelineComponent 
            facts={currentTimeline.facts}
            categories={currentTimeline.categories}
          />
        </section>
        
        {/* Footer */}
        <footer className="py-20 px-6 text-center text-gray-500">
          <p className="font-display text-sm">
            Architecture de l'Information Immersive
          </p>
          <p className="text-xs mt-2">
            {currentTimeline.facts.length} faits • {currentTimeline.categories.length} catégories
          </p>
        </footer>
      </main>
    </FocusModeProvider>
  );
}
