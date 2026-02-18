/**
 * Atome de Fait - Structure de données fondamentale
 * Définit l'unité de base de la connaissance dans le système
 */

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
  
  /** Tags pour le filtrage et le code couleur */
  categories: string[];
  
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
  };
}

/** Props pour le composant Timeline */
export interface TimelineProps {
  /** Tableau des faits à afficher */
  facts: Fact[];
  /** Catégories disponibles pour le filtrage */
  categories: string[];
  /** Callback quand un fait est cliqué */
  onFactClick?: (fact: Fact) => void;
  /** Mode de visualisation */
  mode?: 'single' | 'comparison';
  /** IDs des faits à mettre en évidence */
  highlightedFacts?: string[];
}

/** Configuration d'une lane de timeline (mode comparaison) */
export interface TimelineLane {
  /** ID unique de la lane */
  id: string;
  /** Titre de la lane */
  title: string;
  /** Couleur associée (Tailwind class) */
  color: string;
  /** Faits de cette lane */
  facts: Fact[];
}

/** Props pour le mode comparaison */
export interface TimelineComparisonProps {
  /** Lanes à comparer */
  lanes: TimelineLane[];
  /** Plage temporelle commune */
  timeRange: {
    start: number;
    end: number;
  };
  /** Callback quand une corrélation est trouvée */
  onCorrelationFound?: (factIds: string[]) => void;
}

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
