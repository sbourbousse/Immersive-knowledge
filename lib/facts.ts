/**
 * Utilitaires de chargement et validation des faits
 * Wrapper autour du nouveau système multi-timeline
 */

import { validateFact, formatZodErrors } from '@/schemas/factSchema';
import { Fact, TimelineId } from '@/types';
import { timelines, getTimeline, getAvailableTimelines } from './data';

export { getTimeline, getAvailableTimelines };

/**
 * Charge les faits pour une timeline spécifique
 */
export function loadFactsForTimeline(id: TimelineId): Fact[] {
  return timelines[id]?.facts || [];
}

/**
 * Charge une timeline complète
 */
export function loadTimeline(id: TimelineId) {
  return getTimeline(id);
}

/**
 * Charge toutes les timelines
 */
export function loadAllTimelines() {
  return getAvailableTimelines();
}

/**
 * @deprecated Utiliser loadFactsForTimeline() à la place
 * Charge et valide les faits depuis les fichiers JSON
 */
export async function loadFacts(): Promise<Fact[]> {
  return loadFactsForTimeline('ai-evolution');
}

/**
 * Sauvegarde un fait (côté serveur uniquement)
 */
export async function saveFact(fact: Fact): Promise<boolean> {
  const result = validateFact(fact);
  
  if (!result.success) {
    console.error('Invalid fact:', formatZodErrors(result.errors));
    return false;
  }
  
  console.log('Saving fact:', fact.id);
  return true;
}

/**
 * Filtre les faits par tags
 */
export function filterFactsByTags(facts: Fact[], tags: string[]): Fact[] {
  if (tags.length === 0) return facts;
  return facts.filter(fact => 
    tags.some(tag => fact.tags?.includes(tag))
  );
}

/**
 * Filtre les faits par couverture médiatique
 */
export function filterFactsByCoverage(
  facts: Fact[],
  showOnlyWithCoverage: boolean | null
): Fact[] {
  if (showOnlyWithCoverage === null) return facts;
  
  return facts.filter(fact => {
    const hasCoverage = fact.metadata?.mediaCoverageDate !== undefined ||
                       fact.tags?.some(t => t.startsWith('coverage:'));
    return showOnlyWithCoverage ? hasCoverage : !hasCoverage;
  });
}

/**
 * Calcule l'écart temporel entre un événement et sa couverture médiatique
 */
export function getCoverageGap(fact: Fact): number | null {
  if (!fact.metadata?.mediaCoverageDate) return null;
  return fact.metadata.mediaCoverageDate - fact.timestamp;
}

/**
 * Formate un écart temporel en texte lisible
 */
export function formatTimeGap(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} an${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} mois`;
  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  return 'immédiat';
}
