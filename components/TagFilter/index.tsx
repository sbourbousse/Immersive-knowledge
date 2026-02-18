'use client';

import { useMemo } from 'react';
import { getTagInfo, StandardTagKey, STANDARD_TAGS } from '@/types';
import { cn } from '@/lib/utils';

// Export du filtre avancé
export { AdvancedTagFilter } from './AdvancedTagFilter';

interface TagBadgeProps {
  tag: string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TagBadge({
  tag,
  size = 'md',
  showLabel = true,
  onClick,
  className,
}: TagBadgeProps) {
  const tagInfo = getTagInfo(tag);
  
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  if (!tagInfo) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-gray-800 text-gray-300',
          sizeClasses[size],
          onClick && 'cursor-pointer hover:bg-gray-700',
          className
        )}
        onClick={onClick}
      >
        {tag}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      style={{
        backgroundColor: `${tagInfo.color}20`,
        color: tagInfo.color,
      }}
      onClick={onClick}
      title={tag}
    >
      {showLabel && tagInfo.label}
    </span>
  );
}

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onReset: () => void;
  className?: string;
}

export function TagFilter({
  availableTags,
  selectedTags,
  onTagToggle,
  onReset,
  className,
}: TagFilterProps) {
  // Group tags by category
  const groupedTags = useMemo(() => {
    const groups: Record<string, { label: string; tags: string[] }> = {
      source: { label: 'Source', tags: [] },
      category: { label: 'Catégorie', tags: [] },
      coverage: { label: 'Couverture', tags: [] },
      custom: { label: 'Autres', tags: [] },
    };

    for (const tag of availableTags) {
      const info = getTagInfo(tag);
      const type = info?.type || 'custom';
      if (groups[type]) {
        groups[type].tags.push(tag);
      } else {
        groups.custom.tags.push(tag);
      }
    }

    return groups;
  }, [availableTags]);

  const hasFilters = selectedTags.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400">
          Filtres
        </h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tag groups */}
      <div className="space-y-4">
        {Object.entries(groupedTags).map(([type, group]) => {
          if (group.tags.length === 0) return null;

          return (
            <div key={type}>
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                {group.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const info = getTagInfo(tag);

                  return (
                    <button
                      key={tag}
                      onClick={() => onTagToggle(tag)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                        'transition-all duration-200 border',
                        isSelected
                          ? 'border-transparent text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? info?.color || '#6366f1'
                          : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {info?.label || tag}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active filters summary */}
      {hasFilters && (
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            {selectedTags.length} filtre{selectedTags.length > 1 ? 's' : ''} actif
            {selectedTags.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

interface MediaCoverageFilterProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  className?: string;
}

export function MediaCoverageFilter({
  value,
  onChange,
  className,
}: MediaCoverageFilterProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400">
        Couverture médiatique
      </h3>
      
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="media-coverage"
            checked={value === null}
            onChange={() => onChange(null)}
            className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Tous les faits
          </span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="media-coverage"
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Avec couverture médiatique uniquement
          </span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="media-coverage"
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            Sans couverture (censuré/ignoré)
          </span>
        </label>
      </div>
    </div>
  );
}
