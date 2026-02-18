'use client';

import { useTimelineStore } from '@/store/timelineStore';
import { TimelineSelector } from '@/components/TimelineSelector';

export function TimelineControls() {
  const { direction, setDirection, isComparisonMode, comparedTimelines } = useTimelineStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TimelineSelector />
          
          {/* Direction Toggle */}
          <div className="hidden sm:flex items-center bg-ui-surface border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setDirection('horizontal')}
              className={`px-3 py-2 text-sm transition-colors ${
                direction === 'horizontal' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800'
              }`}
            >
              ↔ Horizontal
            </button>
            <button
              onClick={() => setDirection('vertical')}
              className={`px-3 py-2 text-sm transition-colors ${
                direction === 'vertical' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800'
              }`}
            >
              ↕ Vertical
            </button>
          </div>
        </div>

        {isComparisonMode && (
          <div className="px-4 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg">
            <span className="text-sm text-indigo-300">
              Mode Comparaison: {comparedTimelines.length} timeline(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
