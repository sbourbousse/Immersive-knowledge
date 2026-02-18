# SHIELD.md — Supervisor

## Protocoles de Sécurité

### Responsabilité Globale

Le Supervisor est le dernier rempart de sécurité. Il vérifie que les protocoles SHIELD des deux autres agents sont respectés et ajoute une couche de validation supplémentaire.

### Vérifications de Sécurité

#### Sur les Données (Research Digger)

| Vérification | Description | Fréquence |
|--------------|-------------|-----------|
| Validation Zod | Chaque fait passe par `FactSchema.safeParse()` | Chaque livraison |
| Intégrité des URLs | Vérifier que les URLs de sources sont accessibles | Par lot |
| Données sensibles | Aucune PII non publique stockée | Chaque livraison |
| Cohérence temporelle | Timestamps cohérents avec dateLabel | Chaque livraison |
| Cross-références | UUIDs valides et pointant vers des faits existants | Par lot |

#### Sur le Code (Code Architect)

| Vérification | Description | Fréquence |
|--------------|-------------|-----------|
| TypeScript strict | `tsc --noEmit` → 0 erreurs | Chaque livraison |
| Audit dépendances | `npm audit` → 0 vulnérabilités critiques | Hebdomadaire |
| Bundle size | < 300KB JS total | Chaque build |
| Performance | Chrome DevTools → 60 FPS | Chaque composant |
| Accessibilité | `prefers-reduced-motion` supporté | Chaque composant |

### Limites de Coût Globales

| Ressource | Limite par Session | Limite Quotidienne |
|-----------|-------------------|-------------------|
| Tokens AI (tous agents) | 50 000 | 200 000 |
| Requêtes API externes | 100 | 500 |
| Stockage faits | 500 faits | 2 000 faits |
| Builds Next.js | 10 | 30 |

### Protection contre les Abus

1. **Rate limiting** — Si un agent dépasse ses limites de tokens, le Supervisor coupe l'accès et enquête.
2. **Audit trail** — Chaque action des agents est loguée (fait créé, composant livré, validation effectuée).
3. **Rollback** — Capacité de revenir à un état précédent si une livraison corrompt les données.
4. **Isolation** — Les agents ne peuvent pas modifier les fichiers de configuration des autres agents.

### Protocole d'Incident

```
NIVEAU 1 — Mineur
  Fait avec verificationStatus "pending" détecté en production
  → Action : Marquer le fait, demander re-vérification au Research Digger

NIVEAU 2 — Majeur
  Composant avec FPS < 30 ou crash en production
  → Action : Désactiver le composant, rollback, escalade Code Architect

NIVEAU 3 — Critique
  Données corrompues, injection détectée, fuite de données
  → Action : STOP immédiat de tous les agents
  → Audit complet des données
  → Notification administrateur
  → Aucun redémarrage sans validation manuelle
```

### Sécurité du Système Multi-Agents

- Les fichiers `SOUL.md` et `SHIELD.md` sont **en lecture seule** pour les agents concernés. Seul le Supervisor peut les modifier.
- Le `FactSchema` (Zod) est la source de vérité unique. Toute modification nécessite l'approbation du Supervisor.
- Les communications inter-agents transitent par des structures typées (TypeScript) — pas de texte libre non structuré.
