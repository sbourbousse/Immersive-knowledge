/**
 * Hook pour le filtrage réactif des faits par lane
 * Performance optimisée avec memoization
 */

import { useMemo } from 'react';
import { Fact, TimelineId } from '@/types';
import { timelines } from '@/lib/data';
import { LaneConfig } from '@/store/multiTimelineStore';

export interface FilteredLane {
  lane: LaneConfig;
  facts: Fact[];
  filteredCount: number;
  totalCount: number;
}

/**
 * Filtre les faits selon les critères d'une lane
 */
export function filterFactsForLane(
  facts: Fact[],
  includedTags: string[],
  excludedTags: string[],
  showOnlyMediaCovered: boolean | null = null
): Fact[] {
  return facts.filter(fact => {
    // Vérifier les tags exclus (si un tag exclu est présent, on filtre le fait)
    if (excludedTags.length > 0) {
      const hasExcludedTag = excludedTags.some(tag => fact.tags.includes(tag));
      if (hasExcludedTag) return false;
    }
    
    // Vérifier les tags inclus (si des tags sont définis, le fait doit en avoir au moins un)
    if (includedTags.length > 0) {
      const hasIncludedTag = includedTags.some(tag => fact.tags.includes(tag));
      if (!hasIncludedTag) return false;
    }
    
    // Filtre de couverture médiatique
    if (showOnlyMediaCovered !== null) {
      const hasCoverage = fact.metadata?.mediaCoverageDate !== undefined ||
                         fact.tags?.some(t => t.startsWith('coverage:'));
      if (showOnlyMediaCovered !== hasCoverage) return false;
    }
    
    return true;
  });
}

/**
 * Hook pour obtenir les faits filtrés d'une lane
 */
export function useFilteredFactsForLane(lane: LaneConfig): {
  facts: Fact[];
  filteredCount: number;
  totalCount: number;
} {
  return useMemo(() => {
    const allFacts = timelines[lane.timelineId]?.facts || [];
    const filtered = filterFactsForLane(
      allFacts,
      lane.includedTags,
      lane.excludedTags
    );
    
    return {
      facts: filtered,
      filteredCount: filtered.length,
      totalCount: allFacts.length,
    };
  }, [lane.timelineId, lane.includedTags, lane.excludedTags]);
}

/**
 * Hook pour obtenir les données filtrées de toutes les lanes visibles
 */
export function useFilteredLanes(lanes: LaneConfig[]): FilteredLane[] {
  return useMemo(() => {
    return lanes.map(lane => {
      const allFacts = timelines[lane.timelineId]?.facts || [];
      const filtered = filterFactsForLane(
        allFacts,
        lane.includedTags,
        lane.excludedTags
      );
      
      return {
        lane,
        facts: filtered,
        filteredCount: filtered.length,
        totalCount: allFacts.length,
      };
    });
  }, [lanes]);
}

/**
 * Calcule la plage temporelle commune entre toutes les lanes
 */
export function useCommonTimeRange(lanes: FilteredLane[]): {
  start: number;
  end: number;
  hasData: boolean;
} {
  return useMemo(() => {
    const allTimestamps: number[] = [];
    
    lanes.forEach(({ facts }) => {
      facts.forEach(fact => {
        allTimestamps.push(fact.timestamp);
        if (fact.metadata?.mediaCoverageDate) {
          allTimestamps.push(fact.metadata.mediaCoverageDate);
        }
      });
    });
    
    if (allTimestamps.length === 0) {
      return { start: 0, end: 0, hasData: false };
    }
    
    return {
      start: Math.min(...allTimestamps),
      end: Math.max(...allTimestamps),
      hasData: true,
    };
  }, [lanes]);
}

/**
 * Détecte les corrélations temporelles entre faits de différentes lanes
 */
export interface FactCorrelation {
  id: string;
  fact1Id: string;
  lane1Id: string;
  fact2Id: string;
  lane2Id: string;
  timeDelta: number;
  strength: number;
}

export function useCorrelations(
  lanes: FilteredLane[],
  maxDelta: number = 86400 * 30 // 30 jours par défaut
): FactCorrelation[] {
  return useMemo(() => {
    const correlations: FactCorrelation[] = [];
    
    for (let i = 0; i < lanes.length; i++) {
      for (let j = i + 1; j < lanes.length; j++) {
        const lane1 = lanes[i];
        const lane2 = lanes[j];
        
        lane1.facts.forEach(fact1 => {
          lane2.facts.forEach(fact2 => {
            const timeDelta = Math.abs(fact1.timestamp - fact2.timestamp);
            
            if (timeDelta <= maxDelta) {
              // Calculer la force de corrélation (1 = même moment, 0 = limite)
              const strength = 1 - (timeDelta / maxDelta);
              
              // Corrélation par cross-references
              const hasCrossRef = fact1.metadata?.crossReferences?.includes(fact2.id) ||
                                 fact2.metadata?.crossReferences?.includes(fact1.id);
              
              const finalStrength = hasCrossRef ? 1 : strength;
              
              correlations.push({
                id: `corr-${fact1.id}-${fact2.id}`,
                fact1Id: fact1.id,
                lane1Id: lane1.lane.id,
                fact2Id: fact2.id,
                lane2Id: lane2.lane.id,
                timeDelta,
                strength: finalStrength,
              });
            }
          });
        });
      }
    }
    
    // Trier par force décroissante
    return correlations.sort((a, b) => b.strength - a.strength);
  }, [lanes, maxDelta]);
}

/**
 * Compte les faits par tag pour une timeline
 */
export function useTagCounts(timelineId: TimelineId): Map<string, number> {
  return useMemo(() => {
    const facts = timelines[timelineId]?.facts || [];
    const counts = new Map<string, number>();
    
    facts.forEach(fact => {
      fact.tags.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    
    return counts;
  }, [timelineId]);
}

/**
 * Groupe les tags par type
 */
export function useGroupedTags(timelineId: TimelineId): {
  source: string[];
  category: string[];
  coverage: string[];
  custom: string[];
} {
  return useMemo(() => {
    const facts = timelines[timelineId]?.facts || [];
    const tags = new Set<string>();
    
    facts.forEach(fact => {
      fact.tags.forEach(tag => tags.add(tag));
    });
    
    const grouped = {
      source: [] as string[],
      category: [] as string[],
      coverage: [] as string[],
      custom: [] as string[],
    };
    
    tags.forEach(tag => {
      if (tag.startsWith('source:')) grouped.source.push(tag);
      else if (tag.startsWith('category:')) grouped.category.push(tag);
      else if (tag.startsWith('coverage:')) grouped.coverage.push(tag);
      else grouped.custom.push(tag);
    });
    
    return grouped;
  }, [timelineId]);
}
