'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Filter, 
  GitCompare, 
  Plus, 
  Minus, 
  X, 
  Search,
  Eye,
  BarChart3,
} from 'lucide-react';
import { 
  useMultiTimelineStore, 
  LaneConfig,
  FilterMode,
} from '@/store/multiTimelineStore';
import { useGroupedTags, useTagCounts } from '@/hooks/useLaneFilters';
import { getTagInfo, TagType, STANDARD_TAGS } from '@/types';
import { timelines, TimelineId } from '@/lib/data';

// ============================================================================
// TAG STATISTICS
// ============================================================================

interface TagStatsProps {
  timelineId: TimelineId;
  className?: string;
}

function TagStats({ timelineId, className }: TagStatsProps) {
  const tagCounts = useTagCounts(timelineId);
  const totalFacts = timelines[timelineId]?.facts.length || 0;
  
  const stats = useMemo(() => {
    const entries = Array.from(tagCounts.entries());
    return entries
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: Math.round((count / totalFacts) * 100),
        info: getTagInfo(tag),
      }))
      .sort((a, b) => b.count - a.count);
  }, [tagCounts, totalFacts]);
  
  if (stats.length === 0) return null;
  
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-medium text-gray-500 uppercase">Distribution des tags</h4>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {stats.slice(0, 15).map(({ tag, count, percentage, info }) => (
          <div key={tag} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: info?.color || '#6b7280' }}
              />
              <span className="text-xs text-gray-300 truncate">{info?.label || tag}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: info?.color || '#6b7280'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPARISON MODE
// ============================================================================

interface ComparisonModeProps {
  lanes: LaneConfig[];
  onApplyComparison: (lane1Id: string, lane2Id: string, tag1: string, tag2: string) => void;
  className?: string;
}

function ComparisonMode({ lanes, onApplyComparison, className }: ComparisonModeProps) {
  const [selectedLanes, setSelectedLanes] = useState<[string | null, string | null]>([null, null]);
  const [selectedTags, setSelectedTags] = useState<[string | null, string | null]>([null, null]);
  
  const availableLanes = lanes.filter(l => l.isVisible);
  
  const handleApply = () => {
    if (selectedLanes[0] && selectedLanes[1] && selectedTags[0] && selectedTags[1]) {
      onApplyComparison(selectedLanes[0], selectedLanes[1], selectedTags[0], selectedTags[1]);
    }
  };
  
  const canApply = selectedLanes[0] && selectedLanes[1] && selectedTags[0] && selectedTags[1];
  
  return (
    <div className={cn('p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl', className)}>
      <div className="flex items-center gap-2 mb-4">
        <GitCompare className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-indigo-300">Mode Comparaison</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Lane 1 */}
        <div className="space-y-3">
          <label className="text-xs text-gray-500">Lane A</label>
          <select
            value={selectedLanes[0] || ''}
            onChange={(e) => setSelectedLanes([e.target.value || null, selectedLanes[1]])}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="">Sélectionner...</option>
            {availableLanes.map(lane => (
              <option key={lane.id} value={lane.id}>{lane.name}</option>
            ))}
          </select>
          
          {selectedLanes[0] && (
            <TagSelectorForLane
              laneId={selectedLanes[0]}
              selectedTag={selectedTags[0]}
              onSelect={(tag) => setSelectedTags([tag, selectedTags[1]])}
            />
          )}
        </div>
        
        {/* Lane 2 */}
        <div className="space-y-3">
          <label className="text-xs text-gray-500">Lane B</label>
          <select
            value={selectedLanes[1] || ''}
            onChange={(e) => setSelectedLanes([selectedLanes[0], e.target.value || null])}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="">Sélectionner...</option>
            {availableLanes
              .filter(l => l.id !== selectedLanes[0])
              .map(lane => (
                <option key={lane.id} value={lane.id}>{lane.name}</option>
              ))}
          </select>
          
          {selectedLanes[1] && (
            <TagSelectorForLane
              laneId={selectedLanes[1]}
              selectedTag={selectedTags[1]}
              onSelect={(tag) => setSelectedTags([selectedTags[0], tag])}
            />
          )}
        </div>
      </div>
      
      <button
        onClick={handleApply}
        disabled={!canApply}
        className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm text-white transition-colors"
      >
        Appliquer la comparaison
      </button>
    </div>
  );
}

