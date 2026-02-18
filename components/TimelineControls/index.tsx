'use client';

import { useTimelineStore } from '@/store/timelineStore';
import { TimelineSelector } from '@/components/TimelineSelector';

export function TimelineControls() {
  const { isComparisonMode, comparedTimelines } = useTimelineStore();

  return (
    <div className="sticky top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TimelineSelector />
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
