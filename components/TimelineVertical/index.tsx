'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fact, getAwarenessOpacity, getRelevanceTextStyle } from '@/types';
import { ExternalLink, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TimelineVerticalProps {
  facts: Fact[];
  categories: { id: string; name: string; color: string }[];
}

const PIXELS_PER_YEAR = 80;
const BASE_ITEM_GAP_PX = 10;
const BASE_LINE_HEIGHT_PX = 18;
const BASE_PADDING_Y_PX = 16;

// ── FactPanel ──────────────────────────────────────────────────────────────

function FactPanel({
  fact,
  onClose,
  innerRef,
  top = 0,
}: {
  fact: Fact;
  onClose: () => void;
  innerRef: React.RefObject<HTMLDivElement>;
  top?: number;
}) {
  const gradientColor =
    fact.metadata.importance === 'high'
      ? 'linear-gradient(90deg, #6366f1, #ec4899)'
      : fact.metadata.importance === 'medium'
      ? 'linear-gradient(90deg, #6366f1, #06b6d4)'
      : 'linear-gradient(90deg, #374151, #4b5563)';

  const firstParagraph = fact.content.split('\n').filter(Boolean)[0] ?? '';

  return (
    <div
      ref={innerRef}
      className="absolute"
      style={{ left: 'calc(50% + 20px)', right: 0, top, opacity: 0 }}
    >
      <div className="space-y-2">
        <div
          className="h-[2px] w-3/4 rounded-full"
          style={{ background: gradientColor, opacity: 0.7 }}
        />
        <p className="text-[12px] leading-relaxed text-gray-400 line-clamp-4 pr-2">
          {firstParagraph}
        </p>
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {fact.relevanceScore !== undefined && (
            <span className="text-[10px] text-orange-400/70 font-mono tabular-nums">
              {fact.relevanceScore}/100
            </span>
          )}
          <span className={`text-[10px] ${
            fact.metadata.importance === 'high'    ? 'text-red-400/60'
            : fact.metadata.importance === 'medium' ? 'text-yellow-400/60'
            : 'text-gray-600'
          }`}>
            {fact.metadata.importance}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
            <Shield width={9} height={9} />
            {fact.source.name}
          </span>
          <a
            href={fact.source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            <ExternalLink width={9} height={9} />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TimelineVertical ────────────────────────────────────────────────────────

export function TimelineVertical({ facts, categories: _categories }: TimelineVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightColRef  = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);

  const { positionedFacts, yearMarkers, totalHeight } = useMemo(() => {
    if (facts.length === 0) return { positionedFacts: [], yearMarkers: [], totalHeight: 0 };

    const sorted = [...facts].sort((a, b) => a.timestamp - b.timestamp);
    const minTime = sorted[0].timestamp;
    const maxTime = sorted[sorted.length - 1].timestamp;

    const estimateItemHeightPx = (fact: Fact) => {
      const fontSizeEm = parseFloat(getRelevanceTextStyle(fact.relevanceScore).style.fontSize as string);
      const titleLine = BASE_LINE_HEIGHT_PX * (Number.isFinite(fontSizeEm) ? fontSizeEm : 1);
      return BASE_PADDING_Y_PX + titleLine + 6;
    };

    const anchors: { timeY: number; y: number }[] = [];
    const positions = sorted.map((fact, index) => {
      const yearsSinceStart = (fact.timestamp - minTime) / (365.25 * 24 * 60 * 60);
      const timeY = 100 + yearsSinceStart * PIXELS_PER_YEAR;
      const height = estimateItemHeightPx(fact);
      const prevAnchor = anchors[anchors.length - 1];
      const prevFact = sorted[index - 1];
      const prevHeight = prevFact ? estimateItemHeightPx(prevFact) : 0;
      const prevBottom = prevAnchor ? prevAnchor.y + prevHeight : undefined;
      const y = prevBottom == null ? timeY : Math.max(timeY, prevBottom + BASE_ITEM_GAP_PX);
      anchors.push({ timeY, y });
      return { fact, position: y, index, timeY, height };
    });

    const mapTimeYToAdjustedY = (timeY: number) => {
      if (anchors.length === 0) return timeY;
      if (timeY <= anchors[0].timeY) return anchors[0].y + (timeY - anchors[0].timeY);
      const last = anchors[anchors.length - 1];
      if (timeY >= last.timeY) return last.y + (timeY - last.timeY);
      for (let i = 1; i < anchors.length; i++) {
        const l = anchors[i - 1], r = anchors[i];
        if (timeY <= r.timeY) {
          const t = r.timeY === l.timeY ? 0 : (timeY - l.timeY) / (r.timeY - l.timeY);
          return l.y + (r.y - l.y) * t;
        }
      }
      return timeY;
    };

    const markers: { year: number; position: number }[] = [];
    const startYear = new Date(minTime * 1000).getFullYear();
    const endYear = new Date(maxTime * 1000).getFullYear();
    for (let year = Math.floor(startYear / 5) * 5; year <= endYear + 5; year += 5) {
      const ts = new Date(year, 0, 1).getTime() / 1000;
      const yrs = (ts - minTime) / (365.25 * 24 * 60 * 60);
      const y = mapTimeYToAdjustedY(100 + yrs * PIXELS_PER_YEAR);
      if (y >= 0) markers.push({ year, position: y });
    }

    const lastPos = positions[positions.length - 1]?.position || 0;
    const lastHeight = positions[positions.length - 1]?.height || 0;

    return {
      positionedFacts: positions.map(({ fact, position, index }) => ({ fact, position, index })),
      yearMarkers: markers,
      totalHeight: lastPos + lastHeight + 200,
    };
  }, [facts]);

  // Scroll-in animation
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      positionedFacts.forEach(({ index }) => {
        const item = containerRef.current?.querySelector(`.tl-item-${index}`);
        if (!item) return;
        gsap.fromTo(item,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 95%', toggleActions: 'play none none reverse' } }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [positionedFacts]);

  // GSAP: slide right column on select/deselect
  useEffect(() => {
    if (!rightColRef.current) return;
    if (selectedFact) {
      gsap.to(rightColRef.current, { x: '-100%', opacity: 0, duration: 0.35, ease: 'power3.in' });
    } else {
      gsap.to(rightColRef.current, { x: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' });
    }
  }, [selectedFact]);

  // GSAP: animate panel in after React mounts it
  useEffect(() => {
    if (!selectedFact || !panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', delay: 0.2 }
    );
  }, [selectedFact]);

  const handleSelect = useCallback((fact: Fact) => {
    setSelectedFact(prev => prev?.id === fact.id ? null : fact);
  }, []);

  if (facts.length === 0) {
    return <div className="py-20 text-center text-gray-500">Aucun fait à afficher</div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative max-w-4xl mx-auto px-6"
      style={{ height: totalHeight }}
    >
      {/* Year markers */}
      {yearMarkers.map((marker) => (
        <div
          key={marker.year}
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: marker.position }}
        >
          <span className="absolute left-4 text-[11px] text-gray-700 font-mono">{marker.year}</span>
          <div className="flex-1 h-px bg-gray-800/25 mx-16" />
          <span className="absolute right-4 text-[11px] text-gray-700 font-mono">{marker.year}</span>
        </div>
      ))}

      {/* Central axis */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700/40 to-transparent -translate-x-1/2" />

      {/* ── RIGHT COLUMN — slides left as one block on select ── */}
      <div
        ref={rightColRef}
        className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none"
      >
        {positionedFacts.filter(({ index }) => index % 2 !== 0).map(({ fact, position, index }) => {
          const relevanceText = getRelevanceTextStyle(fact.relevanceScore);
          const opacity = getAwarenessOpacity(fact);
          return (
            <div
              key={fact.id}
              className="absolute pointer-events-auto"
              style={{ top: position, left: 'calc(50% + 20px)', right: 0 }}
            >
              <button
                type="button"
                onClick={() => handleSelect(fact)}
                className="group inline-flex items-baseline gap-2 text-left"
                style={{ opacity }}
              >
                <span className="text-[11px] font-mono text-indigo-400/70 shrink-0 tabular-nums">
                  {fact.dateLabel}
                </span>
                <span
                  className={`font-display font-semibold text-gray-200 line-clamp-1 group-hover:text-white transition-colors ${relevanceText.className} ${selectedFact?.id === fact.id ? 'text-indigo-300' : ''}`}
                  style={relevanceText.style}
                >
                  {fact.title}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── DETAIL PANEL — appears in right half when a fact is selected ── */}
      {selectedFact && (
        <FactPanel
          fact={selectedFact}
          onClose={() => setSelectedFact(null)}
          innerRef={panelRef}
          top={positionedFacts.find(p => p.fact.id === selectedFact.id)?.position ?? 0}
        />
      )}

      {/* ── LEFT COLUMN + DOTS — always visible ── */}
      {positionedFacts.map(({ fact, position, index }) => {
        const isRight = index % 2 !== 0;
        const relevanceText = getRelevanceTextStyle(fact.relevanceScore);
        const opacity = getAwarenessOpacity(fact);
        const isSelected = selectedFact?.id === fact.id;

        return (
          <div
            key={fact.id}
            className={`tl-item-${index} absolute left-0 right-0`}
            style={{ top: position }}
          >
            {/* Left-side title */}
            {!isRight && (
              <div className="absolute left-0 right-1/2 pr-8 flex justify-end items-baseline">
                <button
                  type="button"
                  onClick={() => handleSelect(fact)}
                  className="group inline-flex items-baseline gap-2 text-left"
                  style={{ opacity }}
                >
                  <span className="text-[11px] font-mono text-indigo-400/70 shrink-0 tabular-nums">
                    {fact.dateLabel}
                  </span>
                  <span
                    className={`font-display font-semibold text-gray-200 line-clamp-1 group-hover:text-white transition-colors ${relevanceText.className} ${isSelected ? 'text-indigo-300' : ''}`}
                    style={relevanceText.style}
                  >
                    {fact.title}
                  </span>
                </button>
              </div>
            )}

            {/* Dot */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-black z-10 transition-all duration-300 ${
                isSelected
                  ? 'w-[14px] h-[14px] bg-indigo-300 shadow-[0_0_10px_2px_rgba(129,140,248,0.5)]'
                  : 'w-[10px] h-[10px] bg-indigo-600'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
