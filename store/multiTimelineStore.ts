/**
 * Store Zustand pour la gestion du système de lanes multi-timeline
 * Architecture modulaire avec filtres par tags inclus/exclus
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Fact, TimelineId } from '@/types';
import { timelines } from '@/lib/data';

// ============================================================================
// TYPES
// ============================================================================

export type LaneColor = 
  | '#ef4444' | '#f97316' | '#f59e0b' | '#84cc16' 
  | '#22c55e' | '#10b981' | '#06b6d4' | '#0ea5e9'
  | '#3b82f6' | '#6366f1' | '#8b5cf6' | '#a855f7'
  | '#d946ef' | '#ec4899' | '#f43f5e' | '#64748b';

export const LANE_COLORS: LaneColor[] = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

export interface LaneConfig {
  id: string;
  name: string;
  color: LaneColor;
  timelineId: TimelineId;
  includedTags: string[];
  excludedTags: string[];
  isVisible: boolean;
}

export type FilterMode = 'include' | 'exclude';

export interface TagFilterState {
  tag: string;
  mode: FilterMode;
}

export interface MultiTimelineState {
  // Lanes
  lanes: LaneConfig[];
  activeLaneId: string | null;
  maxLanes: number;
  
  // View settings
  direction: 'horizontal' | 'vertical';
  isComparisonMode: boolean;
  comparedTimelines: TimelineId[];
  
  // Legacy filters (pour compatibilité)
  activeTags: string[];
  showOnlyMediaCovered: boolean | null;
  
  // Multi-lane filters
  tagFilterMode: 'legacy' | 'advanced';
  
  // Sync settings
  isScrollSynced: boolean;
  showCorrelations: boolean;
}

export interface MultiTimelineActions {
  // Lane management
  addLane: (timelineId: TimelineId) => string;
  removeLane: (laneId: string) => void;
  updateLane: (laneId: string, updates: Partial<LaneConfig>) => void;
  setActiveLane: (laneId: string | null) => void;
  reorderLanes: (laneIds: string[]) => void;
  duplicateLane: (laneId: string) => string;
  resetLanes: () => void;
  
  // Tag filtering per lane
  addTagToLane: (laneId: string, tag: string, mode: FilterMode) => void;
  removeTagFromLane: (laneId: string, tag: string) => void;
  setLaneTags: (laneId: string, included: string[], excluded: string[]) => void;
  
  // Legacy actions
  setTimeline: (id: TimelineId) => void;
  setSelectedFact: (fact: Fact | null) => void;
  setDirection: (dir: 'horizontal' | 'vertical') => void;
  toggleComparisonMode: () => void;
  toggleTimelineComparison: (id: TimelineId) => void;
  setActiveTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setShowOnlyMediaCovered: (value: boolean | null) => void;
  
  // View settings
  setTagFilterMode: (mode: 'legacy' | 'advanced') => void;
  toggleScrollSync: () => void;
  toggleCorrelations: () => void;
  
  // Export/Import
  exportLaneConfig: () => string;
  importLaneConfig: (json: string) => boolean;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const generateLaneId = (): string => `lane-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getRandomColor = (): LaneColor => 
  LANE_COLORS[Math.floor(Math.random() * LANE_COLORS.length)];

const createDefaultLane = (timelineId: TimelineId, name?: string): LaneConfig => ({
  id: generateLaneId(),
  name: name || `Lane ${timelineId}`,
  color: getRandomColor(),
  timelineId,
  includedTags: [],
  excludedTags: [],
  isVisible: true,
});

// ============================================================================
// STORE
// ============================================================================

export const useMultiTimelineStore = create<MultiTimelineState & MultiTimelineActions>()(
  persist(
    (set, get) => ({
      // Initial state
      lanes: [createDefaultLane('ai-evolution', 'AI Evolution')],
      activeLaneId: null,
      maxLanes: 4,
      direction: 'horizontal',
      isComparisonMode: false,
      comparedTimelines: [],
      activeTags: [],
      showOnlyMediaCovered: null,
      tagFilterMode: 'legacy',
      isScrollSynced: true,
      showCorrelations: true,
      
      // Lane management
      addLane: (timelineId) => {
        const { lanes, maxLanes } = get();
        if (lanes.length >= maxLanes) {
          console.warn(`Maximum ${maxLanes} lanes allowed`);
          return lanes[lanes.length - 1]?.id || '';
        }
        
        const newLane = createDefaultLane(timelineId);
        set({ lanes: [...lanes, newLane] });
        return newLane.id;
      },
      
      removeLane: (laneId) => {
        const { lanes } = get();
        if (lanes.length <= 1) {
          console.warn('Cannot remove last lane');
          return;
        }
        set({ 
          lanes: lanes.filter(l => l.id !== laneId),
          activeLaneId: get().activeLaneId === laneId ? null : get().activeLaneId,
        });
      },
      
      updateLane: (laneId, updates) => {
        const { lanes } = get();
        set({
          lanes: lanes.map(lane =>
            lane.id === laneId ? { ...lane, ...updates } : lane
          ),
        });
      },
      
      setActiveLane: (laneId) => set({ activeLaneId: laneId }),
      
      reorderLanes: (laneIds) => {
        const { lanes } = get();
        const orderedLanes = laneIds
          .map(id => lanes.find(l => l.id === id))
          .filter(Boolean) as LaneConfig[];
        set({ lanes: orderedLanes });
      },
      
      duplicateLane: (laneId) => {
        const { lanes, maxLanes } = get();
        if (lanes.length >= maxLanes) {
          console.warn(`Maximum ${maxLanes} lanes allowed`);
          return lanes[lanes.length - 1]?.id || '';
        }
        
        const sourceLane = lanes.find(l => l.id === laneId);
        if (!sourceLane) return '';
        
        const newLane: LaneConfig = {
          ...sourceLane,
          id: generateLaneId(),
          name: `${sourceLane.name} (copy)`,
          color: getRandomColor(),
        };
        
        set({ lanes: [...lanes, newLane] });
        return newLane.id;
      },
      
      resetLanes: () => set({ 
        lanes: [createDefaultLane('ai-evolution', 'AI Evolution')],
        activeLaneId: null,
      }),
      
      // Tag filtering per lane
      addTagToLane: (laneId, tag, mode) => {
        const { lanes } = get();
        set({
          lanes: lanes.map(lane => {
            if (lane.id !== laneId) return lane;
            
            if (mode === 'include') {
              return {
                ...lane,
                includedTags: [...new Set([...lane.includedTags, tag])],
                excludedTags: lane.excludedTags.filter(t => t !== tag),
              };
            } else {
              return {
                ...lane,
                excludedTags: [...new Set([...lane.excludedTags, tag])],
                includedTags: lane.includedTags.filter(t => t !== tag),
              };
            }
          }),
        });
      },
      
      removeTagFromLane: (laneId, tag) => {
        const { lanes } = get();
        set({
          lanes: lanes.map(lane =>
            lane.id === laneId
              ? {
                  ...lane,
                  includedTags: lane.includedTags.filter(t => t !== tag),
                  excludedTags: lane.excludedTags.filter(t => t !== tag),
                }
              : lane
          ),
        });
      },
      
      setLaneTags: (laneId, included, excluded) => {
        const { lanes } = get();
        set({
          lanes: lanes.map(lane =>
            lane.id === laneId
              ? { ...lane, includedTags: included, excludedTags: excluded }
              : lane
          ),
        });
      },
      
      // Legacy actions
      setTimeline: (id) => {
        const { lanes, tagFilterMode } = get();
        if (tagFilterMode === 'legacy' && lanes.length > 0) {
          // Update first lane's timeline
          set({
            lanes: lanes.map((lane, index) =>
              index === 0 ? { ...lane, timelineId: id } : lane
            ),
          });
        }
      },
      
      setSelectedFact: () => {}, // Legacy stub
      
      setDirection: (dir) => set({ direction: dir }),
      
      toggleComparisonMode: () => set((state) => ({
        isComparisonMode: !state.isComparisonMode,
        comparedTimelines: !state.isComparisonMode ? [state.lanes[0]?.timelineId].filter(Boolean) as TimelineId[] : [],
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
      
      // View settings
      setTagFilterMode: (mode) => set({ tagFilterMode: mode }),
      
      toggleScrollSync: () => set((state) => ({ isScrollSynced: !state.isScrollSynced })),
      
      toggleCorrelations: () => set((state) => ({ showCorrelations: !state.showCorrelations })),
      
      // Export/Import
      exportLaneConfig: () => {
        const { lanes, isScrollSynced, showCorrelations } = get();
        const config = {
          version: '1.0',
          lanes: lanes.map(l => ({
            name: l.name,
            color: l.color,
            timelineId: l.timelineId,
            includedTags: l.includedTags,
            excludedTags: l.excludedTags,
          })),
          settings: {
            isScrollSynced,
            showCorrelations,
          },
        };
        return JSON.stringify(config, null, 2);
      },
      
      importLaneConfig: (json) => {
        try {
          const config = JSON.parse(json);
          if (!config.lanes || !Array.isArray(config.lanes)) {
            throw new Error('Invalid config format');
          }
          
          const newLanes: LaneConfig[] = config.lanes.map((l: Partial<LaneConfig>) => ({
            id: generateLaneId(),
            name: l.name || 'Unnamed Lane',
            color: l.color || getRandomColor(),
            timelineId: l.timelineId || 'ai-evolution',
            includedTags: l.includedTags || [],
            excludedTags: l.excludedTags || [],
            isVisible: true,
          }));
          
          set({
            lanes: newLanes.slice(0, get().maxLanes),
            isScrollSynced: config.settings?.isScrollSynced ?? true,
            showCorrelations: config.settings?.showCorrelations ?? true,
            activeLaneId: null,
          });
          
          return true;
        } catch (error) {
          console.error('Failed to import lane config:', error);
          return false;
        }
      },
    }),
    {
      name: 'multi-timeline-store',
      partialize: (state) => ({
        lanes: state.lanes,
        direction: state.direction,
        isScrollSynced: state.isScrollSynced,
        showCorrelations: state.showCorrelations,
        tagFilterMode: state.tagFilterMode,
      }),
    }
  )
);

// ============================================================================
// SELECTORS (pour une meilleure performance)
// ============================================================================

export const selectLaneById = (state: MultiTimelineState & MultiTimelineActions, laneId: string) =>
  state.lanes.find(l => l.id === laneId);

export const selectVisibleLanes = (state: MultiTimelineState & MultiTimelineActions) =>
  state.lanes.filter(l => l.isVisible);

export const selectActiveLane = (state: MultiTimelineState & MultiTimelineActions) =>
  state.activeLaneId ? state.lanes.find(l => l.id === state.activeLaneId) : null;

export const selectLaneCount = (state: MultiTimelineState & MultiTimelineActions) =>
  state.lanes.length;

export const selectCanAddLane = (state: MultiTimelineState & MultiTimelineActions) =>
  state.lanes.length < state.maxLanes;
