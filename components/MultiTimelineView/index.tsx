'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  useMultiTimelineStore, 
  selectVisibleLanes,
  LaneConfig,
} from '@/store/multiTimelineStore';
import { 
  useFilteredLanes, 
  useCommonTimeRange, 
  useCorrelations,
  FilteredLane,
} from '@/hooks/useLaneFilters';
import { Fact } from '@/types';

// ============================================================================
// TIMELINE LANE VIEW
// ============================================================================

interface TimelineLaneViewProps {
  filteredLane: FilteredLane;
  timeRange: { start: number; end: number };
  isActive: boolean;
  onActivate: () => void;
  onFactClick?: (fact: Fact) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

function TimelineLaneView({
  filteredLane,
  timeRange,
  isActive,
  onActivate,
  onFactClick,
  scrollRef,
}: TimelineLaneViewProps) {
  const { lane, facts } = filteredLane;
  const { start, end } = timeRange;
  const duration = end - start || 1;
  
  return (
    <div
      className={cn(
        'flex flex-col h-full border-r border-gray-800 last:border-r-0',
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
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Timeline track */}
        <div className="relative min-h-full py-8">
          {/* Center line */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800"
            style={{ backgroundColor: `${lane.color}30` }}
          />
          
          {/* Facts */}
          {facts.map((fact, index) => {
            const position = ((fact.timestamp - start) / duration) * 100;
            const isEven = index % 2 === 0;
            
            return (
              <FactNode
                key={fact.id}
                fact={fact}
                position={position}
                isEven={isEven}
                laneColor={lane.color}
                onClick={() => onFactClick?.(fact)}
              />
            );
          })}
          
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
  position: number;
  isEven: boolean;
  laneColor: string;
  onClick?: () => void;
}

function FactNode({ fact, position, isEven, laneColor, onClick }: FactNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Clamp position between 0 and 100
  const clampedPosition = Math.max(0, Math.min(100, position));
  
  return (
    <div
      className="absolute left-0 right-0 px-4"
      style={{ top: `${clampedPosition}%`, transform: 'translateY(-50%)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          'flex items-center gap-3',
          isEven ? 'flex-row' : 'flex-row-reverse'
        )}
      >
        {/* Content card */}
        <div 
          className={cn(
            'flex-1 max-w-[45%] p-3 rounded-lg cursor-pointer transition-all duration-200',
            'bg-gray-900 border border-gray-800 hover:border-gray-600',
            isHovered && 'shadow-lg scale-105'
          )}
          style={{ 
            borderLeftColor: isEven ? laneColor : undefined,
            borderRightColor: !isEven ? laneColor : undefined,
            borderLeftWidth: isEven ? '3px' : undefined,
            borderRightWidth: !isEven ? '3px' : undefined,
          }}
          onClick={onClick}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{fact.dateLabel}</span>
            {fact.metadata?.verificationStatus === 'confirmed' && (
              <span className="w-2 h-2 rounded-full bg-green-500" title="Confirmé" />
            )}
          </div>
          <h4 className="text-sm font-medium text-white line-clamp-2">{fact.title}</h4>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1">{fact.content}</p>
        </div>
        
        {/* Node dot */}
        <div 
          className={cn(
            'w-3 h-3 rounded-full border-2 border-gray-950 flex-shrink-0 transition-transform',
            isHovered && 'scale-150'
          )}
          style={{ backgroundColor: laneColor }}
        />
        
        {/* Spacer for alignment */}
        <div className="flex-1 max-w-[45%]" />
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
  
  const filteredLanes = useFilteredLanes(lanes);
  const timeRange = useCommonTimeRange(filteredLanes);
  const correlations = useCorrelations(filteredLanes);
  
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
  const setScrollRef = useCallback((laneId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      scrollRefs.current.set(laneId, el);
      el.addEventListener('scroll', () => {
        handleScroll(laneId, el.scrollTop);
      }, { passive: true });
    }
  }, [handleScroll]);
  
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
        'relative bg-gray-950 rounded-xl border border-gray-800 overflow-hidden',
        direction === 'horizontal' ? 'flex' : 'flex flex-col',
        className
      )}
    >
      {/* Lane grid */}
      <div 
        className={cn(
          'flex-1 grid',
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
            scrollRef={{ current: scrollRefs.current.get(filteredLane.lane.id) || null } as React.RefObject<HTMLDivElement>}
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
