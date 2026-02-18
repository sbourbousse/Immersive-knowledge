# Architecture Technique — Immersive Knowledge

## Vue d'Ensemble

L'Architecture de l'Information Immersive repose sur trois piliers :

1. **Interface Immersive** — Composants React/GSAP pour une navigation active
2. **Systeme Multi-Agents** — 3 agents IA autonomes coordonnes par le cadre Soul-Identity
3. **Model Context Protocol (MCP)** — Pont entre l'IA et les sources de donnees

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR                           │
│              (Navigation Active / Scroll)                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              INTERFACE IMMERSIVE                         │
│  Next.js 14 + GSAP + Tailwind + Lenis + Zustand         │
│                                                          │
│  ┌──────┐ ┌──────────┐ ┌───────────┐ ┌─────────┐       │
│  │ Hero │ │ Timeline │ │ FocusMode │ │ Compare │       │
│  └──────┘ └──────────┘ └───────────┘ └─────────┘       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│               COUCHE DONNEES                             │
│  Zustand (state) + Zod (validation) + Fact[]             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│            SYSTEME MULTI-AGENTS                          │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Research   │  │     Code     │  │  Supervisor  │  │
│  │    Digger    │→ │   Architect  │→ │  (Gardien)   │  │
│  │  (Donnees)   │  │ (Interface)  │  │  (Qualite)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│          MODEL CONTEXT PROTOCOL (MCP)                    │
│  store_fact() / query_facts() / find_correspondance()    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              SUPABASE (Base de donnees)                   │
│          Stockage persistant des Atomes de Fait          │
└──────────────────────────────────────────────────────────┘
```

---

## Architecture de l'Interface

### Rendu Hybride (SSR/CSR)

Next.js 14 App Router permet un rendu hybride :

- **Server Components** (par defaut) : Contenu statique, SEO, chargement initial rapide
- **Client Components** (`"use client"`) : Composants avec animations GSAP, interactions utilisateur

```
app/
├── layout.tsx          # Server Component — structure HTML, providers
├── page.tsx            # Client Component — Hero + Timeline + interactions
├── globals.css         # Styles Tailwind + custom
└── multi-lane/
    └── page.tsx        # Client Component — mode multi-lane
```

### Composants et Animations GSAP

Chaque composant interactif utilise le pattern suivant :

```typescript
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Component({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animations scopees, cleanup automatique
    gsap.from('.element', {
      opacity: 0,
      y: 50,        // transform uniquement
      stagger: 0.1,
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  return <div ref={ref}>...</div>;
}
```

### Hierarchie des Composants

```
page.tsx
├── ProgressBar          # gsap.to() sync scroll global
├── Hero                 # ScrollTrigger parallax + decomposition
├── Timeline             # ScrollTrigger pin + scroll horizontal
│   ├── FactCard[]       # stagger animation, click → FocusMode
│   └── TimeMarker[]     # indicateurs temporels
├── TimelineComparison   # Multi-lanes synchronisees
│   ├── Lane[]           # Ligne horizontale par sujet
│   └── Correlation[]    # Lignes de correlation entre faits
├── FocusMode            # autoAlpha + scale + backdrop blur
└── TagFilter            # Filtrage reactif par tags
```

### Smooth Scroll (Lenis)

Lenis normalise le scroll entre navigateurs et offre une precision chirurgicale aux ScrollTriggers :

```typescript
// hooks/useLenis.ts
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Synchronisation Lenis ↔ ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
```

---

## Architecture des Donnees

### L'Atome de Fait (Unite de Connaissance)

```typescript
// schemas/factSchema.ts — Source de verite (Zod)
const FactSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number().int().positive(),
  dateLabel: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).min(1),
  source: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    reliabilityScore: z.number().min(0).max(1),
    accessedAt: z.string().datetime(),
  }),
  metadata: z.object({
    importance: z.enum(['low', 'medium', 'high']),
    threadId: z.string().min(1),
    verificationStatus: z.enum(['pending', 'confirmed', 'disputed']),
    crossReferences: z.array(z.string().uuid()).optional(),
    mediaCoverageDate: z.number().int().positive().optional(),
  }),
});
```

### Systeme de Tags

```
source:official     → Documents gouvernementaux, rapports
source:media        → Articles de presse
source:leak         → Fuites, documents declassifies
source:court        → Documents juridiques
source:witness      → Temoignages

