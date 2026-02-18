import { create } from 'zustand';
import { Fact, TimelineId } from '@/types';
import { timelines } from '@/lib/data';

export interface LaneConfig {
  id: string;
  name: string;
  color: string;
  timelineId: TimelineId;
  includedTags: string[];
  excludedTags: string[];
}

interface MultiLaneState {
  // Lanes configuration
  lanes: LaneConfig[];
  isMultiLaneMode: boolean;
  
  // Actions
  addLane: (config: Omit<LaneConfig, 'id'>) => void;
  removeLane: (id: string) => void;
  updateLane: (id: string, updates: Partial<LaneConfig>) => void;
  toggleMultiLaneMode: () => void;
  resetLanes: () => void;
  
  // Filtering
  getFilteredFacts: (laneId: string) => Fact[];
}

const defaultLanes: LaneConfig[] = [
  {
    id: 'lane-1',
    name: 'Justice Officielle',
    color: '#3b82f6',
    timelineId: 'epstein',
    includedTags: ['source:official', 'category:justice'],
    excludedTags: [],
  },
  {
    id: 'lane-2',
    name: 'Couverture Médiatique',
    color: '#10b981',
    timelineId: 'epstein',
    includedTags: ['source:media', 'coverage:mainstream'],
    excludedTags: [],
  },
];

export const useMultiLaneStore = create<MultiLaneState>((set, get) => ({
  lanes: defaultLanes,
  isMultiLaneMode: false,

  addLane: (config) => {
    const lanes = get().lanes;
    if (lanes.length >= 4) return; // Max 4 lanes
    
    set({
      lanes: [...lanes, { ...config, id: `lane-${Date.now()}` }],
    });
  },

  removeLane: (id) => {
    set({
      lanes: get().lanes.filter((l) => l.id !== id),
    });
  },

  updateLane: (id, updates) => {
    set({
      lanes: get().lanes.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    });
  },

  toggleMultiLaneMode: () => {
    set({ isMultiLaneMode: !get().isMultiLaneMode });
  },

  resetLanes: () => {
    set({ lanes: defaultLanes });
  },

  getFilteredFacts: (laneId) => {
    const lane = get().lanes.find((l) => l.id === laneId);
    if (!lane) return [];

    const timeline = timelines[lane.timelineId];
    if (!timeline) return [];

    return timeline.facts.filter((fact) => {
      // Must include at least one included tag
      const hasIncludedTag =
        lane.includedTags.length === 0 ||
        lane.includedTags.some((tag) => fact.tags?.includes(tag));

      // Must not have any excluded tag
      const hasExcludedTag = lane.excludedTags.some((tag) =>
        fact.tags?.includes(tag)
      );

      return hasIncludedTag && !hasExcludedTag;
    });
  },
}));
