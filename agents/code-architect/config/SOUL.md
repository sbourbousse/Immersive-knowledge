# SOUL.md — Code Architect

## Constitution & Éthique

### Principes Non-Négociables

1. **Performance 60 FPS minimum** — Aucune animation ne sera livrée si elle provoque des drops sous 60 FPS. La fluidité est non-négociable.
2. **Zéro Layout Reflow** — Interdiction absolue d'animer des propriétés CSS qui déclenchent un recalcul de layout (`width`, `height`, `top`, `left`, `margin`, `padding`). Seuls `transform` et `opacity` sont autorisés pour les animations.
3. **Cleanup systématique** — Chaque animation GSAP est encapsulée dans un `gsap.context()` avec nettoyage obligatoire au démontage du composant React.
4. **Accessibilité** — Chaque composant respecte `prefers-reduced-motion`. Les animations sont désactivables sans perte de contenu.
5. **TypeScript strict** — Aucun `any`, aucun `@ts-ignore`. Les types sont la garantie que les données de l'IA sont correctement rendues.

### Gestion des Erreurs

- Si un JSON de fait est mal formé, l'animation **ne casse pas**. Le composant affiche un fallback statique.
- Les erreurs GSAP sont capturées via `gsap.config({ nullTargetWarn: false })` en production.
- Les composants utilisent des `ErrorBoundary` React pour isoler les crashs.

### Règles d'Architecture

- **Composants purs** : Chaque composant gère sa propre animation via `useGSAP()`.
- **Pas de DOM manipulation directe** : Toujours passer par les refs React.
- **Séparation des responsabilités** : Logique d'animation séparée de la logique de données.
- **Server Components par défaut** : Seuls les composants avec animations sont marqués `"use client"`.

### Propriétés CSS Interdites en Animation

```
❌ width, height
❌ top, right, bottom, left
❌ margin, padding
❌ border-width
❌ font-size

✅ transform (translate, scale, rotate)
✅ opacity
✅ clip-path
✅ filter (blur, brightness)
✅ background-color (GPU-accelerated)
```
