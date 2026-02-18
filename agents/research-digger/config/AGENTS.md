# AGENTS.md — Research Digger

## Guide Opérationnel

### Outils Autorisés

| Outil | Usage | Priorité |
|-------|-------|----------|
| `store_fact(fact)` | Stocker un Atome de Fait validé dans Supabase via MCP | Critique |
| `query_facts(filters)` | Récupérer des faits par critères temporels/catégoriels | Haute |
| `find_correspondance(fact_id)` | Chercher des faits similaires dans d'autres timelines | Moyenne |
| Web Search (Deep Research) | Extraction de données depuis sources web | Critique |
| Archive Search (Wayback Machine) | Récupération de sources supprimées | Haute |

### Structure du Projet

```
facts/                          # Stockage des Atomes de Fait
├── 001-gpt1-2018.json         # Format: {NNN}-{slug}-{year}.json
├── 002-gpt2-2019.json
├── ...
└── NNN-{slug}-{year}.json

schemas/
└── factSchema.ts              # Schéma Zod — source de vérité

types/
├── index.ts                   # Types TypeScript stricts
└── timelines.ts               # Types spécifiques aux timelines
```

### Workflow de Recherche

```
1. RÉCEPTION du sujet de recherche (depuis Supervisor)
   ↓
2. DÉCOMPOSITION en sous-questions de recherche
   ↓
3. EXTRACTION de données brutes (Deep Research)
   - Compiler sources divergentes
   - Extraire faits bruts, dates, chiffres
   ↓
4. VÉRIFICATION croisée (Cross-checking)
   - Identifier faits objectifs vs opinions
   - Scorer la fiabilité de chaque source
   ↓
5. STRUCTURATION en Atome de Fait (JSON)
   - Remplir TOUS les champs du FactSchema
   - Valider avec Zod avant stockage
   ↓
6. STOCKAGE via store_fact() (MCP)
   ↓
7. RAPPORT au Supervisor avec métriques
```

### Normes de Données

#### Champs Obligatoires pour chaque Fait

```typescript
{
  id: string,              // UUID v4 généré automatiquement
  timestamp: number,       // Unix timestamp UTC
  dateLabel: string,       // "Mois YYYY" ou "JJ Mois YYYY"
  title: string,           // Max 200 caractères, concis
  content: string,         // Markdown enrichi, min 100 caractères
  tags: string[],          // Min 1 tag, format "type:valeur"
  source: {
    name: string,          // Nom de la source principale
    url: string,           // URL vérifiable
    reliabilityScore: number, // 0.00 à 1.00
    accessedAt: string     // ISO 8601
  },
  metadata: {
    importance: "low" | "medium" | "high",
    threadId: string,      // ID de la timeline parente
    verificationStatus: "pending" | "confirmed" | "disputed",
    crossReferences?: string[], // UUIDs de faits liés
    mediaCoverageDate?: number  // Si écart avec événement réel
  }
}
```

#### Convention de Nommage des Fichiers

- Format : `{NNN}-{slug}-{year}.json`
- `NNN` : Numéro séquentiel à 3 chiffres (001, 002, ...)
- `slug` : Titre en kebab-case, max 30 caractères
- `year` : Année de l'événement

#### Tags Obligatoires

Chaque fait doit avoir au minimum :
- 1 tag `category:` (thématique)
- 1 tag `source:` (type de source) si applicable

### Gestion des Tâches

- Utiliser un système de tracking pour chaque recherche
- Statuts : `pending` → `researching` → `validating` → `completed` | `rejected`
- Chaque tâche complétée est documentée dans `MEMORY.md`

### Communication Inter-Agents

```
→ CODE ARCHITECT : Livrer Fact[] validés (JSON strict)
→ SUPERVISOR     : Rapport de recherche + faits pending/disputed
← SUPERVISOR     : Nouvelles tâches de recherche, re-vérifications
```
