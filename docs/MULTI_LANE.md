# Système Multi-Lane pour Timeline

## Architecture

Le système multi-lane permet d'afficher jusqu'à 4 timelines simultanément avec des filtres de tags indépendants par lane.

## Structure

```
store/
├── multiTimelineStore.ts    # Store Zustand avec persistance
└── timelineStore.ts         # Store legacy (compatibilité)

components/
├── LaneBuilder/             # Configuration des lanes
│   └── index.tsx           # UI de configuration
├── MultiTimelineView/       # Affichage multi-lanes
│   └── index.tsx           # Vue côte-à-côte avec sync scroll
└── TagFilter/
    ├── index.tsx           # Filtres de base
    └── AdvancedTagFilter.tsx  # Filtres avancés + mode comparaison

hooks/
└── useLaneFilters.ts       # Hooks de filtrage réactif

app/
└── multi-lane/
    └── page.tsx            # Page de démonstration
```

## Fonctionnalités

### 1. Système de Lanes Configurables

Chaque lane a :
- `id`: Identifiant unique
- `name`: Nom affichable
- `color`: Couleur associée
- `timelineId`: Timeline source
- `includedTags`: Tags à inclure
- `excludedTags`: Tags à exclure
- `isVisible`: Visibilité

### 2. LaneBuilder

Interface permettant de :
- Ajouter/supprimer des lanes (max 4)
- Configurer nom, couleur, timeline source
- Définir des filtres de tags
- Dupliquer une configuration
- Exporter/importer en JSON

### 3. MultiTimelineView

Affichage avec :
- Layout responsive (côte-à-côte / empilé)
- Synchronisation du scroll (60 FPS)
- Lignes de corrélation entre faits
- Légende des couleurs

### 4. AdvancedTagFilter

Trois onglets :
- **Filtres**: Sélection par tag (inclure/exclure)
- **Comparer**: Mode comparaison avec presets
- **Stats**: Distribution des tags

## Presets de Comparaison

1. **Justice vs Médias**
   - Lane 1: source:official + category:justice
   - Lane 2: source:media + coverage:mainstream

2. **Élite vs Victimes**
   - Lane 1: category:elite + source:leak
   - Lane 2: category:victims + source:official

3. **Couverture médiatique**
   - Lane 1: coverage:suppressed + coverage:delayed
   - Lane 2: coverage:mainstream + coverage:independent

## Utilisation

```tsx
import { LaneBuilder, MultiTimelineView, AdvancedTagFilter } from '@/components';
import { useMultiTimelineStore } from '@/store/multiTimelineStore';

function App() {
  const { lanes, addLane, updateLane } = useMultiTimelineStore();
  
  return (
    <>
      <LaneBuilder />
      <AdvancedTagFilter />
      <MultiTimelineView onFactClick={handleFactClick} />
    </>
  );
}
```

## API Store

```typescript
// Actions
addLane(timelineId: TimelineId): string
removeLane(laneId: string): void
updateLane(laneId: string, updates: Partial<LaneConfig>): void
duplicateLane(laneId: string): string

// Tags
addTagToLane(laneId: string, tag: string, mode: 'include' | 'exclude'): void
removeTagFromLane(laneId: string, tag: string): void
setLaneTags(laneId: string, included: string[], excluded: string[]): void

// Import/Export
exportLaneConfig(): string
importLaneConfig(json: string): boolean
```

## Hooks

```typescript
// Filtrer les faits d'une lane
const { facts, filteredCount, totalCount } = useFilteredFactsForLane(lane);

// Filtrer toutes les lanes
const filteredLanes = useFilteredLanes(lanes);

// Plage temporelle commune
const timeRange = useCommonTimeRange(filteredLanes);

// Corrélations entre faits
const correlations = useCorrelations(filteredLanes);
```

## Performance

- Scroll synchronisé via requestAnimationFrame
- Memoization des calculs de filtrage
- Lazy loading des composants
- Persistance Zustand (localStorage)

## Responsive

- Desktop: Lanes côte-à-côte (2-4 colonnes)
- Tablet: 2 colonnes max avec scroll horizontal
- Mobile: Lanes empilées verticalement