category:technology → Evenements technologiques
category:politics   → Evenements politiques
category:finance    → Evenements economiques
category:justice    → Procedures judiciaires
category:society    → Impact societal

coverage:mainstream  → Couverture grand public
coverage:independent → Media independant
coverage:suppressed  → Information censure/supprimee
coverage:delayed     → Couverture retardee
```

### State Management (Zustand)

```typescript
// store/timelineStore.ts — Store principal
{
  currentTimelineId: TimelineId,
  selectedFact: Fact | null,
  direction: 'horizontal' | 'vertical',
  isComparisonMode: boolean,
  comparedTimelines: TimelineId[],
  activeTags: string[],
  showOnlyMediaCovered: boolean | null,
}

// store/multiTimelineStore.ts — Store multi-lane (avec persistance)
{
  lanes: LaneConfig[],        // Max 4 lanes
  activeLaneId: string | null,
  syncScroll: boolean,
}
```

---

## Systeme Multi-Agents

### Cadre Soul-Identity

Chaque agent est defini par 6 fichiers Markdown dans `agents/{agent}/config/` :

| Fichier | Role | Persistance |
|---------|------|-------------|
| `SOUL.md` | Constitution, ethique, regles non-negociables | Lecture seule |
| `IDENTITY.md` | Persona, ton, style | Lecture seule |
| `USER.md` | Profil utilisateur cible | Lecture seule |
| `MEMORY.md` | Connaissances accumulees, decisions | Mise a jour par l'agent |
| `SHIELD.md` | Securite, limites de tokens/cout | Lecture seule (modifiable par Supervisor) |
| `AGENTS.md` | Outils, workflow, normes | Lecture seule |

### Flux de Coordination

```
1. SUPERVISOR assigne un sujet
         │
         ▼
2. RESEARCH DIGGER extrait les donnees
   - Deep Research (sources web, archives)
   - Cross-checking (3+ sources)
   - Structuration en Atome de Fait (JSON)
   - Validation Zod locale
         │
         ▼
3. SUPERVISOR valide les faits
   - Validation Zod
   - Coherence narrative
   - Qualite des sources
   - APPROVE / REJECT / REVISION
         │
         ▼
4. CODE ARCHITECT construit l'interface
   - Composants React/GSAP
   - Integration des Fact[]
   - Performance 60 FPS
   - Accessibilite
         │
         ▼
5. SUPERVISOR valide le code
   - TypeScript strict
   - Performance
   - UX / coherence
   - APPROVE / REJECT / REVISION
         │
         ▼
6. PUBLICATION
```

### Model Context Protocol (MCP)

Le MCP permet aux agents d'interagir avec Supabase comme memoire partagee :

| Fonction MCP | Agent | Description |
|-------------|-------|-------------|
| `store_fact(fact)` | Research Digger | Stocker un fait valide |
| `query_facts(filters)` | Tous | Recuperer des faits filtres |
| `find_correspondance(fact_id)` | Research Digger | Trouver des correlations |

---

## Performance

### Regles d'Animation

| Regle | Raison |
|-------|--------|
| `transform` et `opacity` uniquement | Eviter Layout Reflow |
| `will-change: transform` sur elements animes | Forcer GPU compositing |
| `useGSAP()` avec scope | Cleanup automatique, pas de fuites memoire |
| Lenis initialise AVANT ScrollTrigger | Eviter conflits de scroll |
| Stagger ≤ 0.1s entre elements | Eviter les animations trop longues |

### Metriques Cibles

| Metrique | Objectif |
|----------|----------|
| FPS | 60 constant |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle JS | < 300KB |
| Lighthouse Performance | > 90 |

---

## Evolution Prevue

1. **Backend Supabase** — Stockage persistant des faits
2. **Serveur MCP** — Integration complete du Model Context Protocol
3. **Vercel AI SDK** — Streaming des reponses IA
4. **Synthese Contextuelle** — Resume dynamique des faits visibles
5. **MorphSVG** — Transitions avancees entre sections
6. **Internationalisation** — Support multilingue (FR/EN)
7. **Service Worker** — Mode offline avec cache
