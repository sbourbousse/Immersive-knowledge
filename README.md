# Immersive Knowledge Architecture

> Architecture de l'Information Immersive : Navigation Active Pilotée par l'Intelligence Artificielle Autonome

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sbourbousse/Immersive-knowledge)

## A propos

Ce projet transforme la consommation passive de contenu en **navigation active** au sein d'un ecosysteme de donnees immersif. L'utilisateur devient le voyageur d'une **chronologie narrative** ou chaque interaction declenche une revelation visuelle et analytique.

Le systeme repose sur une synergie entre :
- **GSAP** (GreenSock Animation Platform) pour l'orchestration d'animations haute performance
- Un **systeme multi-agents IA** capable de recherche profonde et de verification objective
- Le **Model Context Protocol (MCP)** pour l'interoperabilite entre agents et sources de donnees

### Fonctionnalites Cles

- **Hero Interactif** — Decomposition visuelle du titre synchronisee au scroll (ScrollTrigger)
- **Timeline Horizontale** — Scroll horizontal avec pinning, micro-animations, data visualization
- **Focus Mode** — Exploration detaillee avec backdrop blur, sans quitter le contexte
- **Multivers de Timelines** — Comparaison multi-lanes revelant des correlations invisibles
- **Synthese Contextuelle** — Resume dynamique des faits visibles a l'ecran
- **Progress Bar** — Position de l'utilisateur dans l'exhaustivite de l'article
- **60 FPS garanti** — Animations `transform`/`opacity` uniquement, zero Layout Reflow

## Demarrage Rapide

```bash
git clone https://github.com/sbourbousse/Immersive-knowledge.git
cd Immersive-knowledge
npm install
npm run dev
```

## Stack Technique "Endgame"

### Core

- **Next.js 14** (App Router) — Rendu hybride SSR/CSR
- **TypeScript** strict — Contrat entre l'IA et le code frontal
- **GSAP** + ScrollTrigger + Observer — Animations immersives
- **Tailwind CSS** — Design system coherent, dark mode
- **Lenis** (Studio Freight) — Smooth scroll normalise

### Data & IA

- **Zustand** — State management synchronise avec GSAP sans re-renders
- **Zod** — Validation de schema forcant l'IA a respecter le modele "Atome de Fait"
- **Vercel AI SDK** — Streaming des reponses IA (prevu)
- **Model Context Protocol (MCP)** — Pont entre l'IA et Supabase (prevu)

### Outils MCP (prevus)

- `store_fact(fact)` — Stocker un Atome de Fait valide
- `query_facts(filters)` — Recuperer des faits par criteres temporels/categoriels
- `find_correspondance(fact_id)` — Trouver des faits similaires dans d'autres timelines

## Structure du Projet

```
Immersive-knowledge/
├── agents/                          # Systeme Multi-Agents Autonomes
│   ├── research-digger/config/      # Agent d'extraction et verification
│   │   ├── SOUL.md                  # Constitution & ethique
│   │   ├── IDENTITY.md              # Persona & ton
│   │   ├── USER.md                  # Profil utilisateur cible
│   │   ├── MEMORY.md                # Faits durables & decisions
│   │   ├── SHIELD.md                # Securite & limites
│   │   └── AGENTS.md                # Guide operationnel
│   ├── code-architect/config/       # Agent de construction d'interfaces
│   │   ├── SOUL.md                  # 60 FPS, zero Layout Reflow
│   │   ├── IDENTITY.md              # Dev Creative Front-end Senior
│   │   ├── USER.md                  # Besoins UX utilisateur
│   │   ├── MEMORY.md                # Composants et patterns
│   │   ├── SHIELD.md                # Limites de performance
│   │   └── AGENTS.md                # Normes de codage GSAP/React
│   └── supervisor/config/           # Agent de validation qualite
│       ├── SOUL.md                  # Gardien qualite, droit de veto
│       ├── IDENTITY.md              # Chef de projet & editeur en chef
│       ├── USER.md                  # Criteres de satisfaction
│       ├── MEMORY.md                # Rapports de validation
│       ├── SHIELD.md                # Securite globale systeme
│       └── AGENTS.md                # Workflow de supervision
│
├── app/                             # Next.js 14 App Router
│   ├── layout.tsx                   # Layout racine (providers, Lenis)
│   ├── page.tsx                     # Page principale (Hero + Timeline)
│   ├── globals.css                  # Styles globaux + Tailwind
│   └── multi-lane/page.tsx          # Page mode multi-lane
│
├── components/                      # Composants React/GSAP
│   ├── Hero/                        # Animation d'entree immersive
│   ├── Timeline/                    # Timeline horizontale ScrollTrigger
│   ├── TimelineVertical/            # Timeline verticale alternative
│   ├── TimelineComparison/          # Mode comparaison multi-lanes
│   ├── TimelineControls/            # Controles de navigation
│   ├── TimelineSelector/            # Selecteur de timeline
│   ├── FocusMode/                   # Modal d'exploration detaillee
│   ├── ProgressBar/                 # Barre de progression globale
│   ├── TagFilter/                   # Filtrage par tags
│   ├── LaneBuilder/                 # Configuration des lanes
│   ├── MultiTimelineView/           # Vue multi-lanes synchronisee
│   └── providers/                   # Context providers
│
├── facts/                           # Atomes de Fait (JSON)
├── hooks/                           # useGSAP, useLenis, useLaneFilters
├── lib/                             # Utilitaires (data, facts, gsap, utils)
├── store/                           # Zustand (timelineStore, multiTimelineStore)
├── schemas/                         # Validation Zod (factSchema.ts)
├── types/                           # Types TypeScript stricts
└── docs/                            # Documentation technique
```

