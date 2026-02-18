import { create } from 'zustand';
import { Fact } from '@/types';
import { timelines, TimelineId } from '@/lib/data';

interface TimelineState {
  // Current selection
  currentTimelineId: TimelineId;
  selectedFact: Fact | null;
  
  // View settings
  direction: 'horizontal' | 'vertical';
  isComparisonMode: boolean;
  comparedTimelines: TimelineId[];
  
  // Filters
  activeTags: string[];
  showOnlyMediaCovered: boolean | null; // null = all, true = covered, false = not covered
  
  // Actions
  setTimeline: (id: TimelineId) => void;
  setSelectedFact: (fact: Fact | null) => void;
  setDirection: (dir: 'horizontal' | 'vertical') => void;
  toggleComparisonMode: () => void;
  toggleTimelineComparison: (id: TimelineId) => void;
  setActiveTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setShowOnlyMediaCovered: (value: boolean | null) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  // Initial state
  currentTimelineId: 'epstein',
  selectedFact: null,
  direction: 'vertical',
  isComparisonMode: false,
  comparedTimelines: [],
  activeTags: [],
  showOnlyMediaCovered: null,

  // Actions
  setTimeline: (id) => set({ currentTimelineId: id }),
  
  setSelectedFact: (fact) => set({ selectedFact: fact }),
  
  setDirection: (dir) => set({ direction: dir === 'horizontal' ? 'vertical' : dir }),
  
  toggleComparisonMode: () => set((state) => ({
    isComparisonMode: !state.isComparisonMode,
    comparedTimelines: !state.isComparisonMode ? [state.currentTimelineId] : [],
  })),
  
  toggleTimelineComparison: (id) => set((state) => {
    const isSelected = state.comparedTimelines.includes(id);
    if (isSelected) {
      return { comparedTimelines: state.comparedTimelines.filter(t => t !== id) };
    } else if (state.comparedTimelines.length < 4) {
      return { comparedTimelines: [...state.comparedTimelines, id] };
    }
    return state;
  }),
  
  setActiveTags: (tags) => set({ activeTags: tags }),
  
  toggleTag: (tag) => set((state) => ({
    activeTags: state.activeTags.includes(tag)
      ? state.activeTags.filter(t => t !== tag)
      : [...state.activeTags, tag],
  })),
  
  setShowOnlyMediaCovered: (value) => set({ showOnlyMediaCovered: value }),
}));
