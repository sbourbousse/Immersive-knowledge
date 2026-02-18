'use client';

import { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { timelines, TimelineId } from '@/lib/data';

// Simple inline icons
const ChevronDown = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const Check = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);


interface TimelineSelectorProps {
  className?: string;
}

export function TimelineSelector({ className }: TimelineSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    currentTimelineId,
    isComparisonMode,
    comparedTimelines,
    setTimeline,
    toggleTimelineComparison,
    toggleComparisonMode,
  } = useTimelineStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTimeline = timelines[currentTimelineId];
  const allTimelines = Object.values(timelines).sort((a, b) => {
    if (a.id === 'epstein') return -1;
    if (b.id === 'epstein') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-ui-surface border border-gray-800 
          rounded-lg hover:border-gray-700 transition-all duration-200 min-w-[240px]"
      >
        <div className="flex -space-x-2">
          {isComparisonMode ? (
            comparedTimelines.slice(0, 3).map((id) => (
              <div
                key={id}
                className="w-6 h-6 rounded-full border-2 border-ui-surface"
                style={{ backgroundColor: timelines[id].color || '#6366f1' }}
              />
            ))
          ) : (
            <div
              className="w-6 h-6 rounded-full border-2 border-ui-surface"
              style={{ backgroundColor: currentTimeline.color || '#6366f1' }}
            />
          )}
          {isComparisonMode && comparedTimelines.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-ui-surface bg-gray-700 
              flex items-center justify-center text-[10px] font-medium">
              +{comparedTimelines.length - 3}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-left">
          <span className="text-sm font-medium">
            {isComparisonMode 
              ? `Mode Comparaison (${comparedTimelines.length})` 
              : currentTimeline.name}
          </span>
        </div>
        
        <ChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-ui-surface border border-gray-800 
          rounded-lg shadow-xl z-50 overflow-hidden">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="font-display font-bold text-sm">
              {isComparisonMode ? 'Comparer des timelines' : 'Sélectionner une timeline'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isComparisonMode ? 'Choisissez jusqu\'à 4 timelines' : 'Changez de sujet'}
            </p>
          </div>

          {/* Timeline list */}
          <div className="p-2 space-y-1 max-h-[240px] overflow-y-auto">
            {allTimelines.map((timeline) => {
              const isSelected = isComparisonMode 
                ? comparedTimelines.includes(timeline.id as TimelineId)
                : currentTimelineId === timeline.id;
              const canSelect = isComparisonMode 
                ? (isSelected || comparedTimelines.length < 4)
                : true;

              return (
                <button
                  key={timeline.id}
                  onClick={() => {
                    if (isComparisonMode) {
                      toggleTimelineComparison(timeline.id as TimelineId);
                    } else {
                      setTimeline(timeline.id as TimelineId);
                      setIsOpen(false);
                    }
                  }}
                  disabled={!canSelect && !isSelected}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                    ${isSelected 
                      ? 'bg-indigo-500/10 hover:bg-indigo-500/20' 
                      : canSelect 
                        ? 'hover:bg-gray-800' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: timeline.color || '#6366f1' }}
                  />
                  
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{timeline.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {timeline.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Comparison mode toggle */}
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
            <button
              onClick={() => {
                toggleComparisonMode();
                setIsOpen(false);
              }}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
                ${isComparisonMode 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isComparisonMode ? 'Quitter le mode comparaison' : 'Activer le mode comparaison'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
