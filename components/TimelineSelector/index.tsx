'use client';

import { useState } from 'react';
import { timelines } from '@/lib/data';
import { useTimelineStore } from '@/store/timelineStore';
import { ChevronDown, Check, ArrowRightLeft } from 'lucide-react';

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
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                    <Check size={16} className="text-indigo-400" />
                  )
                ) : (
                  currentTimelineId === timeline.id && <Check size={16} className="text-indigo-400" />
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
