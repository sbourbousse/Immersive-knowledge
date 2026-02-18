/**
 * Types de l'application - Architecture multi-timeline
 * Définit les structures de données pour les faits, timelines et comparaisons
 */

import type { CSSProperties } from 'react';

// ============================================================================
// TIMELINE IDS
// ============================================================================

/** IDs des timelines disponibles */
export type TimelineId = 'ai-evolution' | 'epstein';

// ============================================================================
// TAG SYSTEM
// ============================================================================

/** Types de tags supportés */
export type TagType = 'source' | 'category' | 'coverage' | 'custom';

/** Structure d'un tag */
export interface Tag {
  /** Valeur du tag (ex: "source:official", "category:elite") */
  value: string;
  /** Type de tag */
  type: TagType;
  /** Label affichable */
  label: string;
  /** Couleur associée */
  color?: string;
}

// ============================================================================
// AWARENESS & RELEVANCE HELPERS
// ============================================================================

export function getAwarenessOpacity(fact: Fact): number {
  if (!fact.publicAwareness) return 1;
  if (fact.publicAwareness.wasPublicAtTime) return 1;
  return 0.45 + (fact.publicAwareness.level / 100) * 0.4;
}

export function getAwarenessStyle(fact: Fact): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  if (!fact.publicAwareness) {
    return { label: 'Inconnu', badgeClass: 'bg-gray-700 text-gray-400', icon: '❓' };
  }
  const level = fact.publicAwareness.level;
  if (level <= 10) return { label: 'Secret', badgeClass: 'bg-purple-500/20 text-purple-400', icon: '🔒' };
  if (level <= 25) return { label: 'Cercle restreint', badgeClass: 'bg-violet-500/20 text-violet-400', icon: '👥' };
  if (level <= 50) return { label: 'Peu médiatisé', badgeClass: 'bg-amber-500/20 text-amber-400', icon: '📰' };
  if (level <= 75) return { label: 'Médiatisé', badgeClass: 'bg-blue-500/20 text-blue-400', icon: '📡' };
  return { label: 'Public', badgeClass: 'bg-emerald-500/20 text-emerald-400', icon: '🌍' };
}

export function getRelevanceIntensity(fact: Fact): {
  glowClass: string;
  borderClass: string;
  dotSize: string;
  label: string;
} {
  const score = fact.relevanceScore ?? 50;
  if (score >= 85) return {
    glowClass: 'shadow-lg shadow-red-500/20',
    borderClass: 'border-red-500/40',
    dotSize: 'w-4 h-4',
    label: 'Très captivant',
  };
  if (score >= 70) return {
    glowClass: 'shadow-md shadow-orange-500/15',
    borderClass: 'border-orange-500/30',
    dotSize: 'w-3.5 h-3.5',
    label: 'Captivant',
  };
  if (score >= 50) return {
    glowClass: '',
    borderClass: 'border-gray-700',
    dotSize: 'w-3 h-3',
    label: 'Notable',
  };
  return {
    glowClass: '',
    borderClass: 'border-gray-800',
    dotSize: 'w-2.5 h-2.5',
    label: 'Mineur',
  };
}

export function getRelevanceTextStyle(score: number | undefined): {
  className: string;
  style: CSSProperties;
} {
  const s = Math.max(0, Math.min(100, score ?? 50));
  // Scaling plus contrasté: les faits mineurs sont nettement plus petits.
  // Courbe douce (gamma) pour éviter que tout se ressemble au milieu.
  const min = 0.78;
  const max = 1.32;
  const t = Math.pow(s / 100, 1.35);
  const size = min + t * (max - min);
  const className = s >= 85 ? 'font-bold' : s >= 55 ? 'font-semibold' : 'font-medium';
  return {
    className,
    style: { fontSize: `${size.toFixed(3)}em` },
  };
}

/** Tags standards disponibles */
export const STANDARD_TAGS = {
  // Sources
  'source:official': { type: 'source' as const, label: 'Officiel', color: '#10b981' },
  'source:media': { type: 'source' as const, label: 'Média', color: '#3b82f6' },
  'source:leak': { type: 'source' as const, label: 'Fuite', color: '#f59e0b' },
  'source:court': { type: 'source' as const, label: 'Juridique', color: '#8b5cf6' },
  'source:witness': { type: 'source' as const, label: 'Témoin', color: '#06b6d4' },
  
  // Catégories
  'category:technology': { type: 'category' as const, label: 'Technologie', color: '#06b6d4' },
  'category:politics': { type: 'category' as const, label: 'Politique', color: '#ef4444' },
  'category:finance': { type: 'category' as const, label: 'Finance', color: '#22c55e' },
  'category:elite': { type: 'category' as const, label: 'Élite', color: '#f97316' },
  'category:justice': { type: 'category' as const, label: 'Justice', color: '#6366f1' },
  'category:society': { type: 'category' as const, label: 'Société', color: '#ec4899' },
  
  // Couverture médiatique
  'coverage:mainstream': { type: 'coverage' as const, label: 'Médias grand public', color: '#ec4899' },
  'coverage:independent': { type: 'coverage' as const, label: 'Média indépendant', color: '#84cc16' },
  'coverage:suppressed': { type: 'coverage' as const, label: 'Supprimé/Censuré', color: '#dc2626' },
  'coverage:delayed': { type: 'coverage' as const, label: 'Retardé', color: '#f97316' },
} as const;

