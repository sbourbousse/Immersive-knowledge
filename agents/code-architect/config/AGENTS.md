# AGENTS.md — Code Architect

## Guide Opérationnel

### Outils Autorisés

| Outil | Usage | Obligatoire |
|-------|-------|-------------|
| `useGSAP()` | Cycle de vie animations GSAP dans React | ✅ Oui |
| `gsap.context()` | Scope des animations, cleanup auto | ✅ Oui |
| `ScrollTrigger` | Animations déclenchées par le scroll | ✅ Oui |
| `Observer` | Capture des intentions de mouvement (molette, tactile) | Selon besoin |
| `Lenis` | Smooth scroll normalisé | ✅ Oui |
| `Zustand` | State management synchronisé avec GSAP | ✅ Oui |
| `Zod` | Validation des données avant rendu | ✅ Oui |
| `Tailwind CSS` | Styling — classes utilitaires uniquement | ✅ Oui |
| `Lucide React` | Icônes SVG légères | Selon besoin |

### Structure du Projet

```
app/                            # Next.js 14 App Router
├── layout.tsx                  # Layout racine (providers, Lenis)
├── page.tsx                    # Page principale (Hero + Timeline)
├── globals.css                 # Styles globaux + Tailwind
└── multi-lane/
    └── page.tsx                # Page mode multi-lane

components/                     # Composants React
├── Hero/index.tsx              # Animation d'entrée immersive
├── Timeline/index.tsx          # Timeline horizontale ScrollTrigger
├── TimelineVertical/index.tsx  # Timeline verticale alternative
├── TimelineComparison/index.tsx # Mode comparaison 2+ lanes
├── TimelineControls/index.tsx  # Contrôles de navigation
├── TimelineSelector/index.tsx  # Sélecteur de timeline
├── FocusMode/                  # Modal d'exploration détaillée
│   ├── index.tsx
│   ├── FocusModeModal.tsx
│   └── FocusModeProvider.tsx
├── ProgressBar/index.tsx       # Barre de progression globale
├── TagFilter/                  # Filtrage par tags
│   ├── index.tsx
│   └── AdvancedTagFilter.tsx
├── LaneBuilder/index.tsx       # Configuration des lanes
├── MultiTimelineView/index.tsx # Vue multi-lanes synchronisée
├── providers/                  # Context providers
└── index.ts                    # Barrel exports

hooks/                          # Hooks personnalisés
├── useGSAP.ts                  # Wrapper GSAP lifecycle
├── useLenis.ts                 # Smooth scroll hook
├── useLaneFilters.ts           # Filtrage réactif
└── useTimeline.ts              # Logique timeline

lib/                            # Utilitaires
├── data.ts                     # Données et timelines
├── facts.ts                    # Chargement des faits JSON
├── gsap.ts                     # Configuration GSAP globale
└── utils.ts                    # Helpers (cn, etc.)

store/                          # State management Zustand
├── timelineStore.ts            # Store principal timeline
└── multiTimelineStore.ts       # Store multi-lane

schemas/
└── factSchema.ts               # Validation Zod (source de vérité)

types/
├── index.ts                    # Types principaux (Fact, Timeline, etc.)
└── timelines.ts                # Types spécifiques timelines
```

### Normes de Codage

#### Composants React

```typescript
// 1. Toujours "use client" si le composant utilise GSAP
'use client';

// 2. Imports groupés : React → Libs → Internal → Types
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import type { Fact } from '@/types';

// 3. Register plugins au top-level
gsap.registerPlugin(ScrollTrigger);

// 4. Props typées explicitement
interface ComponentProps {
  facts: Fact[];
  onFactClick?: (fact: Fact) => void;
}

// 5. Export nommé (pas de default export)
export function Component({ facts, onFactClick }: ComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 6. useGSAP avec scope
  useGSAP(() => {
    // Animations ici
  }, { scope: containerRef, dependencies: [facts] });

  return (
    <div ref={containerRef} className="relative">
      {/* Tailwind classes uniquement */}
    </div>
  );
}
```

#### Animations GSAP

```typescript
// ✅ CORRECT — transform + opacity uniquement
gsap.from(element, {
  opacity: 0,
  y: 50,           // → translateY(50px)
  scale: 0.9,      // → scale(0.9)
  duration: 0.6,
  ease: 'power2.out',
});

// ❌ INTERDIT — provoque Layout Reflow
gsap.to(element, {
  width: '100%',    // ❌ Layout Reflow
  marginLeft: 20,   // ❌ Layout Reflow
  height: 'auto',   // ❌ Layout Reflow
});
```

#### Tailwind CSS

- Dark mode : `dark:` prefix pour toutes les couleurs
- Responsive : `sm:`, `md:`, `lg:`, `xl:` — mobile-first
- Animations : Préférer GSAP aux animations Tailwind pour le contrôle
- Spacing : Utiliser le système de spacing Tailwind (pas de valeurs arbitraires)

### Workflow de Construction

```
1. RÉCEPTION des Fact[] validés (depuis Research Digger)
   ↓
2. ANALYSE de la structure de données
   - Identifier les champs à visualiser
   - Planifier les animations
   ↓
3. CONSTRUCTION du composant
   - Structure JSX + Tailwind
   - Logique d'animation GSAP
   - Intégration Zustand si nécessaire
   ↓
4. VALIDATION TypeScript
   - tsc --noEmit → 0 erreurs
   ↓
5. TEST performance
   - Vérifier 60 FPS
   - Vérifier reduced-motion
   ↓
6. LIVRAISON au Supervisor pour review
```

### Communication Inter-Agents

```
← RESEARCH DIGGER : Reçoit Fact[] validés (JSON strict Zod)
→ SUPERVISOR       : Livre composants pour review qualité/cohérence
← SUPERVISOR       : Reçoit retours UX et ajustements narratifs
```
