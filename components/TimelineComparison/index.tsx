'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact, TimelineLane, FactCorrelation, getTagInfo, getAwarenessOpacity, getRelevanceTextStyle } from '@/types';
import { TagBadge } from '../TagFilter';
import { X, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface TimelineComparisonProps {
  lanes: TimelineLane[];
  onClose: () => void;
}

export function TimelineComparison({ 
  lanes, 
  onClose
}: TimelineComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCorrelations, setHoveredCorrelations] = useState<string[]>([]);
  const [selectedFact, setSelectedFact] = useState<{ fact: Fact; laneId: string } | null>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  // Calculate time range for all lanes
  const timeRange = useMemo(() => {
    const allFacts = lanes.flatMap(l => l.facts);
    const timestamps = allFacts.map(f => f.timestamp);
    return {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps),
    };
  }, [lanes]);

  // Find correlations between facts
  const correlations = useMemo(() => {
    return findCorrelations(lanes, timeRange);
  }, [lanes, timeRange]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Clean up previous triggers
    triggersRef.current.forEach(trigger => trigger.kill());
    triggersRef.current = [];

    if (prefersReducedMotion) {
      gsap.set('.comparison-lane', { opacity: 1 });
      gsap.set('.comparison-fact', { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Vertical mode animations
      gsap.fromTo(
        '.comparison-lane',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );

      gsap.utils.toArray<HTMLElement>('.comparison-fact').forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              onRefresh: (self) => triggersRef.current.push(self),
            },
          }
        );
      });
    }, containerRef);

    return () => {
      ctx.revert();
      triggersRef.current = [];
    };
  }, [lanes]);

  const handleFactHover = useCallback((factId: string | null) => {
    if (!factId) {
      setHoveredCorrelations([]);
      return;
    }
    const related = correlations
      .filter(c => c.fact1Id === factId || c.fact2Id === factId)
      .flatMap(c => [c.fact1Id, c.fact2Id, c.id]);
    setHoveredCorrelations([factId, ...related]);
  }, [correlations]);

  const getCoverageGap = (fact: Fact): number | null => {
    if (!fact.metadata.mediaCoverageDate) return null;
    return fact.metadata.mediaCoverageDate - fact.timestamp;
  };

  const formatGap = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    if (days > 365) return `${Math.floor(days / 365)} ans`;
    if (days > 30) return `${Math.floor(days / 30)} mois`;
    return `${days} jours`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-ui-background overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 py-4 bg-ui-surface/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl font-bold">Mode Comparaison</h2>
            <span className="text-sm text-gray-500">
              {lanes.length} timelines
            </span>
          </div>
          
          {/* Lane labels */}
          <div className="hidden md:flex items-center gap-6">
            {lanes.map((lane) => (
              <div key={lane.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: lane.color }}
                />
                <span className="text-sm font-medium">{lane.title}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-8 max-w-6xl mx-auto px-6">
        <div className="space-y-8">
          {lanes.map((lane) => (
            <div key={lane.id} className="comparison-lane">
              {/* Lane header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: lane.color }} />
                <h3 className="font-display font-bold text-lg">{lane.title}</h3>
                <span className="text-xs text-gray-500">({lane.facts.length} faits)</span>
              </div>

              {/* Timeline axis */}
              <div className="relative">
                <div
                  className="absolute left-8 w-px h-full"
                  style={{ backgroundColor: `${lane.color}30` }}
                />

                {/* Facts */}
                <div className="space-y-4 pl-12">
                  {lane.facts.sort((a, b) => a.timestamp - b.timestamp).map((fact) => {
                    const gap = getCoverageGap(fact);
                    const isHighlighted = hoveredCorrelations.includes(fact.id);
                    const relevanceText = getRelevanceTextStyle(fact.relevanceScore);
                    const opacity = getAwarenessOpacity(fact);

                    return (
                      <button
                        key={fact.id}
                        type="button"
                        className={cn(
                          'comparison-fact relative w-full text-left',
                          'px-3 py-2 rounded-md border',
                          'transition-colors duration-150',
                          isHighlighted
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-ui-surface border-gray-800 hover:border-gray-700'
                        )}
                        style={{ borderLeftColor: lane.color, borderLeftWidth: '3px', opacity }}
                        onMouseEnter={() => handleFactHover(fact.id)}
                        onMouseLeave={() => handleFactHover(null)}
                        onClick={() => setSelectedFact({ fact, laneId: lane.id })}
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[11px] font-medium" style={{ color: lane.color }}>
                            {fact.dateLabel}
                          </span>
                          <span
                            className={cn('text-sm text-gray-100 line-clamp-1', relevanceText.className)}
                            style={relevanceText.style}
                          >
                            {fact.title}
                          </span>
                          {gap && gap > 2592000 && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-300 rounded"
                              title={`Retard médiatique: ${formatGap(gap)}`}
                            >
                              +{formatGap(gap)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fact detail modal */}
      {selectedFact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedFact(null)}
        >
          <div
            className="bg-ui-surface rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm text-gray-500">{selectedFact.fact.dateLabel}</span>
                <h3
                  className={cn('font-bold mt-1', getRelevanceTextStyle(selectedFact.fact.relevanceScore).className)}
                  style={getRelevanceTextStyle(selectedFact.fact.relevanceScore).style}
                >
                  {selectedFact.fact.title}
                </h3>
                {selectedFact.fact.relevanceScore !== undefined && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-300">
                      Pertinence: {selectedFact.fact.relevanceScore}/100
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedFact(null)}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="prose prose-invert max-w-none mb-4">
              <div className="text-gray-300 whitespace-pre-wrap">
                {selectedFact.fact.content}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedFact.fact.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800 text-sm text-gray-500">
              Source:{' '}
              <a
                href={selectedFact.fact.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                {selectedFact.fact.source.name}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to find correlations between timelines
function findCorrelations(
  lanes: TimelineLane[],
  timeRange: { start: number; end: number }
): FactCorrelation[] {
  const correlations: FactCorrelation[] = [];
  const TIME_THRESHOLD = 90 * 24 * 60 * 60; // 90 days in seconds
  
  // Compare each pair of lanes
  for (let i = 0; i < lanes.length; i++) {
    for (let j = i + 1; j < lanes.length; j++) {
      const lane1 = lanes[i];
      const lane2 = lanes[j];
      
      // Find temporal correlations
      lane1.facts.forEach(f1 => {
        lane2.facts.forEach(f2 => {
          const timeDiff = Math.abs(f1.timestamp - f2.timestamp);
          
          if (timeDiff < TIME_THRESHOLD) {
            correlations.push({
              id: `corr-${f1.id}-${f2.id}`,
              fact1Id: f1.id,
              lane1Id: lane1.id,
              fact2Id: f2.id,
              lane2Id: lane2.id,
              type: 'temporal',
              description: 'Événements contemporains',
              position: ((f1.timestamp - timeRange.start) / (timeRange.end - timeRange.start)) * 100,
              strength: 1 - (timeDiff / TIME_THRESHOLD),
            });
          }
          
          // Check for coverage gaps
          if (f1.metadata.mediaCoverageDate && !f2.metadata.mediaCoverageDate) {
            const gap = f1.metadata.mediaCoverageDate - f1.timestamp;
            if (gap > TIME_THRESHOLD) {
              correlations.push({
                id: `gap-${f1.id}`,
                fact1Id: f1.id,
                lane1Id: lane1.id,
                fact2Id: f2.id,
                lane2Id: lane2.id,
                type: 'coverage-gap',
                description: 'Retard de couverture',
                timeGap: gap,
                position: ((f1.timestamp - timeRange.start) / (timeRange.end - timeRange.start)) * 100,
                strength: 0.8,
              });
            }
          }
        });
      });
    }
  }
  
  return correlations;
}
