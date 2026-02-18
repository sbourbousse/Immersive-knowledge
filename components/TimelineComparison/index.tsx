'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact } from '@/types';
import { ArrowLeftRight, X, Link2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TimelineComparisonProps {
  lane1: {
    id: string;
    title: string;
    color: string;
    facts: Fact[];
  };
  lane2: {
    id: string;
    title: string;
    color: string;
    facts: Fact[];
  };
  onClose: () => void;
}

export function TimelineComparison({ lane1, lane2, onClose }: TimelineComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeline1Ref = useRef<HTMLDivElement>(null);
  const timeline2Ref = useRef<HTMLDivElement>(null);
  const [hoveredCorrelations, setHoveredCorrelations] = useState<string[]>([]);

  // Find correlations between facts (same time periods)
  const correlations = findCorrelations(lane1.facts, lane2.facts);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(
        '.comparison-lane',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
        }
      );

      // Synchronized horizontal scroll
      const scrollWidth = Math.max(
        timeline1Ref.current?.scrollWidth || 0,
        timeline2Ref.current?.scrollWidth || 0
      );
      const viewportWidth = window.innerWidth;
      const scrollDistance = scrollWidth - viewportWidth + 200;

      if (scrollDistance > 0) {
        gsap.to([timeline1Ref.current, timeline2Ref.current], {
          x: -scrollDistance,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${scrollDistance}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
      }

      // Animate fact cards
      gsap.utils.toArray<HTMLElement>('.comparison-fact').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'left 90%',
              end: 'left 50%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const getFactPosition = (timestamp: number) => {
    const minTime = Math.min(
      ...lane1.facts.map(f => f.timestamp),
      ...lane2.facts.map(f => f.timestamp)
    );
    const maxTime = Math.max(
      ...lane1.facts.map(f => f.timestamp),
      ...lane2.facts.map(f => f.timestamp)
    );
    const range = maxTime - minTime;
    return ((timestamp - minTime) / range) * 100;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-ui-background overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-ui-surface/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <ArrowLeftRight className="text-indigo-400" size={24} />
            <h2 className="font-display text-xl font-bold">Mode Comparaison</h2>
          </div>
          
          {/* Lane labels */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${lane1.color}`} />
              <span className="text-sm font-medium">{lane1.title}</span>
            </div>
            <div className="text-gray-600">vs</div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${lane2.color}`} />
              <span className="text-sm font-medium">{lane2.title}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Timeline container */}
      <div className="pt-24 h-full flex flex-col justify-center gap-8 px-20">
        {/* Lane 1 */}
        <div className="comparison-lane relative">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${lane1.color}`} />
            <span className="font-display font-bold">{lane1.title}</span>
          </div>
          
          <div
            ref={timeline1Ref}
            className="flex items-center gap-6"
            style={{ width: `${Math.max(lane1.facts.length * 350, 2000)}px` }}
          >
            {/* Time axis */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            
            {lane1.facts.sort((a, b) => a.timestamp - b.timestamp).map((fact) => (
              <article
                key={fact.id}
                className={`comparison-fact relative flex-shrink-0 w-72 bg-ui-surface rounded-xl p-5 border border-gray-800 cursor-pointer transition-all duration-300 ${
                  hoveredCorrelations.includes(fact.id) ? 'ring-2 ring-indigo-500 scale-105' : ''
                }`}
                onMouseEnter={() => {
                  const related = correlations
                    .filter(c => c.fact1Id === fact.id || c.fact2Id === fact.id)
                    .flatMap(c => [c.fact1Id, c.fact2Id]);
                  setHoveredCorrelations([fact.id, ...related]);
                }}
                onMouseLeave={() => setHoveredCorrelations([])}
              >
                <span className="text-xs text-gray-500">{fact.dateLabel}</span>
                <h3 className="font-bold mt-1 line-clamp-2">{fact.title}</h3>
                <div className="flex gap-1 mt-2">
                  {fact.categories.map(cat => (
                    <span key={cat} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Correlation connectors */}
        <div className="relative h-12 flex items-center justify-center">
          {correlations.map((corr, i) => (
            <div
              key={i}
              className={`absolute flex items-center gap-2 px-3 py-1 bg-indigo-900/50 rounded-full text-xs transition-opacity ${
                hoveredCorrelations.length > 0 && 
                !hoveredCorrelations.includes(corr.fact1Id) && 
                !hoveredCorrelations.includes(corr.fact2Id)
                  ? 'opacity-20'
                  : 'opacity-100'
              }`}
              style={{ left: `${corr.position}%` }}
            >
              <Link2 size={12} />
              {corr.description}
            </div>
          ))}
        </div>

        {/* Lane 2 */}
        <div className="comparison-lane relative">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${lane2.color}`} />
            <span className="font-display font-bold">{lane2.title}</span>
          </div>
          
          <div
            ref={timeline2Ref}
            className="flex items-center gap-6"
            style={{ width: `${Math.max(lane2.facts.length * 350, 2000)}px` }}
          >
            {/* Time axis */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            
            {lane2.facts.sort((a, b) => a.timestamp - b.timestamp).map((fact) => (
              <article
                key={fact.id}
                className={`comparison-fact relative flex-shrink-0 w-72 bg-ui-surface rounded-xl p-5 border border-gray-800 cursor-pointer transition-all duration-300 ${
                  hoveredCorrelations.includes(fact.id) ? 'ring-2 ring-indigo-500 scale-105' : ''
                }`}
                onMouseEnter={() => {
                  const related = correlations
                    .filter(c => c.fact1Id === fact.id || c.fact2Id === fact.id)
                    .flatMap(c => [c.fact1Id, c.fact2Id]);
                  setHoveredCorrelations([fact.id, ...related]);
                }}
                onMouseLeave={() => setHoveredCorrelations([])}
              >
                <span className="text-xs text-gray-500">{fact.dateLabel}</span>
                <h3 className="font-bold mt-1 line-clamp-2">{fact.title}</h3>
                <div className="flex gap-1 mt-2">
                  {fact.categories.map(cat => (
                    <span key={cat} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-500">
        Scroller horizontalement pour explorer les deux timelines simultanément
      </div>
    </div>
  );
}

// Helper to find correlations between timelines
function findCorrelations(facts1: Fact[], facts2: Fact[]) {
  const correlations: { fact1Id: string; fact2Id: string; description: string; position: number }[] = [];
  
  // Find facts that are close in time (within 90 days)
  const TIME_THRESHOLD = 90 * 24 * 60 * 60; // 90 days in seconds
  
  facts1.forEach(f1 => {
    facts2.forEach(f2 => {
      const timeDiff = Math.abs(f1.timestamp - f2.timestamp);
      if (timeDiff < TIME_THRESHOLD) {
        correlations.push({
          fact1Id: f1.id,
          fact2Id: f2.id,
          description: 'Contemporain',
          position: 50, // Center position (simplified)
        });
      }
    });
  });
  
  return correlations;
}