/** Type pour les clés de tags standards */
export type StandardTagKey = keyof typeof STANDARD_TAGS;

// ============================================================================
// FACT (ATOME DE CONNAISSANCE)
// ============================================================================

export interface Fact {
  /** Identifiant unique universel du fait */
  id: string;
  
  /** Valeur temporelle Unix pour le positionnement sur l'axe X */
  timestamp: number;
  
  /** Libellé lisible de la date (ex: "Janvier 2024") */
  dateLabel: string;
  
  /** Titre concis de l'événement */
  title: string;
  
  /** Description détaillée enrichie en Markdown */
  content: string;
  
  /** @deprecated Utiliser `tags` à la place */
  categories?: string[];
  
  /** Tags pour le filtrage et le code couleur (nouveau système) */
  tags: string[];
  
  /** Métadonnées de la source */
  source: {
    /** Nom de la source */
    name: string;
    /** URL de la source */
    url: string;
    /** Score de fiabilité entre 0 et 1 */
    reliabilityScore: number;
    /** Date d'accès à la source (ISO 8601) */
    accessedAt: string;
  };

  /** Niveau de connaissance publique au moment des faits */
  publicAwareness?: {
    /** Le fait était-il connu du public au moment où il s'est produit ? */
    wasPublicAtTime: boolean;
    /** Niveau de connaissance publique (0 = secret total, 100 = largement médiatisé) */
    level: number;
    /** Description du contexte de connaissance publique */
    description: string;
  };

  /** Score de pertinence/intérêt du fait (0 = anodin, 100 = choquant/captivant) */
  relevanceScore?: number;
  
  /** Métadonnées additionnelles */
  metadata: {
    /** Importance relative */
    importance: 'low' | 'medium' | 'high';
    /** ID de fil (thread) pour l'orchestration narrative */
    threadId: string;
    /** Statut de vérification */
    verificationStatus: 'pending' | 'confirmed' | 'disputed';
    /** IDs de faits liés/corrélés */
    crossReferences?: string[];
    /** Date de couverture médiatique (si différente de l'événement) */
    mediaCoverageDate?: number;
  };
}

// ============================================================================
// TIMELINE
// ============================================================================

export type TimelineDirection = 'horizontal' | 'vertical';

export interface TimelineConfig {
  /** ID unique de la timeline */
  id: string;
  /** Nom affichable */
  name: string;
  /** Description */
  description: string;
  /** Couleur associée */
  color: string;
  /** Faits de cette timeline */
  facts: Fact[];
  /** Tags disponibles dans cette timeline */
  availableTags: string[];
}

/** Props pour le composant Timeline */
export interface TimelineProps {
  /** Faits à afficher */
  facts: Fact[];
  /** Direction de la timeline */
  direction?: TimelineDirection;
  /** Catégories disponibles pour le filtrage (legacy) */
  categories?: { id: string; name: string; color: string }[];
  /** Tags disponibles pour le filtrage */
  availableTags?: string[];
  /** Tags sélectionnés pour le filtrage */
  selectedTags?: string[];
  /** Callback quand un fait est cliqué */
  onFactClick?: (fact: Fact) => void;
  /** Mode de visualisation */
  mode?: 'single' | 'comparison';
  /** IDs des faits à mettre en évidence */
  highlightedFacts?: string[];
  /** ID de la lane (pour mode comparaison) */
  laneId?: string;
  /** Couleur de la lane */
  laneColor?: string;
  /** Titre de la lane */
  laneTitle?: string;
}

// ============================================================================
// COMPARAISON MULTI-TIMELINE
// ============================================================================

/** Configuration d'une lane de timeline (mode comparaison) */
export interface TimelineLane {
  /** ID unique de la lane */
  id: string;
  /** Titre de la lane */
  title: string;
  /** Couleur associée (Tailwind class ou hex) */
  color: string;
  /** Faits de cette lane */
  facts: Fact[];
  /** Index de position (0-3 pour 4 lanes max) */
  position: number;
}