// ============================================================================
// TAG SELECTOR FOR LANE
// ============================================================================

interface TagSelectorForLaneProps {
  laneId: string;
  selectedTag: string | null;
  onSelect: (tag: string) => void;
}

function TagSelectorForLane({ laneId, selectedTag, onSelect }: TagSelectorForLaneProps) {
  const lanes = useMultiTimelineStore((s) => s.lanes);
  const lane = lanes.find(l => l.id === laneId);
  
  if (!lane) return null;
  
  const groupedTags = useGroupedTags(lane.timelineId);
  
  const allTags = [
    ...groupedTags.source,
    ...groupedTags.category,
    ...groupedTags.coverage,
    ...groupedTags.custom,
  ];
  
  return (
    <div className="flex flex-wrap gap-1">
      {allTags.slice(0, 10).map(tag => {
        const info = getTagInfo(tag);
        const isSelected = selectedTag === tag;
        
        return (
          <button
            key={tag}
            onClick={() => onSelect(tag)}
            className={cn(
              'px-2 py-1 rounded text-xs transition-colors',
              isSelected
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            {info?.label || tag}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// QUICK PRESETS
// ============================================================================

const COMPARISON_PRESETS = [
  {
    name: 'Justice vs Médias',
    description: 'Comparaison sources officielles vs couverture médiatique',
    config: {
      lane1: { includedTags: ['source:official', 'category:justice'] },
      lane2: { includedTags: ['source:media', 'coverage:mainstream'] },
    },
  },
  {
    name: 'Élite vs Victimes',
    description: 'Documents filtrés vs témoignages officiels',
    config: {
      lane1: { includedTags: ['category:elite', 'source:leak'] },
      lane2: { includedTags: ['category:victims', 'source:official'] },
    },
  },
  {
    name: 'Couverture médiatique',
    description: 'Comparaison des types de couverture',
    config: {
      lane1: { includedTags: ['coverage:suppressed', 'coverage:delayed'] },
      lane2: { includedTags: ['coverage:mainstream', 'coverage:independent'] },
    },
  },
];

interface QuickPresetsProps {
  onSelectPreset: (preset: typeof COMPARISON_PRESETS[0]) => void;
  className?: string;
}

function QuickPresets({ onSelectPreset, className }: QuickPresetsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-medium text-gray-500 uppercase">Configurations rapides</h4>
      <div className="space-y-2">
        {COMPARISON_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelectPreset(preset)}
            className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
          >
            <div className="font-medium text-sm text-gray-200">{preset.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface AdvancedTagFilterProps {
  className?: string;
}

export function AdvancedTagFilter({ className }: AdvancedTagFilterProps) {
  const lanes = useMultiTimelineStore((s) => s.lanes);
  const activeLaneId = useMultiTimelineStore((s) => s.activeLaneId);
  const setLaneTags = useMultiTimelineStore((s) => s.setLaneTags);
  const addLane = useMultiTimelineStore((s) => s.addLane);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState<'filter' | 'compare' | 'stats'>('filter');
  
  const activeLane = lanes.find(l => l.id === activeLaneId);
  
  // Get all unique tags from all timelines
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(timelines).forEach(timeline => {
      timeline.facts.forEach(fact => {
        fact.tags.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }, []);
  
  const filteredTags = useMemo(() => {
    if (!searchQuery) return allTags;
    const query = searchQuery.toLowerCase();
    return allTags.filter(tag => {
      const info = getTagInfo(tag);
      return tag.toLowerCase().includes(query) || 
             info?.label.toLowerCase().includes(query);
    });
  }, [allTags, searchQuery]);
  
  const groupedFilteredTags = useMemo(() => {
    const groups: Record<TagType, string[]> = {
      source: [],
      category: [],
      coverage: [],
      custom: [],
    };
    
    filteredTags.forEach(tag => {
      const info = getTagInfo(tag);
      groups[info?.type || 'custom'].push(tag);
    });
    
    return groups;
  }, [filteredTags]);
  
  const handleApplyComparison = (lane1Id: string, lane2Id: string, tag1: string, tag2: string) => {
    setLaneTags(lane1Id, [tag1], []);
    setLaneTags(lane2Id, [tag2], []);
  };
  
  const handleSelectPreset = (preset: typeof COMPARISON_PRESETS[0]) => {
    // Ensure we have 2 lanes
    let laneIds = lanes.filter(l => l.isVisible).map(l => l.id);
    
    while (laneIds.length < 2) {
      const newId = addLane('ai-evolution');
      laneIds.push(newId);
    }
    
    setLaneTags(laneIds[0], preset.config.lane1.includedTags, []);
    setLaneTags(laneIds[1], preset.config.lane2.includedTags, []);
  };
  
  return (
    <div className={cn('bg-gray-950 rounded-xl border border-gray-800', className)}>
      {/* Header with tabs */}
      <div className="flex items-center border-b border-gray-800">
        <button
          onClick={() => setActiveTab('filter')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'filter'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtres
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'compare'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <GitCompare className="w-4 h-4" />
          Comparer
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'stats'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Stats
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'filter' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un tag..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            {/* Tag groups */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(Object.keys(groupedFilteredTags) as TagType[]).map((type) => {
                const tags = groupedFilteredTags[type];
                if (tags.length === 0) return null;
                
                const typeLabels: Record<TagType, string> = {
                  source: 'Sources',
                  category: 'Catégories',
                  coverage: 'Couverture',
                  custom: 'Autres',
                };
                
                return (
                  <div key={type}>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      {typeLabels[type]} ({tags.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => {
                        const info = getTagInfo(tag);
                        const isIncluded = activeLane?.includedTags.includes(tag);
                        const isExcluded = activeLane?.excludedTags.includes(tag);
                        
                        return (
                          <TagFilterButton
                            key={tag}
                            tag={tag}
                            info={info}
                            mode={isIncluded ? 'include' : isExcluded ? 'exclude' : null}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <QuickPresets onSelectPreset={handleSelectPreset} />
            <ComparisonMode 
              lanes={lanes} 
              onApplyComparison={handleApplyComparison}
              className="mt-4"
            />
          </div>
        )}
        
        {activeTab === 'stats' && activeLane && (
          <TagStats timelineId={activeLane.timelineId} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TAG FILTER BUTTON
// ============================================================================

interface TagFilterButtonProps {
  tag: string;
  info: ReturnType<typeof getTagInfo>;
  mode: FilterMode | null;
}

function TagFilterButton({ tag, info, mode }: TagFilterButtonProps) {
  const activeLaneId = useMultiTimelineStore((s) => s.activeLaneId);
  const addTagToLane = useMultiTimelineStore((s) => s.addTagToLane);
  const removeTagFromLane = useMultiTimelineStore((s) => s.removeTagFromLane);
  
  if (!activeLaneId) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-800 text-gray-400"
        style={{ borderLeft: `2px solid ${info?.color || '#6b7280'}` }}
      >
        {info?.label || tag}
      </span>
    );
  }
  
  const handleClick = () => {
    if (mode) {
      removeTagFromLane(activeLaneId, tag);
    } else {
      addTagToLane(activeLaneId, tag, 'include');
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === 'exclude') {
      removeTagFromLane(activeLaneId, tag);
    } else {
      addTagToLane(activeLaneId, tag, 'exclude');
    }
  };
  
  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
        mode === 'include' && 'bg-green-500/20 text-green-300 ring-1 ring-green-500/50',
        mode === 'exclude' && 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50',
        !mode && 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      )}
      style={{ borderLeft: `2px solid ${info?.color || '#6b7280'}` }}
      title="Clic gauche: Inclure | Clic droit: Exclure"
    >
      {mode === 'include' && <Plus className="w-3 h-3" />}
      {mode === 'exclude' && <Minus className="w-3 h-3" />}
      {info?.label || tag}
    </button>
  );
}

export default AdvancedTagFilter;
