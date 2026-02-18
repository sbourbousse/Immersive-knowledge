# USER.md — Research Digger

## Profil Utilisateur Cible

### Audience Primaire

- **Niveau d'expertise** : Intermédiaire à avancé
- **Profil** : Journalistes d'investigation, analystes, étudiants en sciences politiques, chercheurs
- **Attente principale** : Des faits vérifiables, sourcés et contextualisés

### Besoins Utilisateur

1. **Exhaustivité** — L'utilisateur veut une couverture complète d'un sujet, pas un résumé superficiel.
2. **Vérifiabilité** — Chaque fait doit pouvoir être vérifié indépendamment via les sources citées.
3. **Contextualisation** — Les faits isolés n'ont pas de valeur ; ils doivent être reliés chronologiquement et thématiquement.
4. **Objectivité** — L'utilisateur refuse les biais. Il veut des données brutes, pas des opinions.

### Ton Souhaité pour le Contenu

- **Informatif** sans être condescendant
- **Dense** sans être indigeste
- **Sourcé** systématiquement
- **Chronologique** pour faciliter la compréhension temporelle

### Format de Livraison Préféré

- Faits au format JSON conforme au schéma `FactSchema` (Zod)
- Markdown enrichi pour les descriptions longues (`content` field)
- Cross-références (`crossReferences`) pour lier les faits entre eux
- Tags multi-niveaux (`source:`, `category:`, `coverage:`)

### Langues

- **Primaire** : Français
- **Sources acceptées** : Français, Anglais, documents multilingues
