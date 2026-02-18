'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Settings2, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  Palette,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useMultiTimelineStore, 
  LaneConfig, 
  LANE_COLORS,
  LaneColor,
  FilterMode,
} from '@/store/multiTimelineStore';
import { 
  useFilteredFactsForLane, 
  useGroupedTags,
  useTagCounts,
} from '@/hooks/useLaneFilters';
import { getTagInfo, TagType } from '@/types';
import { timelines, TimelineId } from '@/lib/data';

// ============================================================================
// COLOR PICKER
// ============================================================================

interface ColorPickerProps {
  value: LaneColor;
  onChange: (color: LaneColor) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {LANE_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={cn(
            'w-6 h-6 rounded-full transition-transform',
            value === color && 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
          )}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

// ============================================================================
// TAG SELECTOR
// ============================================================================

interface TagSelectorProps {
  timelineId: TimelineId;
  selectedTags: string[];
  mode: FilterMode;
  onTagToggle: (tag: string) => void;
  onModeChange: (mode: FilterMode) => void;
}

function TagSelector({ 
  timelineId, 
  selectedTags, 
  mode, 
  onTagToggle, 
  onModeChange 
}: TagSelectorProps) {
  const groupedTags = useGroupedTags(timelineId);
  const tagCounts = useTagCounts(timelineId);
  
  const tagGroups: { key: TagType; label: string; tags: string[] }[] = [
    { key: 'source', label: 'Source', tags: groupedTags.source },
    { key: 'category', label: 'Catégorie', tags: groupedTags.category },
    { key: 'coverage', label: 'Couverture', tags: groupedTags.coverage },
    { key: 'custom', label: 'Autres', tags: groupedTags.custom },
  ];
  
  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('include')}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'include'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Inclure
          </span>
        </button>
        <button
          onClick={() => onModeChange('exclude')}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'exclude'
              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            Exclure
          </span>
        </button>
      </div>
      
      {/* Tag groups */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {tagGroups.map(({ key, label, tags }) => {
          if (tags.length === 0) return null;
          
          return (
            <div key={key}>
              <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {label}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {tags.sort().map((tag) => {
                  const info = getTagInfo(tag);
                  const count = tagCounts.get(tag) || 0;
                  const isSelected = selectedTags.includes(tag);
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => onTagToggle(tag)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs',
                        'transition-all duration-150',
                        isSelected
                          ? mode === 'include'
                            ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/50'
                            : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      )}
                      title={`${count} fait${count > 1 ? 's' : ''}`}
                    >
                      {isSelected && (
                        mode === 'include' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )
                      )}
                      <span>{info?.label || tag}</span>
                      <span className="text-gray-500">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// LANE CARD
// ============================================================================

interface LaneCardProps {
  lane: LaneConfig;
  isActive: boolean;
  isEditing: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}

function LaneCard({
  lane,
  isActive,
  isEditing,
  onActivate,
  onEdit,
  onDuplicate,
  onRemove,
  onToggleVisibility,
}: LaneCardProps) {
  const { filteredCount, totalCount } = useFilteredFactsForLane(lane);
  const updateLane = useMultiTimelineStore((s) => s.updateLane);
  const addTagToLane = useMultiTimelineStore((s) => s.addTagToLane);
  const removeTagFromLane = useMultiTimelineStore((s) => s.removeTagFromLane);
  
  const [tagMode, setTagMode] = useState<FilterMode>('include');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleTagToggle = (tag: string) => {
    const isIncluded = lane.includedTags.includes(tag);
    const isExcluded = lane.excludedTags.includes(tag);
    
    if (isIncluded || isExcluded) {
      removeTagFromLane(lane.id, tag);
    } else {
      addTagToLane(lane.id, tag, tagMode);
    }
  };
  
  const hasFilters = lane.includedTags.length > 0 || lane.excludedTags.length > 0;
  
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        isActive
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-gray-800 bg-gray-900/50 hover:border-gray-700',
        !lane.isVisible && 'opacity-50'
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onActivate}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: lane.color }}
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{lane.name}</h3>
              <p className="text-sm text-gray-500">
                {timelines[lane.timelineId]?.name || lane.timelineId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
              title={lane.isVisible ? 'Masquer' : 'Afficher'}
            >
              {lane.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isEditing
                  ? 'text-indigo-400 bg-indigo-500/20'
                  : 'text-gray-500 hover:text-white hover:bg-gray-800'
              )}
              title="Configurer"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-medium">{filteredCount}</span>
            {' / '}
            <span className="text-gray-500">{totalCount}</span>
            {' faits'}
          </span>
          {hasFilters && (
            <span className="inline-flex items-center gap-1 text-xs text-indigo-400">
              <Filter className="w-3 h-3" />
              {lane.includedTags.length + lane.excludedTags.length} filtre(s)
            </span>
          )}
        </div>
      </div>
      
      {/* Edit panel */}
      {isEditing && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Nom de la lane
            </label>
            <input
              type="text"
              value={lane.name}
              onChange={(e) => updateLane(lane.id, { name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Nom de la lane"
            />
          </div>
          
          {/* Timeline selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Timeline
            </label>
            <select
              value={lane.timelineId}
              onChange={(e) => updateLane(lane.id, { timelineId: e.target.value as TimelineId })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(timelines).map(([id, timeline]) => (
                <option key={id} value={id}>{timeline.name}</option>
              ))}
            </select>
          </div>
          
          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Couleur
            </label>
            <ColorPicker
              value={lane.color}
              onChange={(color) => updateLane(lane.id, { color })}
            />
          </div>
          
          {/* Tag filters */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-300"
            >
              <span>Filtrer par tags</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="mt-3">
                <TagSelector
                  timelineId={lane.timelineId}
                  selectedTags={tagMode === 'include' ? lane.includedTags : lane.excludedTags}
                  mode={tagMode}
                  onTagToggle={handleTagToggle}
                  onModeChange={setTagMode}
                />
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={onDuplicate}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Dupliquer
            </button>
            <button
              onClick={onRemove}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface LaneBuilderProps {
  className?: string;
}

export function LaneBuilder({ className }: LaneBuilderProps) {
  const store = useMultiTimelineStore();
  const {
    lanes,
    activeLaneId,
    maxLanes,
    addLane,
    removeLane,
    setActiveLane,
    duplicateLane,
    updateLane,
    resetLanes,
    exportLaneConfig,
    importLaneConfig,
  } = store;
  const canAddLane = lanes.length < maxLanes;
  
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [configText, setConfigText] = useState('');
  
  const visibleLanes = lanes.filter(l => l.isVisible);
  
  const handleEdit = (laneId: string) => {
    setEditingLaneId(editingLaneId === laneId ? null : laneId);
  };
  
  const handleExport = () => {
    setConfigText(exportLaneConfig());
    setShowImportExport(true);
  };
  
  const handleImport = () => {
    const success = importLaneConfig(configText);
    if (success) {
      setShowImportExport(false);
      setConfigText('');
    } else {
      alert('Configuration invalide');
    }
  };
  
  return (
    <div className={cn('bg-gray-950 rounded-xl border border-gray-800', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">Configuration des Lanes</h2>
            <p className="text-sm text-gray-500">
              {lanes.length} / {maxLanes} lanes • {visibleLanes.length} visible(s)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportExport(!showImportExport)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Import/Export
            </button>
            {lanes.length > 1 && (
              <button
                onClick={resetLanes}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Import/Export panel */}
      {showImportExport && (
        <div className="p-4 border-b border-gray-800 bg-gray-900/30">
          <textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder="Collez une configuration JSON ici..."
            className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleExport}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors"
            >
              Exporter
            </button>
            <button
              onClick={handleImport}
              disabled={!configText.trim()}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
            >
              Importer
            </button>
          </div>
        </div>
      )}
      
      {/* Lanes list */}
      <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {lanes.map((lane) => (
          <LaneCard
            key={lane.id}
            lane={lane}
            isActive={activeLaneId === lane.id}
            isEditing={editingLaneId === lane.id}
            onActivate={() => setActiveLane(lane.id)}
            onEdit={() => handleEdit(lane.id)}
            onDuplicate={() => duplicateLane(lane.id)}
            onRemove={() => removeLane(lane.id)}
            onToggleVisibility={() => updateLane(lane.id, { isVisible: !lane.isVisible })}
          />
        ))}
      </div>
      
      {/* Add lane button */}
      {canAddLane && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => addLane('ai-evolution')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 hover:border-gray-500 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter une lane</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LaneBuilder;
