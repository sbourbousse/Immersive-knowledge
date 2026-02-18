'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  useMultiTimelineStore, 
  selectVisibleLanes,
} from '@/store/multiTimelineStore';
import { 
  useFilteredLanes, 
  useCommonTimeRange, 
  useCorrelations,
  FilteredLane,
} from '@/hooks/useLaneFilters';
import { Fact } from '@/types';
import { useFocusMode } from '@/components/FocusMode/FocusModeProvider';

const PIXELS_PER_YEAR = 80;
const MIN_ITEM_GAP_PX = 28;

// ============================================================================
// FULLSCREEN BUTTON
// ============================================================================

function FullscreenButton({ 
  isFullscreen, 
  onToggle 
}: { 
  isFullscreen: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 
        border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
      title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
    >
      {isFullscreen ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
          <span className="hidden sm:inline">Quitter</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <span className="hidden sm:inline">Plein écran</span>
        </>
      )}
    </button>
  );
}

// ============================================================================
// TIMELINE LANE VIEW
// ============================================================================

interface TimelineLaneViewProps {
  filteredLane: FilteredLane;
  timeRange: { start: number; end: number };
  isActive: boolean;
  onActivate: () => void;
  onFactClick?: (fact: Fact) => void;
  onScroll?: (scrollTop: number) => void;
  scrollRef?: React.RefCallback<HTMLDivElement>;
}

