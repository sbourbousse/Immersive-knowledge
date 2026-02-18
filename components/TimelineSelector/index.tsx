'use client';

import { useState } from 'react';
import { timelines } from '@/lib/data';
import { useTimelineStore } from '@/store/timelineStore';

// Simple inline icons since lucide-react types are problematic
const ChevronDown = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const Check = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const ArrowRightLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3 4 7l4 4M4 7h16M20 17l-4 4M20 17H4"/>
  </svg>
);

export function TimelineSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTimelineId, setTimeline, isComparisonMode, comparedTimelines, toggleTimelineComparison } = useTimelineStore();
  
  const currentTimeline = timelines[currentTimelineId];
  const allTimelines = Object.values(timelines);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-ui-surface border border-gray-700 rounded-lg hover:border-indigo-500 transition-colors"
      >
        <span className="font-medium">{currentTimeline.name}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-ui-surface border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="p-3 border-b border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Sélectionner une timeline</p>
            </div>
            
            {allTimelines.map((timeline) => (
              <button
                key={timeline.id}
                onClick={() => {
                  if (isComparisonMode) {
                    toggleTimelineComparison(timeline.id as keyof typeof timelines);
                  } else {
                    setTimeline(timeline.id as keyof typeof timelines);
                    setIsOpen(false);
                  }
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors ${
                  currentTimelineId === timeline.id ? 'bg-indigo-900/20' : ''
                }`}
              >
                <div className="text-left">
                  <p className="font-medium">{timeline.name}</p>
                  <p className="text-sm text-gray-500">{timeline.description}</p>
                </div>
                {isComparisonMode ? (
                  comparedTimelines.includes(timeline.id as keyof typeof timelines) && (
                    <span className="text-indigo-400">✓</span>
                  )
                ) : (
                  currentTimelineId === timeline.id && <span className="text-indigo-400">✓</span>
                )}
              </button>
            ))}

            <div className="p-3 border-t border-gray-800">
              <button
                onClick={() => {
                  useTimelineStore.getState().toggleComparisonMode();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <ArrowRightLeft size={16} />
                Mode Comparaison
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
