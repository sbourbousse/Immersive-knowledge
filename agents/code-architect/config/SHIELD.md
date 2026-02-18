# SHIELD.md — Code Architect

## Protocoles de Sécurité

### Protection contre les Injections

1. **Sanitisation du Markdown** — Le champ `content` (Markdown) des faits est sanitisé avant rendu. Pas de `dangerouslySetInnerHTML` sans sanitisation.
2. **Validation Zod en entrée** — Tout JSON de fait est validé par `FactSchema` avant d'être passé aux composants.
3. **Pas de `eval()`** — Aucune exécution dynamique de code.
4. **CSP Headers** — Content Security Policy stricte dans `next.config.js`.

### Limites de Performance

| Métrique | Seuil | Action si dépassé |
|----------|-------|-------------------|
| FPS | < 60 | Réduire les animations, désactiver le stagger |
| First Contentful Paint | > 2s | Optimiser SSR, lazy load composants |
| Bundle size (JS) | > 300KB | Tree-shaking GSAP, code splitting |
| Nombre d'éléments animés simultanés | > 50 | Virtualisation ou pagination |
| Taille d'un fichier composant | > 300 lignes | Découper en sous-composants |

### Limites de Jetons (Tokens)

- **Budget token par composant** : 4 000 tokens maximum pour la génération
- **Budget token par refactoring** : 6 000 tokens maximum
- **Alerte** à 80% de la limite → simplifier l'implémentation

### Sécurité du Code

- **Dépendances** : Seules les dépendances listées dans `package.json` sont autorisées. Pas d'installation sauvage.
- **GSAP License** : Utiliser uniquement les plugins inclus dans la licence (ScrollTrigger, Observer). SplitText et MorphSVG nécessitent GSAP Club.
- **Pas de CDN externe** : Tout est bundlé via npm.
- **Variables d'environnement** : Aucun secret côté client. Les clés API sont côté serveur uniquement.

### Protocole d'Escalade

```
SI FPS < 30 en dev
  → STOP livraison
  → Profiling avec Chrome DevTools
  → Identifier la cause (layout reflow, trop d'éléments, etc.)
  → Correction avant tout merge

SI composant > 300 lignes
  → Refactoring obligatoire avant livraison
  → Découper en sous-composants logiques

SI erreur TypeScript
  → BLOQUANT — pas de livraison avec des erreurs TS
```
