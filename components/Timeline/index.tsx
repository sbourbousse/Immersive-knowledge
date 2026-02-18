'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact, TimelineDirection, getTagInfo } from '@/types';
import { TagBadge } from '../TagFilter';

gsap.registerPlugin(ScrollTrigger);

interface TimelineProps {
  facts: Fact[];
  direction?: TimelineDirection;
  onFactClick?: (fact: Fact) => void;
  mode?: 'single' | 'comparison';
  highlightedFacts?: string[];
  laneId?: string;
  laneColor?: string;
  laneTitle?: string;
  selectedTags?: string[];
}

export function Timeline({
  facts,
  direction = 'horizontal',
  onFactClick,
  mode = 'single',
  highlightedFacts = [],
  laneId,
  laneColor = '#6366f1',
  laneTitle,
  selectedTags = [],
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeFact, setActiveFact] = useState<string | null>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  // Filter facts by selected tags
  const filteredFacts = useMemo(() => {
    if (selectedTags.length === 0) return facts;
    return facts.filter(fact =>
      selectedTags.some(tag => fact.tags.includes(tag))
    );
  }, [facts, selectedTags]);

  // Sort facts by timestamp
  const sortedFacts = useMemo(() => {
    return [...filteredFacts].sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredFacts]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Clean up previous triggers
    triggersRef.current.forEach(trigger => trigger.kill());
    triggersRef.current = [];

    if (prefersReducedMotion || !timelineRef.current) {
      // Show content immediately without animation
      gsap.set('.fact-card', { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      if (direction === 'horizontal') {
        // Calculate total scroll distance
        const timeline = timelineRef.current;
        const scrollWidth = timeline?.scrollWidth || 0;
        const viewportWidth = window.innerWidth;
        const scrollDistance = scrollWidth - viewportWidth;

        if (scrollDistance > 0) {
          // Horizontal scroll animation with pinning
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
              onRefresh: (self) => triggersRef.current.push(self),
            },
          });

          // Animate each fact card with container animation
          const factCards = gsap.utils.toArray<HTMLElement>('.fact-card');
          factCards.forEach((card) => {
            const anim = gsap.fromTo(
              card,
              { opacity: 0, y: 50, scale: 0.9 },
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
                  onRefresh: (self) => triggersRef.current.push(self),
                },
              }
            );
          });
        }
      } else {
        // Vertical mode - natural scroll with reveal animations
        const factCards = gsap.utils.toArray<HTMLElement>('.fact-card');
        factCards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 50%',
                toggleActions: 'play none none reverse',
                onRefresh: (self) => triggersRef.current.push(self),
              },
            }
          );
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
      triggersRef.current = [];
    };
  }, [facts, direction]);

  const handleFactClick = useCallback((fact: Fact) => {
    setActiveFact(fact.id);
    onFactClick?.(fact);
  }, [onFactClick]);

  const isHighlighted = useCallback((factId: string) => {
    return highlightedFacts.includes(factId);
  }, [highlightedFacts]);

  if (direction === 'vertical') {
    return (
      <div ref={containerRef} className="relative py-8">
        {/* Lane header */}
        {laneTitle && (
          <div className="flex items-center gap-3 mb-8 px-6">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: laneColor }}
            />
            <span className="font-display font-bold text-lg">{laneTitle}</span>
          </div>
        )}

        {/* Vertical timeline axis */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

        {/* Facts list */}
        <div className="space-y-8 px-6 pl-16">
          {sortedFacts.map((fact, index) => (
            <article
              key={fact.id}
              className={`fact-card relative bg-ui-surface rounded-xl p-6 cursor-pointer 
                transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                ${activeFact === fact.id ? 'ring-2 ring-offset-2 ring-offset-ui-background' : ''}
                ${isHighlighted(fact.id) ? 'ring-2 ring-indigo-500' : 'border border-gray-800'}`}
              style={{
                borderLeftColor: isHighlighted(fact.id) ? undefined : laneColor,
                borderLeftWidth: isHighlighted(fact.id) ? undefined : '3px',
              }}
              onClick={() => handleFactClick(fact)}
            >
              {/* Date marker */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: laneColor }}
                >
                  {fact.dateLabel}
                </div>
                {fact.metadata.importance === 'high' && (
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                    Important
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-bold mb-3">
                {fact.title}
              </h3>

              {/* Content preview */}
              <p className="text-gray-400 mb-4 line-clamp-3">
                {fact.content.replace(/[#*_]/g, '').slice(0, 200)}...
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {fact.tags.slice(0, 4).map((tag) => (
                  <TagBadge key={tag} tag={tag} size="sm" />
                ))}
                {fact.tags.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{fact.tags.length - 4}
                  </span>
                )}
              </div>

              {/* Source */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800">
                <span>{fact.source.name}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        fact.source.reliabilityScore > 0.9
                          ? '#10b981'
                          : fact.source.reliabilityScore > 0.7
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                    title={`Fiabilité: ${Math.round(fact.source.reliabilityScore * 100)}%`}
                  />
                </div>
              </div>

              {/* Timeline dot */}
              <div
                className="absolute -left-[25px] top-8 w-3 h-3 rounded-full border-2 border-ui-background"
                style={{ backgroundColor: laneColor }}
              />
            </article>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal mode
  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Lane header */}
      {laneTitle && (
        <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: laneColor }}
          />
          <span className="font-display font-bold">{laneTitle}</span>
        </div>
      )}

      {/* Horizontal timeline */}
      <div
        ref={timelineRef}
        className="flex items-center h-full gap-8 px-20 pt-16"
        style={{ width: `${Math.max(sortedFacts.length * 400, 2000)}px` }}
      >
        {/* Timeline axis */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${laneColor}40, transparent)`,
          }}
        />

        {sortedFacts.map((fact, index) => (
          <article
            key={fact.id}
            className={`fact-card relative flex-shrink-0 w-80 bg-ui-surface rounded-xl p-6 
              cursor-pointer transition-all duration-300 hover:scale-[1.02]
              ${activeFact === fact.id ? 'ring-2 ring-offset-2 ring-offset-ui-background' : 'border border-gray-800'}
              ${isHighlighted(fact.id) ? 'ring-2 ring-indigo-500 scale-105' : ''}`}
            onClick={() => handleFactClick(fact)}
          >
            {/* Date marker */}
            <div
              className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: laneColor }}
            >
              {fact.dateLabel}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3 mt-2">
              {fact.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} size="xs" />
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
              <span className="truncate max-w-[150px]">{fact.source.name}</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  fact.metadata.importance === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : fact.metadata.importance === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700'
                }`}
              >
                {fact.metadata.importance}
              </span>
            </div>

            {/* Connector line */}
            {index < sortedFacts.length - 1 && (
              <div
                className="absolute top-1/2 -right-8 w-8 h-px"
                style={{
                  background: `linear-gradient(to right, ${laneColor}40, transparent)`,
                }}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
