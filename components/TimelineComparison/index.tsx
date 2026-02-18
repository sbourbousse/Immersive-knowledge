'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact } from '@/types';
import { useTimelineStore } from '@/store/timelineStore';

gsap.registerPlugin(ScrollTrigger);

interface TimelineComparisonProps {
  lanes: {
    id: string;
    title: string;
    color: string;
    facts: Fact[];
  }[];
}

export function TimelineComparison({ lanes }: TimelineComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedFact } = useTimelineStore();
  const [hoveredFact, setHoveredFact] = useState<string | null>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.comparison-lane',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">
          Mode Comparaison
        </h2>
        
        <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${lanes.length}, 1fr)` }}>
          {lanes.map((lane) => (
            <div key={lane.id} className="comparison-lane">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b" style={{ borderColor: lane.color }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
                <h3 className="font-bold">{lane.title}</h3>
              </div>
              
              <div className="space-y-4">
                {lane.facts
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((fact) => (
                    <article
                      key={fact.id}
                      className={`bg-ui-surface rounded-lg p-4 border transition-all duration-300 cursor-pointer ${
                        hoveredFact === fact.id 
                          ? 'ring-2 ring-indigo-500 scale-[1.02]' 
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                      onMouseEnter={() => setHoveredFact(fact.id)}
                      onMouseLeave={() => setHoveredFact(null)}
                      onClick={() => setSelectedFact(fact)}
                    >
                      <div className="text-xs text-gray-500 mb-1">{fact.dateLabel}</div>
                      <h4 className="font-medium text-sm mb-2">{fact.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {fact.content.slice(0, 100)}...
                      </p>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
