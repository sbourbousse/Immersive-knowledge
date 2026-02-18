import { Fact } from '@/types';

// Import AI Evolution facts
import ai001 from '@/facts/ai-evolution/001-gpt1-2018.json';
import ai002 from '@/facts/ai-evolution/002-gpt2-2019.json';
import ai003 from '@/facts/ai-evolution/003-gpt3-2020.json';
import ai004 from '@/facts/ai-evolution/004-chatgpt-2022.json';
import ai005 from '@/facts/ai-evolution/005-gpt4-2023.json';
import ai006 from '@/facts/ai-evolution/006-concurrence-2023.json';
import ai007 from '@/facts/ai-evolution/007-image-generation.json';
import ai008 from '@/facts/ai-evolution/008-eu-ai-act-2024.json';
import ai009 from '@/facts/ai-evolution/009-sora-2024.json';
import ai010 from '@/facts/ai-evolution/010-investissements.json';
import ai011 from '@/facts/ai-evolution/011-hollywood-strikes-2023.json';
import ai012 from '@/facts/ai-evolution/012-italy-ban-2023.json';
import ai013 from '@/facts/ai-evolution/013-llama2-2023.json';
import ai014 from '@/facts/ai-evolution/014-agents-autonomes.json';
import ai015 from '@/facts/ai-evolution/015-couts-computationnels.json';

// Epstein facts will be imported dynamically
// import ep001 from '@/facts/epstein/001-...json';

/**
 * Configuration des timelines disponibles
 */
export const timelines = {
  'ai-evolution': {
    id: 'ai-evolution',
    name: 'Évolution de l\'IA Générative',
    description: 'De GPT-1 (2018) aux agents autonomes (2025)',
    facts: [
      ai001, ai002, ai003, ai004, ai005, ai006, ai007, ai008, ai009, ai010,
      ai011, ai012, ai013, ai014, ai015,
    ] as Fact[],
    categories: [
      { id: 'technology', name: 'Technologie', color: 'bg-blue-500' },
      { id: 'economy', name: 'Économie', color: 'bg-green-500' },
      { id: 'regulation', name: 'Régulation', color: 'bg-red-500' },
      { id: 'society', name: 'Société', color: 'bg-purple-500' },
    ],
  },
  'epstein': {
    id: 'epstein',
    name: 'Affaire Epstein',
    description: 'La timeline de l\'affaire Epstein: réalité vs couverture médiatique',
    facts: [] as Fact[], // Will be populated by Research Digger
    categories: [
      { id: 'justice', name: 'Justice', color: 'bg-blue-500' },
      { id: 'coverup', name: 'Camouflage', color: 'bg-red-500' },
      { id: 'network', name: 'Réseau', color: 'bg-purple-500' },
      { id: 'victims', name: 'Victimes', color: 'bg-orange-500' },
      { id: 'media', name: 'Médias', color: 'bg-green-500' },
    ],
  },
};

export type TimelineId = keyof typeof timelines;

/**
 * Récupère une timeline par son ID
 */
export function getTimeline(id: TimelineId) {
  return timelines[id];
}

/**
 * Liste toutes les timelines disponibles
 */
export function getAvailableTimelines() {
  return Object.values(timelines);
}

// Backwards compatibility
export const facts = timelines['ai-evolution'].facts;
export const categories = timelines['ai-evolution'].categories;
export const demoFacts = facts;
export const demoCategories = categories;
