import { Fact } from '@/types';

// Import AI Evolution facts (15 faits)
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

// Import Epstein facts (60 faits) - Phase 1: Origines (1990-2005)
import ep001 from '@/facts/epstein/epstein-001.json';
import ep002 from '@/facts/epstein/epstein-002.json';
import ep003 from '@/facts/epstein/epstein-003.json';
import ep004 from '@/facts/epstein/epstein-004.json';
import ep005 from '@/facts/epstein/epstein-005.json';
import ep006 from '@/facts/epstein/epstein-006.json';
import ep007 from '@/facts/epstein/epstein-007.json';
import ep008 from '@/facts/epstein/epstein-008.json';
import ep009 from '@/facts/epstein/epstein-009.json';
import ep010 from '@/facts/epstein/epstein-010.json';

// Phase 2: Enquête & Cover-up (2005-2008)
import ep011 from '@/facts/epstein/epstein-011.json';
import ep012 from '@/facts/epstein/epstein-012.json';
import ep013 from '@/facts/epstein/epstein-013.json';
import ep014 from '@/facts/epstein/epstein-014.json';
import ep015 from '@/facts/epstein/epstein-015.json';
import ep016 from '@/facts/epstein/epstein-016.json';
import ep017 from '@/facts/epstein/epstein-017.json';
import ep018 from '@/facts/epstein/epstein-018.json';
import ep019 from '@/facts/epstein/epstein-019.json';
import ep020 from '@/facts/epstein/epstein-020.json';
import ep021 from '@/facts/epstein/epstein-021.json';
import ep022 from '@/facts/epstein/epstein-022.json';
import ep023 from '@/facts/epstein/epstein-023.json';
import ep024 from '@/facts/epstein/epstein-024.json';
import ep025 from '@/facts/epstein/epstein-025.json';
import ep026 from '@/facts/epstein/epstein-026.json';

// Phase 3: Décennie de silence (2008-2018)
import ep027 from '@/facts/epstein/epstein-027.json';
import ep028 from '@/facts/epstein/epstein-028.json';
import ep029 from '@/facts/epstein/epstein-029.json';
import ep030 from '@/facts/epstein/epstein-030.json';
import ep031 from '@/facts/epstein/epstein-031.json';
import ep032 from '@/facts/epstein/epstein-032.json';
import ep033 from '@/facts/epstein/epstein-033.json';
import ep034 from '@/facts/epstein/epstein-034.json';
import ep035 from '@/facts/epstein/epstein-035.json';
import ep036 from '@/facts/epstein/epstein-036.json';
import ep037 from '@/facts/epstein/epstein-037.json';
import ep038 from '@/facts/epstein/epstein-038.json';
import ep039 from '@/facts/epstein/epstein-039.json';
import ep040 from '@/facts/epstein/epstein-040.json';

// Phase 4: L'explosion (2018-2019)
import ep041 from '@/facts/epstein/epstein-041.json';
import ep042 from '@/facts/epstein/epstein-042.json';
import ep043 from '@/facts/epstein/epstein-043.json';
import ep044 from '@/facts/epstein/epstein-044.json';
import ep045 from '@/facts/epstein/epstein-045.json';
import ep046 from '@/facts/epstein/epstein-046.json';
import ep047 from '@/facts/epstein/epstein-047.json';
import ep048 from '@/facts/epstein/epstein-048.json';
import ep049 from '@/facts/epstein/epstein-049.json';
import ep050 from '@/facts/epstein/epstein-050.json';

// Phase 5: Après Epstein (2020-2025)
import ep051 from '@/facts/epstein/epstein-051.json';
import ep052 from '@/facts/epstein/epstein-052.json';
import ep053 from '@/facts/epstein/epstein-053.json';
import ep054 from '@/facts/epstein/epstein-054.json';
import ep055 from '@/facts/epstein/epstein-055.json';
import ep056 from '@/facts/epstein/epstein-056.json';
import ep057 from '@/facts/epstein/epstein-057.json';
import ep058 from '@/facts/epstein/epstein-058.json';
import ep059 from '@/facts/epstein/epstein-059.json';
import ep060 from '@/facts/epstein/epstein-060.json';

/**
 * Configuration des timelines disponibles
 */
export const timelines = {
  'ai-evolution': {
    id: 'ai-evolution',
    name: 'Évolution de l\'IA Générative',
    description: 'De GPT-1 (2018) aux agents autonomes (2025)',
    color: '#6366f1',
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
    description: '60 faits, 35 ans d\'histoire, 13 ans de silence médiatique',
    color: '#ef4444',
    facts: [
      // Phase 1: Origines
      ep001, ep002, ep003, ep004, ep005, ep006, ep007, ep008, ep009, ep010,
      // Phase 2: Enquête & Cover-up
      ep011, ep012, ep013, ep014, ep015, ep016, ep017, ep018, ep019, ep020,
      ep021, ep022, ep023, ep024, ep025, ep026,
      // Phase 3: Décennie de silence
      ep027, ep028, ep029, ep030, ep031, ep032, ep033, ep034, ep035, ep036,
      ep037, ep038, ep039, ep040,
      // Phase 4: L'explosion
      ep041, ep042, ep043, ep044, ep045, ep046, ep047, ep048, ep049, ep050,
      // Phase 5: Après Epstein
      ep051, ep052, ep053, ep054, ep055, ep056, ep057, ep058, ep059, ep060,
    ] as Fact[],
    categories: [
      { id: 'justice', name: 'Justice', color: 'bg-blue-500' },
      { id: 'coverup', name: 'Camouflage', color: 'bg-red-500' },
      { id: 'network', name: 'Réseau', color: 'bg-purple-500' },
      { id: 'victims', name: 'Victimes', color: 'bg-orange-500' },
      { id: 'media', name: 'Médias', color: 'bg-green-500' },
      { id: 'finance', name: 'Finance', color: 'bg-yellow-500' },
    ],
  },
};

export type TimelineId = keyof typeof timelines;

export function getTimeline(id: TimelineId) {
  return timelines[id];
}

export function getAvailableTimelines() {
  return Object.values(timelines);
}

// Backwards compatibility
export const facts = timelines['ai-evolution'].facts;
export const categories = timelines['ai-evolution'].categories;
export const demoFacts = facts;
export const demoCategories = categories;
