'use client';

import { useRef, useMemo, useState } from 'react';
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

// Configuration de l'espacement
const PIXELS_PER_YEAR = 120;
const MIN_CARD_GAP = 120; // Minimum gap between cards
const COLLAPSE_THRESHOLD = 80; // If cards would be closer than this, collapse them

export function TimelineVertical({ facts, categories }: TimelineVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedFact } = useTimelineStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Calculate time-based positions with collapse logic
  const { positionedFacts, yearMarkers, totalHeight } = useMemo(() => {
    if (facts.length === 0) return { positionedFacts: [], yearMarkers: [], totalHeight: 0 };
    
    const sorted = [...facts].sort((a, b) => a.timestamp - b.timestamp);
    const minTime = sorted[0].timestamp;
    const maxTime = sorted[sorted.length - 1].timestamp;
    
    // Generate year markers every 5 years
    const markers: { year: number; position: number }[] = [];
    const startYear = new Date(minTime * 1000).getFullYear();
    const endYear = new Date(maxTime * 1000).getFullYear();
    
    for (let year = Math.floor(startYear / 5) * 5; year <= endYear; year += 5) {
      const yearTimestamp = new Date(year, 0, 1).getTime() / 1000;
      const yearsSinceStart = (yearTimestamp - minTime) / (365.25 * 24 * 60 * 60);
      const position = yearsSinceStart * PIXELS_PER_YEAR;
      markers.push({ year, position });
    }
    
    // Calculate positions with collision detection
    const positions: { fact: Fact; position: number; index: number; groupId?: string }[] = [];
    let currentY = 100; // Start padding
    let groupCounter = 0;
    
    sorted.forEach((fact, index) => {
      const yearsSinceStart = (fact.timestamp - minTime) / (365.25 * 24 * 60 * 60);
      const idealPosition = 100 + yearsSinceStart * PIXELS_PER_YEAR;
      
      // Check if we need to collapse with previous
      if (index > 0) {
        const prevPos = positions[index - 1].position;
        const gap = idealPosition - prevPos;
        
        if (gap < COLLAPSE_THRESHOLD) {
          // Collapse - place close to previous
          currentY = prevPos + MIN_CARD_GAP;
        } else {
          currentY = idealPosition;
        }
      } else {
        currentY = idealPosition;
      }
      
      positions.push({ fact, position: currentY, index });
    });
    
    const lastPos = positions[positions.length - 1]?.position || 0;
    
    return {
      positionedFacts: positions,
      yearMarkers: markers,
      totalHeight: lastPos + 400,
    };
  }, [facts]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      positionedFacts.forEach(({ position }, index) => {
        const item = document.querySelector(`.timeline-item-${index}`);
        if (!item) return;

        gsap.fromTo(
          item,
          { opacity: 0, y: 30 },
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

  // Find events that are "collapsed" (close together)
  const collapsedEvents = useMemo(() => {
    const groups: { start: number; end: number; facts: typeof positionedFacts }[] = [];
    let currentGroup: typeof positionedFacts = [];
    
    positionedFacts.forEach((item, idx) => {
      if (idx === 0) {
        currentGroup = [item];
      } else {
        const prevGap = item.position - positionedFacts[idx - 1].position;
        if (prevGap < COLLAPSE_THRESHOLD * 1.5) {
          currentGroup.push(item);
        } else {
          if (currentGroup.length > 1) {
            groups.push({
              start: currentGroup[0].position,
              end: currentGroup[currentGroup.length - 1].position,
              facts: [...currentGroup],
            });
          }
          currentGroup = [item];
        }
      }
    });
    
    if (currentGroup.length > 1) {
      groups.push({
        start: currentGroup[0].position,
        end: currentGroup[currentGroup.length - 1].position,
        facts: [...currentGroup],
      });
    }
    
    return groups;
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
      {/* Year markers in background */}
      {yearMarkers.map((marker) => (
        <div
          key={marker.year}
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: marker.position }}
        >
          {/* Year label */}
          <div className="absolute left-4 text-xs text-gray-600 font-mono">
            {marker.year}
          </div>
          
          {/* Horizontal line */}
          <div className="flex-1 h-px bg-gray-800/50 mx-16" />
          
          {/* Year label right */}
          <div className="absolute right-4 text-xs text-gray-600 font-mono">
            {marker.year}
          </div>
        </div>
      ))}

      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700/50 to-transparent transform -translate-x-1/2" />

      {/* Collapse indicators */}
      {collapsedEvents.map((group, groupIdx) => (
        <div
          key={`collapse-${groupIdx}`}
          className="absolute left-1/2 transform -translate-x-1/2 z-20"
          style={{ 
            top: group.start + (group.end - group.start) / 2,
          }}
        >
          <button
            onClick={() => {
              const newSet = new Set(collapsedGroups);
              const groupKey = `${group.start}-${group.end}`;
              if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
              } else {
                newSet.add(groupKey);
              }
              setCollapsedGroups(newSet);
            }}
            className="flex items-center justify-center w-8 h-8 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"
            title={`${group.facts.length} événements regroupés`}
          >
            <span className="text-xs font-bold text-indigo-400">{group.facts.length}</span>
          </button>
        </div>
      ))}

      {/* Timeline Items */}
      {positionedFacts.map(({ fact, position, index }) => {
        // Check if this fact is in a collapsed group
        const inCollapsedGroup = collapsedEvents.some(g => 
          g.facts.some(f => f.fact.id === fact.id)
        );
        const isGroupCollapsed = collapsedEvents.some(g => 
          g.facts.some(f => f.fact.id === fact.id) && 
          collapsedGroups.has(`${g.start}-${g.end}`)
        );
        
        // If in collapsed group and group is collapsed, only show first
        if (isGroupCollapsed) {
          const group = collapsedEvents.find(g => g.facts.some(f => f.fact.id === fact.id));
          if (group && group.facts[0].fact.id !== fact.id) {
            return null; // Hide collapsed items
          }
        }
        
        return (
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
                className="inline-block max-w-md bg-ui-surface/95 backdrop-blur rounded-xl p-5 border border-gray-800 cursor-pointer 
                  hover:border-indigo-500 transition-all duration-300 hover:scale-[1.02] shadow-lg"
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
        );
      })}
    </div>
  );
}
