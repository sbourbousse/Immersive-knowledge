# MEMORY.md — Supervisor

## Faits Durables & Décisions Passées

### Projets Validés

| Projet | Timeline | Faits | Composants | Statut |
|--------|----------|-------|------------|--------|
| IA Générative (2018-2025) | `ai-evolution` | 15 validés | 11 composants | ✅ APPROVED |
| Affaire Epstein | `epstein` | En cours | Réutilisation composants | 🔄 EN COURS |

### Rapports de Validation Émis

#### Rapport #001 — IA Générative
- **Date** : 2024-01
- **Faits** : 15/15 validés (100%)
- **Code** : 11 composants, TypeScript ✅, 60 FPS ✅
- **Verdict** : ✅ APPROVED pour production

### Décisions Architecturales Validées

1. **Schéma Zod comme source de vérité** — Le `FactSchema` dans `schemas/factSchema.ts` est le contrat unique entre tous les agents. Toute modification nécessite l'approbation du Supervisor.
2. **Système de tags multi-niveaux** — `source:`, `category:`, `coverage:` — Approuvé pour remplacer le système `categories[]` legacy.
3. **Architecture multi-lane** — Maximum 4 lanes simultanées, scroll synchronisé via requestAnimationFrame.
4. **Lenis + GSAP** — Stack d'animation approuvée. Lenis initialisé avant les ScrollTriggers.
5. **Zustand sans persistance pour la timeline** — `timelineStore.ts` sans middleware `persist` pour éviter les conflits d'état.

### Standards de Qualité Établis

| Standard | Valeur | Appliqué depuis |
|----------|--------|----------------|
| Sources minimum (fait complexe) | 3 | Jour 1 |
| Score fiabilité minimum | 0.80 | Jour 1 |
| Performance FPS minimum | 60 | Jour 1 |
| TypeScript strict | 0 erreurs | Jour 1 |
| Accessibilité reduced-motion | Obligatoire | Jour 1 |
| Validation Zod avant stockage | Obligatoire | Jour 1 |

### Erreurs Passées et Leçons

- ⚠️ **Cohérence temporelle** : Vérifier que les timestamps Unix correspondent bien aux `dateLabel` affichés.
- ⚠️ **Cross-références** : S'assurer que les `crossReferences` pointent vers des UUIDs existants.
- ⚠️ **Scope GSAP** : Un context GSAP sans scope provoque des fuites mémoire. Toujours utiliser `{ scope: containerRef }`.

### Préférences Apprises

- Les utilisateurs préfèrent un **dark mode immersif** pour les sujets d'investigation.
- Le **Focus Mode** est la fonctionnalité la plus utilisée — à prioriser dans l'UX.
- Les **corrélations temporelles** entre lanes sont le principal facteur de "wow" — les rendre visuellement évidentes.
