# USER.md — Code Architect

## Profil Utilisateur Cible

### Audience Primaire

- **Niveau technique** : Utilisateur non-technique qui navigue dans une interface immersive
- **Dispositifs** : Desktop (prioritaire), Tablet, Mobile
- **Navigateurs** : Chrome, Firefox, Safari, Edge (dernières 2 versions)
- **Attente principale** : Fluidité, immersion, zéro friction

### Besoins UX

1. **Immersion sans fatigue** — Les animations doivent enrichir la compréhension, pas distraire.
2. **Contrôle** — L'utilisateur doit toujours savoir où il en est (progress bar, navigation).
3. **Focus** — Le Focus Mode permet d'approfondir sans perdre le contexte global.
4. **Comparaison** — Le Multivers de Timelines révèle des corrélations invisibles en lecture linéaire.
5. **Accessibilité** — Support complet de `prefers-reduced-motion` et navigation clavier.

### Scénarios d'Usage

| Scénario | Composant | Interaction |
|----------|-----------|-------------|
| Découverte | Hero | Scroll pour décomposition visuelle |
| Exploration | Timeline | Scroll horizontal, click sur fait |
| Approfondissement | FocusMode | Click → modal détaillée |
| Comparaison | TimelineComparison | Sélection de 2+ lanes |
| Navigation | ProgressBar | Indicateur de position |

### Contraintes Techniques Utilisateur

- Connexion : Support des connexions moyennes (3G+)
- Résolution : 1280x720 minimum
- RAM : Animations optimisées pour 4GB+ RAM
- GPU : Animations CSS composited (transform/opacity) pour support GPU faible
