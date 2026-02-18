'use client';

import { useRef } from 'react';
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

export function TimelineVertical({ facts, categories }: TimelineVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedFact } = useTimelineStore();

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.timeline-vertical-item');
      
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [facts]);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || 'bg-gray-500';
  };

  const sortedFacts = [...facts].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto py-20 px-6">
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

      {sortedFacts.map((fact, index) => (
        <div
          key={fact.id}
          className={`timeline-vertical-item relative flex items-center gap-8 mb-16 ${
            index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          {/* Content */}
          <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
            <article
              className="inline-block max-w-md bg-ui-surface rounded-xl p-6 border border-gray-800 cursor-pointer hover:border-indigo-500 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedFact(fact)}
            >
              {/* Date */}
              <div className={`inline-block px-3 py-1 mb-3 text-xs font-medium bg-indigo-600 rounded-full`}>
                {fact.dateLabel}
              </div>

              {/* Categories */}
              <div className={`flex gap-2 mb-3 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                {(fact.categories || []).map((cat) => (
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
                {fact.content.replace(/[#*_]/g, '').slice(0, 150)}...
              </p>

              {/* Source */}
              <div className={`mt-4 flex items-center gap-2 text-xs text-gray-500 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <span>{fact.source.name}</span>
                <span className={`px-2 py-0.5 rounded ${
                  fact.metadata.importance === 'high' 
                    ? 'bg-red-500/20 text-red-400' 
                    : fact.metadata.importance === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700'
                }`}>
                  {fact.metadata.importance}
                </span>
              </div>
            </article>
          </div>

          {/* Center dot */}
          <div className="relative z-10 w-4 h-4 bg-indigo-500 rounded-full border-4 border-ui-background shadow-lg shadow-indigo-500/30" />

          {/* Empty space for other side */}
          <div className="flex-1" />
        </div>
      ))}
    </div>
  );
}