/** Corrélation entre faits de différentes lanes */
export interface FactCorrelation {
  /** ID unique de la corrélation */
  id: string;
  /** ID du fait dans la lane 1 */
  fact1Id: string;
  /** ID de la lane 1 */
  lane1Id: string;
  /** ID du fait dans la lane 2 */
  fact2Id: string;
  /** ID de la lane 2 */
  lane2Id: string;
  /** Type de corrélation */
  type: 'temporal' | 'causal' | 'thematic' | 'coverage-gap';
  /** Description de la corrélation */
  description: string;
  /** Écart temporel en secondes (pour coverage-gap) */
  timeGap?: number;
  /** Position relative sur l'axe temporel (0-100) */
  position: number;
  /** Force de la corrélation (0-1) */
  strength: number;
}

/** Props pour le mode comparaison */
export interface TimelineComparisonProps {
  /** Lanes à comparer (2-4 lanes) */
  lanes: TimelineLane[];
  /** Plage temporelle commune */
  timeRange: {
    start: number;
    end: number;
  };
  /** Corrélations entre faits */
  correlations?: FactCorrelation[];
  /** Callback quand une corrélation est trouvée/sélectionnée */
  onCorrelationFound?: (correlation: FactCorrelation) => void;
  /** Callback quand un fait est cliqué */
  onFactClick?: (fact: Fact, laneId: string) => void;
  /** Direction d'affichage */
  direction?: TimelineDirection;
}

// ============================================================================
// FOCUS MODE & UI
// ============================================================================

/** État du Focus Mode */
export interface FocusModeState {
  /** Fait actuellement en focus */
  selectedFact: Fact | null;
  /** Niveau de zoom */
  zoomLevel: number;
  /** Contexte visible */
  visibleFacts: Fact[];
}

/** Configuration de l'animation GSAP */
export interface AnimationConfig {
  /** Durée de l'animation en secondes */
  duration: number;
  /** Easing function */
  ease: string;
  /** Délais entre éléments (stagger) */
  stagger?: number;
  /** Décalage initial */
  delay?: number;
}

/** Props pour le Hero interactif */
export interface HeroProps {
  /** Titre principal */
  title: string;
  /** Sous-titre */
  subtitle?: string;
  /** Thème/Métaphore visuelle */
  theme: 'particles' | 'morph' | 'reveal';
  /** Couleurs du thème */
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/** Synthèse contextuelle */
export interface ContextualSummary {
  /** Faits actuellement visibles */
  visibleFacts: Fact[];
  /** Résumé généré */
  summary: string;
  /** Mots-clés extraits */
  keywords: string[];
  /** Corrélations détectées */
  correlations: {
    factId: string;
    relatedFactIds: string[];
    description: string;
  }[];
}

// ============================================================================
// RESEARCH & VALIDATION
// ============================================================================

/** Statut d'une tâche */
export type TaskStatus = 'pending' | 'researching' | 'validating' | 'completed' | 'blocked' | 'rejected';

/** Tâche de recherche */
export interface ResearchTask {
  id: string;
  status: TaskStatus;
  subject: string;
  subQuestions: string[];
  sourcesFound: string[];
  factsCreated: string[];
  createdAt: string;
  updatedAt: string;
}

/** Rapport de validation */
export interface ValidationReport {
  projectId: string;
  timestamp: string;
  facts: {
    total: number;
    validated: number;
    rejected: number;
    pending: number;
  };
  code: {
    components: number;
    tests: number;
    passed: boolean;
  };
  issues: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    component?: string;
  }[];
  approved: boolean;
}

// ============================================================================
// UTILITAIRES DE TYPE
// ============================================================================

/** Helper pour obtenir les infos d'un tag standard */
export function getTagInfo(tagValue: string): { type: TagType; label: string; color: string } | null {
  const standardTag = STANDARD_TAGS[tagValue as StandardTagKey];
  if (standardTag) {
    return standardTag;
  }
  
  // Parse custom tag
  const [prefix, ...rest] = tagValue.split(':');
  if (prefix && rest.length > 0) {
    return {
      type: 'custom',
      label: rest.join(':').replace(/-/g, ' '),
      color: '#6b7280',
    };
  }
  
  return null;
}

/** Helper pour filtrer les faits par tags */
export function filterFactsByTags(facts: Fact[], selectedTags: string[]): Fact[] {
  if (selectedTags.length === 0) return facts;
  return facts.filter((fact) => selectedTags.some((tag) => fact.tags.includes(tag)));
}

/** Helper pour filtrer par couverture médiatique */
export function filterFactsByMediaCoverage(
  facts: Fact[],
  showOnlyWithCoverage: boolean | null
): Fact[] {
  if (showOnlyWithCoverage === null) return facts;
  
  return facts.filter(fact => {
    const hasCoverage = fact.metadata.mediaCoverageDate !== undefined ||
                       fact.tags.some(t => t.startsWith('coverage:'));
    return showOnlyWithCoverage ? hasCoverage : !hasCoverage;
  });
}