function TimelineLaneView({
  filteredLane,
  timeRange,
  isActive,
  onActivate,
  onFactClick,
  onScroll,
  scrollRef,
}: TimelineLaneViewProps) {
  const { lane, facts } = filteredLane;
  const { start, end } = timeRange;
  const { openFocus } = useFocusMode();

  const { positionedFacts, totalHeight } = useMemo(() => {
    if (facts.length === 0) return { positionedFacts: [] as { fact: Fact; position: number; index: number }[], totalHeight: 0 };

    const sorted = [...facts].sort((a, b) => a.timestamp - b.timestamp);

    const toTimePosition = (timestamp: number) => {
      const yearsSinceStart = (timestamp - start) / (365.25 * 24 * 60 * 60);
      return 32 + yearsSinceStart * PIXELS_PER_YEAR;
    };

    const anchors: { timeY: number; y: number }[] = [];
    const positions = sorted.map((fact, index) => {
      const timeY = toTimePosition(fact.timestamp);
      const prevY = anchors[anchors.length - 1]?.y;
      const y = prevY == null ? timeY : Math.max(timeY, prevY + MIN_ITEM_GAP_PX);
      anchors.push({ timeY, y });
      return { fact, position: y, index };
    });

    const lastPos = positions[positions.length - 1]?.position || 0;
    return {
      positionedFacts: positions,
      totalHeight: Math.max(lastPos + 120, 900),
    };
  }, [facts, start]);
  
  return (
    <div
      className={cn(
        'flex flex-col h-full min-h-0 border-r border-gray-800 last:border-r-0',
        'transition-all duration-200',
        isActive && 'bg-gray-900/30'
      )}
      onClick={onActivate}
    >
      {/* Lane header */}
      <div 
        className="flex-shrink-0 px-4 py-3 border-b border-gray-800"
        style={{ borderLeftColor: lane.color, borderLeftWidth: '3px' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white truncate">{lane.name}</h3>
          <span className="text-xs text-gray-500">{facts.length} faits</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {lane.includedTags.map(tag => (
            <span 
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded"
            >
              +{tag.split(':')[1]}
            </span>
          ))}
          {lane.excludedTags.map(tag => (
            <span 
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded"
            >
              -{tag.split(':')[1]}
            </span>
          ))}
        </div>
      </div>
      
      {/* Timeline content */}
      <div 
        ref={scrollRef}
        onScroll={(e) => onScroll?.((e.currentTarget as HTMLDivElement).scrollTop)}
        className="flex-1 min-h-0 max-h-full overflow-y-scroll overflow-x-hidden relative overscroll-contain"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Timeline track */}
        <div className="relative" style={{ height: totalHeight }}>
          {/* Center line */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800"
            style={{ backgroundColor: `${lane.color}30` }}
          />
          
          {/* Facts */}
          {positionedFacts.map(({ fact, position, index }) => (
            <FactNode
              key={fact.id}
              fact={fact}
              positionPx={position}
              laneColor={lane.color}
              onClick={() => {
                onFactClick?.(fact);
                openFocus(fact);
              }}
            />
          ))}
          
          {/* Empty state */}
          {facts.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-600">Aucun fait à afficher</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FACT NODE
// ============================================================================

interface FactNodeProps {
  fact: Fact;
  positionPx: number;
  laneColor: string;
  onClick?: () => void;
}

function FactNode({ fact, positionPx, laneColor, onClick }: FactNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="absolute left-0 right-0 px-4"
      style={{ top: positionPx, transform: 'translateY(-50%)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        <div className="flex-1" />

        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-gray-950 shadow-md',
            isHovered && 'scale-125'
          )}
          style={{ backgroundColor: laneColor }}
        />

        <div className="flex-1 pl-6">
          <button
            type="button"
            onClick={onClick}
            className="group inline-flex items-baseline gap-2 max-w-[320px] text-left"
          >
            <span className="text-[10px] font-medium shrink-0" style={{ color: `${laneColor}CC` }}>
              {fact.dateLabel}
            </span>
            <span
              className={cn(
                'text-sm font-display font-semibold text-gray-100 transition-colors line-clamp-1',
                'group-hover:text-white'
              )}
            >
              {fact.title}
            </span>
            <span className="sr-only">Ouvrir les détails</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CORRELATION LINES (SVG Overlay)
// ============================================================================

interface CorrelationLinesProps {
  correlations: ReturnType<typeof useCorrelations>;
  filteredLanes: FilteredLane[];
  containerRef: React.RefObject<HTMLDivElement>;
}

function CorrelationLines({ correlations, filteredLanes, containerRef }: CorrelationLinesProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const showCorrelations = useMultiTimelineStore((s) => s.showCorrelations);
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.scrollWidth,
          height: containerRef.current.scrollHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef]);
  
  if (!showCorrelations || correlations.length === 0 || dimensions.width === 0) {
    return null;
  }
  
  // Get lane positions
  const laneWidth = dimensions.width / filteredLanes.length;
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={dimensions.width}
      height={dimensions.height}
    >
      <defs>
        <linearGradient id="correlation-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {correlations.slice(0, 20).map((corr) => {
        // Find fact positions (simplified - would need actual DOM refs for accuracy)
        const lane1Index = filteredLanes.findIndex(l => l.lane.id === corr.lane1Id);
        const lane2Index = filteredLanes.findIndex(l => l.lane.id === corr.lane2Id);
        
        if (lane1Index === -1 || lane2Index === -1) return null;
        
        const x1 = lane1Index * laneWidth + laneWidth / 2;
        const x2 = lane2Index * laneWidth + laneWidth / 2;
        
        // Approximate Y position based on time (this is simplified)
        const y = dimensions.height / 2;
        
        return (
          <line
            key={corr.id}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="url(#correlation-gradient)"
            strokeWidth={Math.max(1, corr.strength * 3)}
            strokeDasharray={corr.timeDelta > 86400 * 7 ? "4 4" : undefined}
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface MultiTimelineViewProps {
  className?: string;
  onFactClick?: (fact: Fact) => void;
}

export function MultiTimelineView({ className, onFactClick }: MultiTimelineViewProps) {
  const lanes = useMultiTimelineStore(selectVisibleLanes);
  const activeLaneId = useMultiTimelineStore((s) => s.activeLaneId);
  const setActiveLane = useMultiTimelineStore((s) => s.setActiveLane);
  const isScrollSynced = useMultiTimelineStore((s) => s.isScrollSynced);
  const direction = useMultiTimelineStore((s) => s.direction);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const filteredLanes = useFilteredLanes(lanes);
  const timeRange = useCommonTimeRange(filteredLanes);
  const correlations = useCorrelations(filteredLanes);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        console.error('Fullscreen not supported');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Sync scroll between lanes
  const handleScroll = useCallback((sourceLaneId: string, scrollTop: number) => {
    if (!isScrollSynced || isScrolling.current) return;
    
    isScrolling.current = true;
    
    scrollRefs.current.forEach((element, laneId) => {
      if (laneId !== sourceLaneId && element) {
        element.scrollTop = scrollTop;
      }
    });
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
    }, 50);
  }, [isScrollSynced]);
  
  // Set scroll ref for a lane
  const setScrollRef = useCallback((laneId: string): React.RefCallback<HTMLDivElement> => (el) => {
    if (!el) {
      scrollRefs.current.delete(laneId);
      return;
    }
    scrollRefs.current.set(laneId, el);
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollRefs.current.clear();
    };
  }, []);
  
  // Mobile layout (stacked)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (filteredLanes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-96 bg-gray-900 rounded-xl', className)}>
        <p className="text-gray-500">Aucune lane configurée</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative h-full bg-gray-950 rounded-xl border border-gray-800 overflow-hidden min-h-0',
        isFullscreen && 'fixed inset-0 z-[9999] rounded-none',
        direction === 'horizontal' ? 'flex' : 'flex flex-col',
        className
      )}
    >
      {/* Header with fullscreen button */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <FullscreenButton 
          isFullscreen={isFullscreen} 
          onToggle={toggleFullscreen} 
        />
      </div>
      
      {/* Lane grid */}
      <div 
        className={cn(
          'flex-1 h-full min-h-0 grid',
          direction === 'horizontal' 
            ? 'grid-flow-col auto-cols-fr'
            : 'grid-flow-row auto-rows-fr'
        )}
        style={{
          gridTemplateColumns: direction === 'horizontal' 
            ? `repeat(${filteredLanes.length}, minmax(280px, 1fr))`
            : undefined,
        }}
      >
        {filteredLanes.map((filteredLane) => (
          <TimelineLaneView
            key={filteredLane.lane.id}
            filteredLane={filteredLane}
            timeRange={timeRange}
            isActive={activeLaneId === filteredLane.lane.id}
            onActivate={() => setActiveLane(filteredLane.lane.id)}
            onFactClick={onFactClick}
            onScroll={(scrollTop) => handleScroll(filteredLane.lane.id, scrollTop)}
            scrollRef={setScrollRef(filteredLane.lane.id)}
          />
        ))}
      </div>
      
      {/* Correlation overlay */}
      <CorrelationLines
        correlations={correlations}
        filteredLanes={filteredLanes}
        containerRef={containerRef}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg p-3 shadow-lg">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Lanes</h4>
        <div className="space-y-1.5">
          {filteredLanes.map(({ lane }) => (
            <div key={lane.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: lane.color }}
              />
              <span className="text-xs text-gray-300 truncate max-w-[120px]">{lane.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MultiTimelineView;
