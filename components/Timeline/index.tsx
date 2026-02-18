'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact, TimelineDirection, getTagInfo, getAwarenessOpacity, getRelevanceTextStyle } from '@/types';
import { TagBadge } from '../TagFilter';
import { useFocusMode } from '@/components/FocusMode/FocusModeProvider';

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
  const { openFocus } = useFocusMode();

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
    openFocus(fact);
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
          {sortedFacts.map((fact, index) => {
            const relevanceText = getRelevanceTextStyle(fact.relevanceScore);
            const opacity = getAwarenessOpacity(fact);

            return (
              <button
                key={fact.id}
              type="button"
              className={`fact-card relative w-full text-left rounded-lg px-3 py-2 
                transition-colors duration-150
                ${activeFact === fact.id ? 'bg-indigo-500/10' : ''}
                ${isHighlighted(fact.id) ? 'ring-1 ring-indigo-500' : 'hover:bg-gray-800/40'}`}
              style={{
                borderLeftColor: laneColor,
                borderLeftWidth: '3px',
                opacity,
              }}
              onClick={() => handleFactClick(fact)}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-medium shrink-0" style={{ color: `${laneColor}CC` }}>
                  {fact.dateLabel}
                </span>
                <span
                  className={`text-sm text-gray-100 line-clamp-1 ${relevanceText.className}`}
                  style={relevanceText.style}
                >
                  {fact.title}
                </span>
              </div>

              {/* Timeline dot */}
              <div
                className="absolute -left-[25px] top-8 w-3 h-3 rounded-full border-2 border-ui-background"
                style={{ backgroundColor: laneColor }}
              />
            </button>
            );
          })}
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

        {sortedFacts.map((fact, index) => {
          const relevanceText = getRelevanceTextStyle(fact.relevanceScore);
          const opacity = getAwarenessOpacity(fact);

          return (
            <button
              key={fact.id}
            type="button"
            className={`fact-card relative flex-shrink-0 w-[420px] text-left px-3 py-2 rounded-md
              transition-colors duration-150
              ${activeFact === fact.id ? 'bg-indigo-500/10' : ''}
              ${isHighlighted(fact.id) ? 'ring-1 ring-indigo-500' : 'hover:bg-gray-800/40'}`}
            style={{ opacity }}
            onClick={() => handleFactClick(fact)}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-medium shrink-0" style={{ color: `${laneColor}CC` }}>
                {fact.dateLabel}
              </span>
              <span
                className={`text-sm text-gray-100 line-clamp-1 ${relevanceText.className}`}
                style={relevanceText.style}
              >
                {fact.title}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
