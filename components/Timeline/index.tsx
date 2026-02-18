'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface TimelineProps {
  facts: Fact[];
  categories: { id: string; name: string; color: string }[];
  onFactClick?: (fact: Fact) => void;
}

export function Timeline({ facts, categories, onFactClick }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeFact, setActiveFact] = useState<string | null>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || !timelineRef.current) return;

    const ctx = gsap.context(() => {
      // Calculate total scroll distance
      const timeline = timelineRef.current;
      const scrollWidth = timeline?.scrollWidth || 0;
      const viewportWidth = window.innerWidth;
      const scrollDistance = scrollWidth - viewportWidth;

      // Horizontal scroll animation
      const scrollTween = gsap.to(timeline, {
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

      // Animate each fact card
      const factCards = gsap.utils.toArray<HTMLElement>('.fact-card');
      factCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left 80%',
              end: 'left 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [facts]);

  const handleFactClick = (fact: Fact) => {
    setActiveFact(fact.id);
    onFactClick?.(fact);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || 'bg-gray-500';
  };

  // Sort facts by timestamp
  const sortedFacts = [...facts].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Timeline header */}
      <div className="absolute top-8 left-0 right-0 z-20 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Timeline</h2>
          
          {/* Category legend */}
          <div className="flex gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <span className="text-sm text-gray-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal timeline */}
      <div
        ref={timelineRef}
        className="flex items-center h-full gap-8 px-20"
        style={{ width: `${Math.max(facts.length * 400, 2000)}px` }}
      >
        {/* Timeline axis */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {sortedFacts.map((fact, index) => (
          <article
            key={fact.id}
            className={`fact-card relative flex-shrink-0 w-80 bg-ui-surface rounded-xl p-6 cursor-pointer transition-all duration-300 ${
              activeFact === fact.id ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => handleFactClick(fact)}
          >
            {/* Date marker */}
            <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full text-xs font-medium">
              {fact.dateLabel}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-3 mt-2">
              {fact.categories.map((cat) => (
                <span
                  key={cat}
                  className={`w-2 h-2 rounded-full ${getCategoryColor(cat)}`}
                  title={cat}
                />
              ))}
            </div>

            {/* Title */}
            <h3 className="font-display text-lg font-bold mb-2 line-clamp-2">
              {fact.title}
            </h3>

            {/* Content preview */}
            <p className="text-sm text-gray-400 line-clamp-3">
              {fact.content.replace(/[#*_]/g, '').slice(0, 120)}...
            </p>

            {/* Source indicator */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
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

            {/* Connector line */}
            {index < sortedFacts.length - 1 && (
              <div className="absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-gray-700 to-transparent" />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