## Systeme Multi-Agents Autonomes

Le projet est pilote par **3 agents specialises** coordonnes par le cadre "Soul-Identity" :

### Agent 1 : Research Digger (Le Cerveau Investigatif)

- **Role** : Extraction de donnees brutes et verification de sources
- **Contraintes** : Triangulation obligatoire (3+ sources), neutralite factuelle
- **Sortie** : `Fact[]` valides conforme au schema Zod

### Agent 2 : Code Architect (Le Batisseur d'Interfaces)

- **Role** : Transformation des donnees structurees en composants React/GSAP
- **Contraintes** : 60 FPS minimum, zero Layout Reflow, `useGSAP()` obligatoire
- **Sortie** : Composants immersifs accessibles et performants

### Agent 3 : Supervisor (Le Gardien de la Qualite)

- **Role** : Validation finale, coherence narrative, securite du systeme
- **Contraintes** : Droit de veto, validation Zod, audit de performance
- **Sortie** : Rapports de validation, decisions d'approbation/rejet

Chaque agent possede 6 fichiers de configuration dans `agents/{agent}/config/` :

| Fichier | Role |
|---------|------|
| `SOUL.md` | Constitution, ethique, regles non-negociables |
| `IDENTITY.md` | Persona, ton, style de communication |
| `USER.md` | Profil utilisateur cible et besoins |
| `MEMORY.md` | Base de connaissances, decisions passees |
| `SHIELD.md` | Securite, limites de cout/tokens |
| `AGENTS.md` | Guide operationnel, outils, workflow |

## L'Atome de Fait

Unite de base de la connaissance dans le systeme :

```typescript
{
  id: string,              // UUID v4
  timestamp: number,       // Unix (positionnement axe X)
  dateLabel: string,       // "Janvier 2024"
  title: string,           // Max 200 chars
  content: string,         // Markdown enrichi
  tags: string[],          // "category:technology", "source:official"
  source: {
    name: string,
    url: string,
    reliabilityScore: number, // 0.00 - 1.00
    accessedAt: string        // ISO 8601
  },
  metadata: {
    importance: "low" | "medium" | "high",
    threadId: string,
    verificationStatus: "pending" | "confirmed" | "disputed",
    crossReferences?: string[],
    mediaCoverageDate?: number
  }
}
```

## Donnees

15+ faits valides couvrant :
- **Technologie** — GPT-1 a GPT-4, Sora, Agents autonomes
- **Economie** — Investissements, couts de formation
- **Regulation** — EU AI Act, interdictions
- **Societe** — Greves Hollywood, adoption grand public

## Design

- Dark mode immersif
- Animations fluides 60 FPS (`transform`/`opacity` uniquement)
- Accessibilite (`prefers-reduced-motion`)
- Responsive (Desktop, Tablet, Mobile)
- Smooth scroll normalise (Lenis)

## Documentation

- `docs/ARCHITECTURE.md` — Architecture technique detaillee
- `docs/MULTI_LANE.md` — Systeme multi-lane
- `PROJECT_REPORT.md` — Rapport de projet complet
- `DEPLOY.md` — Guide de deploiement
- `agents/*/config/*.md` — Documentation des agents

---

*Genere par un systeme multi-agents autonomes*
