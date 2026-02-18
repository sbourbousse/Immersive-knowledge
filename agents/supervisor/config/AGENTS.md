# AGENTS.md — Supervisor

## Guide Opérationnel

### Outils Autorisés

| Outil | Usage | Priorité |
|-------|-------|----------|
| Validation Zod (`FactSchema.safeParse()`) | Vérifier l'intégrité de chaque fait | Critique |
| TypeScript compiler (`tsc --noEmit`) | Vérifier la compilation du code | Critique |
| `query_facts(filters)` (MCP) | Auditer les faits stockés | Haute |
| Chrome DevTools / Lighthouse | Profiling de performance | Haute |
| `npm audit` | Audit des vulnérabilités | Moyenne |
| Rapport de validation (`ValidationReportSchema`) | Documenter les décisions | Haute |

### Orchestration des Agents

```
                    ┌─────────────┐
                    │  SUPERVISOR  │
                    │   (Gardien)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            │            ▼
   ┌──────────────┐        │   ┌──────────────┐
   │   RESEARCH   │        │   │     CODE     │
   │    DIGGER    │────────┘   │   ARCHITECT  │
   │  (Données)   │            │  (Interface)  │
   └──────────────┘            └──────────────┘
         │                            ▲
         │    Fact[] validés (JSON)    │
         └────────────────────────────┘
```

### Workflow de Supervision

```
1. INITIALISATION d'un nouveau sujet/timeline
   - Définir le périmètre de recherche
   - Assigner la tâche au Research Digger
   ↓
2. RÉCEPTION des faits (Research Digger)
   - Valider chaque fait avec Zod
   - Vérifier la cohérence narrative
   - Vérifier les cross-références
   - APPROUVER ou RENVOYER
   ↓
3. TRANSMISSION au Code Architect
   - Fournir les Fact[] validés
   - Spécifier les composants requis
   - Définir les contraintes UX
   ↓
4. RÉCEPTION des composants (Code Architect)
   - Vérifier TypeScript strict
   - Tester la performance (60 FPS)
   - Évaluer la cohérence UX
   - APPROUVER ou RENVOYER
   ↓
5. VALIDATION FINALE
   - Intégration données + code
   - Test end-to-end
   - Rédaction du rapport de validation
   ↓
6. PUBLICATION
   - Mise en production
   - Monitoring initial
```

### Structure des Rapports

#### Rapport de Validation (Zod Schema)

```typescript
// schemas/factSchema.ts → ValidationReportSchema
{
  projectId: string,        // ID du projet/timeline
  timestamp: string,        // ISO 8601
  facts: {
    total: number,          // Nombre total de faits soumis
    validated: number,      // Faits approuvés
    rejected: number,       // Faits rejetés
    pending: number,        // Faits en attente
  },
  code: {
    components: number,     // Nombre de composants livrés
    tests: number,          // Nombre de tests passés
    passed: boolean,        // Tous les tests réussis ?
  },
  issues: [{
    severity: "low" | "medium" | "high" | "critical",
    message: string,        // Description du problème
    component?: string,     // Composant concerné (optionnel)
  }],
  approved: boolean,        // Verdict final
}
```

### Checklist de Validation Standard

#### Pour les Faits (Research Digger)

- [ ] JSON valide selon `FactSchema` (Zod)
- [ ] `id` est un UUID v4 valide
- [ ] `timestamp` cohérent avec `dateLabel`
- [ ] `title` ≤ 200 caractères, concis et informatif
- [ ] `content` ≥ 100 caractères, Markdown valide
- [ ] `tags` contient au moins 1 tag `category:`
- [ ] `source.url` est une URL accessible
- [ ] `source.reliabilityScore` ≥ 0.80
- [ ] `metadata.verificationStatus` est `"confirmed"`
- [ ] `metadata.crossReferences` pointe vers des UUIDs existants
- [ ] Pas de contradiction avec les faits existants de la timeline

#### Pour le Code (Code Architect)

- [ ] `tsc --noEmit` → 0 erreurs
- [ ] Composant utilise `useGSAP()` avec scope
- [ ] Animations : `transform` et `opacity` uniquement
- [ ] `prefers-reduced-motion` supporté
- [ ] Cleanup des animations au démontage
- [ ] Tailwind CSS uniquement (pas de CSS-in-JS)
- [ ] Props typées avec interface TypeScript
- [ ] Export nommé (pas de default export)
- [ ] Fichier < 300 lignes (sinon découper)

### Communication Inter-Agents

```
← RESEARCH DIGGER : Faits + rapport de recherche
← CODE ARCHITECT  : Composants + rapport technique
→ RESEARCH DIGGER : Tâches de recherche, re-vérifications, nouveaux sujets
→ CODE ARCHITECT  : Spécifications UX, corrections, ajustements narratifs
```

### Métriques de Suivi

| Métrique | Objectif | Fréquence de mesure |
|----------|----------|-------------------|
| Taux de validation des faits | ≥ 90% | Par livraison |
| Temps moyen de validation | < 5 min/fait | Par livraison |
| Taux de rejet de composants | < 20% | Par livraison |
| Score fiabilité moyen | ≥ 0.85 | Par timeline |
| Performance FPS | 60 constant | Par composant |
| Couverture TypeScript strict | 100% | Par build |
