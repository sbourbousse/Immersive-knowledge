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

// Strictement proportionnel au temps
const PIXELS_PER_YEAR = 80; // Réduit pour compacter

export function TimelineVertical({ facts, categories }: TimelineVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedFact } = useTimelineStore();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Positions strictement proportionnelles au temps
  const { positionedFacts, yearMarkers, totalHeight } = useMemo(() => {
    if (facts.length === 0) return { positionedFacts: [], yearMarkers: [], totalHeight: 0 };
    
    const sorted = [...facts].sort((a, b) => a.timestamp - b.timestamp);
    const minTime = sorted[0].timestamp;
    const maxTime = sorted[sorted.length - 1].timestamp;
    
    // Marqueurs d'années tous les 5 ans
    const markers: { year: number; position: number }[] = [];
    const startYear = new Date(minTime * 1000).getFullYear();
    const endYear = new Date(maxTime * 1000).getFullYear();
    
    for (let year = Math.floor(startYear / 5) * 5; year <= endYear + 5; year += 5) {
      const yearTimestamp = new Date(year, 0, 1).getTime() / 1000;
      const yearsSinceStart = (yearTimestamp - minTime) / (365.25 * 24 * 60 * 60);
      const position = yearsSinceStart * PIXELS_PER_YEAR;
      if (position >= -100) { // Évite les marqueurs trop haut
        markers.push({ year, position: position + 100 }); // +100 pour padding initial
      }
    }
    
    // Calcul strictement proportionnel au temps
    const positions = sorted.map((fact, index) => {
      const yearsSinceStart = (fact.timestamp - minTime) / (365.25 * 24 * 60 * 60);
      const position = 100 + yearsSinceStart * PIXELS_PER_YEAR; // +100 padding initial
      
      return { fact, position, index };
    });
    
    const lastPos = positions[positions.length - 1]?.position || 0;
    
    return {
      positionedFacts: positions,
      yearMarkers: markers,
      totalHeight: lastPos + 200,
    };
  }, [facts]);

  // Toggle expand/collapse
  const toggleExpand = (factId: string) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(factId)) {
      newSet.delete(factId);
    } else {
      newSet.add(factId);
    }
    setExpandedCards(newSet);
  };

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      positionedFacts.forEach(({ position }, index) => {
        const item = document.querySelector(`.timeline-item-${index}`);
        if (!item) return;

        gsap.fromTo(
          item,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 95%',
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

  if (facts.length === 0) {
    return <div className="py-20 text-center text-gray-500">Aucun fait à afficher</div>;
  }

  return (
    <div 
      ref={containerRef} 
      className="relative max-w-4xl mx-auto px-6"
      style={{ height: totalHeight }}
    >
      {/* Marqueurs d'années en arrière-plan */}
      {yearMarkers.map((marker) => (
        <div
          key={marker.year}
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: marker.position }}
        >
          <div className="absolute left-4 text-xs text-gray-600 font-mono">
            {marker.year}
          </div>
          <div className="flex-1 h-px bg-gray-800/30 mx-16" />
          <div className="absolute right-4 text-xs text-gray-600 font-mono">
            {marker.year}
          </div>
        </div>
      ))}

      {/* Ligne centrale */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700/30 to-transparent transform -translate-x-1/2" />

      {/* Items de la timeline */}
      {positionedFacts.map(({ fact, position, index }) => {
        const isExpanded = expandedCards.has(fact.id);
        
        return (
          <div
            key={fact.id}
            className={`timeline-item-${index} absolute left-0 right-0 flex items-start`}
            style={{ 
              top: position,
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
            }}
          >
            {/* Carte compacte */}
            <div className={`flex-1 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
              <article
                className={`inline-block max-w-md bg-ui-surface rounded-lg border border-gray-800 
                  hover:border-indigo-500 transition-all duration-200 shadow-md
                  ${isExpanded ? 'p-5' : 'p-3'}`}
              >
                {/* Header compact */}
                <div className="flex items-center gap-2">
                  {/* Date */}
                  <span className={`text-xs font-medium ${isExpanded ? 'px-2 py-1 bg-indigo-600 rounded' : 'text-indigo-400'}`}>
                    {fact.dateLabel}
                  </span>
                  
                  {/* Categories (dots seulement) */}
                  <div className="flex gap-1">
                    {fact.categories?.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className={`w-2 h-2 rounded-full ${getCategoryColor(cat)}`}
                        title={cat}
                      />
                    ))}
                  </div>
                </div>

                {/* Titre (toujours visible) */}
                <h3 
                  className={`font-display font-bold cursor-pointer hover:text-indigo-400 transition-colors
                    ${isExpanded ? 'text-lg mt-2' : 'text-sm mt-1'}`}
                  onClick={() => toggleExpand(fact.id)}
                >
                  {fact.title}
                </h3>

                {/* Contenu (visible seulement si expanded) */}
                {isExpanded && (
                  <>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-4">
                      {fact.content?.replace(/[#*_]/g, '')}
                    </p>

                    {/* Tags */}
                    {fact.tags && fact.tags.length > 0 && (
                      <div className={`mt-3 flex flex-wrap gap-1 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        {fact.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
                            {tag.split(':')[1] || tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Source */}
                    <div className={`mt-3 flex items-center gap-2 text-xs text-gray-500 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <span>{fact.source?.name}</span>
                      {fact.metadata?.importance && (
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          fact.metadata.importance === 'high' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-gray-700'
                        }`}>
                          {fact.metadata.importance}
                        </span>
                      )}
                    </div>

                    {/* Bouton Focus Mode */}
                    <button
                      onClick={() => setSelectedFact(fact)}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Voir plus de détails →
                    </button>
                  </>
                )}

                {/* Bouton expand/collapse si pas expanded */}
                {!isExpanded && (
                  <button
                    onClick={() => toggleExpand(fact.id)}
                    className="mt-2 text-[10px] text-gray-500 hover:text-gray-400"
                  >
                    Cliquer pour développer
                  </button>
                )}
              </article>
            </div>

            {/* Point central */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black shadow-md z-10" />

            {/* Espace vide pour l'autre côté */}
            <div className="flex-1" />
          </div>
        );
      })}
    </div>
  );
}
