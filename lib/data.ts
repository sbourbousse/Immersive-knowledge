import { Fact } from '@/types';

// Import all fact files
import fact001 from '@/facts/001-gpt1-2018.json';
import fact002 from '@/facts/002-gpt2-2019.json';
import fact003 from '@/facts/003-gpt3-2020.json';
import fact004 from '@/facts/004-chatgpt-2022.json';
import fact005 from '@/facts/005-gpt4-2023.json';
import fact006 from '@/facts/006-concurrence-2023.json';
import fact007 from '@/facts/007-image-generation.json';
import fact008 from '@/facts/008-eu-ai-act-2024.json';
import fact009 from '@/facts/009-sora-2024.json';
import fact010 from '@/facts/010-investissements.json';
import fact011 from '@/facts/011-hollywood-strikes-2023.json';
import fact012 from '@/facts/012-italy-ban-2023.json';
import fact013 from '@/facts/013-llama2-2023.json';
import fact014 from '@/facts/014-agents-autonomes.json';
import fact015 from '@/facts/015-couts-computationnels.json';

/**
 * Tous les faits validés sur l'évolution de l'IA Générative
 */
export const facts: Fact[] = [
  fact001,
  fact002,
  fact003,
  fact004,
  fact005,
  fact006,
  fact007,
  fact008,
  fact009,
  fact010,
  fact011,
  fact012,
  fact013,
  fact014,
  fact015,
];

/**
 * Catégories disponibles avec leurs couleurs
 */
export const categories = [
  { id: 'technology', name: 'Technologie', color: 'bg-blue-500' },
  { id: 'economy', name: 'Économie', color: 'bg-green-500' },
  { id: 'regulation', name: 'Régulation', color: 'bg-red-500' },
  { id: 'society', name: 'Société', color: 'bg-purple-500' },
];

// Backwards compatibility
export const demoFacts = facts;
export const demoCategories = categories;
