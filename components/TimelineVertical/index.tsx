'use client';

import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact } from '@/types';
import { useTimelineStore } from '@/store/timelineStore';

gsap.registerPlugin(ScrollTrigger);

interface TimelineVerticalProps {
  facts: Fact[];
  categories: { id: string; name: string; color: string }[];
}

// Pixel height per year - adjust to control spacing
const PIXELS_PER_YEAR = 150;
const MIN_GAP_PX = 80; // Minimum gap between events
const MAX_GAP_PX = 600; // Maximum gap to prevent excessive scrolling

export function TimelineVertical({ facts, categories }: TimelineVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedFact } = useTimelineStore();

  // Calculate time-based positions
  const positionedFacts = useMemo(() => {
    if (facts.length === 0) return [];
    
    const sorted = [...facts].sort((a, b) => a.timestamp - b.timestamp);
    const minTime = sorted[0].timestamp;
    const maxTime = sorted[sorted.length - 1].timestamp;
    const totalYears = (maxTime - minTime) / (365.25 * 24 * 60 * 60);
    
    // Calculate positions based on time
    return sorted.map((fact, index) => {
      const yearsSinceStart = (fact.timestamp - minTime) / (365.25 * 24 * 60 * 60);
      let position = yearsSinceStart * PIXELS_PER_YEAR;
      
      // Ensure minimum gap from previous event
      if (index > 0) {
        const prevPosition = sorted[index - 1].timestamp;
        const prevYears = (prevPosition - minTime) / (365.25 * 24 * 60 * 60);
        const prevPos = prevYears * PIXELS_PER_YEAR;
        const gap = position - prevPos;
        
        if (gap < MIN_GAP_PX) {
          position = prevPos + MIN_GAP_PX;
        } else if (gap > MAX_GAP_PX) {
          // Cap the maximum gap
          position = prevPos + MAX_GAP_PX;
        }
      }
      
      return { fact, position, index };
    });
  }, [facts]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (positionedFacts.length === 0) return 0;
    const lastPos = positionedFacts[positionedFacts.length - 1].position;
    return lastPos + 400; // Add padding at bottom
  }, [positionedFacts]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      positionedFacts.forEach(({ position }, index) => {
        const item = document.querySelector(`.timeline-item-${index}`);
        if (!item) return;

        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [positionedFacts]);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || 'bg-gray-500';
  };

  // Find gaps > 2 years to show visual indicators
  const gapIndicators = useMemo(() => {
    const indicators = [];
    for (let i = 1; i < positionedFacts.length; i++) {
      const current = positionedFacts[i];
      const prev = positionedFacts[i - 1];
      const timeGap = (current.fact.timestamp - prev.fact.timestamp) / (365.25 * 24 * 60 * 60);
      
      if (timeGap > 2) {
        const midY = prev.position + (current.position - prev.position) / 2;
        indicators.push({
          position: midY,
          years: Math.round(timeGap),
          id: `gap-${i}`,
        });
      }
    }
    return indicators;
  }, [positionedFacts]);

  if (facts.length === 0) {
    return <div className="py-20 text-center text-gray-500">Aucun fait à afficher</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className="relative max-w-4xl mx-auto px-6"
      style={{ height: totalHeight }}
    >
      {/* Center line - extends full height */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent transform -translate-x-1/2" />

      {/* Gap indicators for large time spans */}
      {gapIndicators.map((gap) => (
        <div
          key={gap.id}
          className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          style={{ top: gap.position }}
        >
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
            {gap.years} ans de silence
          </div>
          <div className="w-2 h-2 rounded-full bg-gray-600 mt-1" />
        </div>
      ))}

      {/* Timeline Items */}
      {positionedFacts.map(({ fact, position, index }) => (
        <div
          key={fact.id}
          className={`timeline-item-${index} absolute left-0 right-0 flex items-start`}
          style={{ 
            top: position,
            flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
          }}
        >
          {/* Content */}
          <div className={`flex-1 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
            <article
              className="inline-block max-w-md bg-ui-surface rounded-xl p-6 border border-gray-800 cursor-pointer 
                hover:border-indigo-500 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedFact(fact)}
            >
              {/* Date */}
              <div className={`inline-block px-3 py-1 mb-3 text-xs font-medium bg-indigo-600 rounded-full`}>
                {fact.dateLabel}
              </div>

              {/* Categories */}
              <div className={`flex gap-1 mb-3 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                {fact.categories?.map((cat) => (
                  <span
                    key={cat}
                    className={`w-2 h-2 rounded-full ${getCategoryColor(cat)}`}
                    title={cat}
                  />
                ))}
              </div>

              {/* Title */}
              <h3 className="font-display text-lg font-bold mb-2">
                {fact.title}
              </h3>

              {/* Content preview */}
              <p className="text-sm text-gray-400 line-clamp-3">
                {fact.content?.replace(/[#*_]/g, '').slice(0, 150)}...
              </p>

              {/* Tags */}
              {fact.tags && fact.tags.length > 0 && (
                <div className={`mt-3 flex flex-wrap gap-1 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  {fact.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
                      {tag.split(':')[1] || tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Source */}
              <div className={`mt-4 flex items-center gap-2 text-xs text-gray-500 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <span>{fact.source?.name}</span>
                {fact.metadata?.importance && (
                  <span className={`px-2 py-0.5 rounded ${
                    fact.metadata.importance === 'high' 
                      ? 'bg-red-500/20 text-red-400' 
                      : fact.metadata.importance === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-700'
                  }`}>
                    {fact.metadata.importance}
                  </span>
                )}
              </div>
            </article>
          </div>

          {/* Center dot */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full border-4 border-black shadow-lg shadow-indigo-500/30 z-10" />

          {/* Empty space for other side */}
          <div className="flex-1" />
        </div>
      ))}
    </div>
  );
}
