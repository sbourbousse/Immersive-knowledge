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

// Import Epstein facts
import ep001 from '@/facts/epstein/001-first-complaint-2005.json';
import ep002 from '@/facts/epstein/002-first-arrest-2006.json';
import ep003 from '@/facts/epstein/003-npa-2008.json';
import ep004 from '@/facts/epstein/004-miami-herald-2019.json';
import ep005 from '@/facts/epstein/004-suicide.json';
import ep006 from '@/facts/epstein/005-maxwell-arrest.json';
import ep007 from '@/facts/epstein/006-flight-logs.json';
import ep008 from '@/facts/epstein/epstein-007.json';
import ep009 from '@/facts/epstein/epstein-008.json';
import ep010 from '@/facts/epstein/epstein-009.json';
import ep011 from '@/facts/epstein/epstein-010.json';
import ep012 from '@/facts/epstein/epstein-011.json';
import ep013 from '@/facts/epstein/epstein-012.json';
import ep014 from '@/facts/epstein/epstein-013.json';
import ep015 from '@/facts/epstein/epstein-014.json';

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
    description: 'La timeline de l\'affaire Epstein: 60+ faits, 30 ans d\'histoire',
    color: '#ef4444',
    facts: [
      ep008, ep009, ep010, ep011,  // 1991-2003
      ep012, ep013, ep014, ep015,  // 2005-2006
      ep001, ep002, ep003,         // 2005-2008
      ep004, ep005, ep006, ep007,  // 2019-2020
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

export const facts = timelines['ai-evolution'].facts;
export const categories = timelines['ai-evolution'].categories;
export const demoFacts = facts;
export const demoCategories = categories;
