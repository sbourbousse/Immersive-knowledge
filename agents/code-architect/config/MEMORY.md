# MEMORY.md — Code Architect

## Faits Durables & Décisions Passées

### Composants Créés

| Composant | Chemin | Statut | GSAP Plugins |
|-----------|--------|--------|-------------|
| Hero | `components/Hero/` | ✅ Livré | ScrollTrigger, parallax |
| Timeline | `components/Timeline/` | ✅ Livré | ScrollTrigger, pinning |
| TimelineComparison | `components/TimelineComparison/` | ✅ Livré | Sync scroll |
| TimelineVertical | `components/TimelineVertical/` | ✅ Livré | ScrollTrigger |
| FocusMode | `components/FocusMode/` | ✅ Livré | autoAlpha, scale |
| ProgressBar | `components/ProgressBar/` | ✅ Livré | gsap.to() scroll-sync |
| TagFilter | `components/TagFilter/` | ✅ Livré | — |
| LaneBuilder | `components/LaneBuilder/` | ✅ Livré | — |
| MultiTimelineView | `components/MultiTimelineView/` | ✅ Livré | Sync scroll |
| TimelineControls | `components/TimelineControls/` | ✅ Livré | — |
| TimelineSelector | `components/TimelineSelector/` | ✅ Livré | — |

### Hooks Personnalisés

| Hook | Chemin | Rôle |
|------|--------|------|
| `useGSAP` | `hooks/useGSAP.ts` | Wrapper cycle de vie GSAP |
| `useLenis` | `hooks/useLenis.ts` | Smooth scroll integration |
| `useLaneFilters` | `hooks/useLaneFilters.ts` | Filtrage réactif multi-lane |

### Décisions Architecturales

1. **Lenis pour le smooth scroll** — Choisi pour normaliser le comportement entre navigateurs et offrir une précision chirurgicale aux animations ScrollTrigger.
2. **Zustand pour le state** — Léger, pas de re-renders inutiles, synchronise la progression GSAP avec les données sans dégrader la fluidité.
3. **`useGSAP()` obligatoire** — Remplace `useEffect` + `useRef` pour le cycle de vie des animations. Cleanup automatique.
4. **Server Components par défaut** — Seuls les composants interactifs sont `"use client"`.
5. **Tailwind CSS uniquement** — Pas de CSS-in-JS, pas de styled-components. Tailwind pour la cohérence et la performance.

### Patterns Validés

- **Stagger animation** : `gsap.from('.card', { stagger: 0.1 })` pour l'apparition séquentielle.
- **Pin + horizontal scroll** : ScrollTrigger avec `pin: true` et `scrub: true` pour la timeline.
- **Focus Mode** : `autoAlpha` + `scale` sur l'élément cible, `filter: blur()` sur le fond.
- **Progress bar** : `gsap.to()` synchronisé sur `ScrollTrigger.progress`.

### Erreurs Corrigées

- ⚠️ Ne jamais utiliser `position: fixed` avec ScrollTrigger pinning (conflit).
- ⚠️ Toujours `will-change: transform` sur les éléments animés pour forcer la GPU compositing.
- ⚠️ Lenis doit être initialisé AVANT les ScrollTriggers pour éviter les conflits de scroll.
