# SHIELD.md — Research Digger

## Protocoles de Sécurité

### Protection contre les Injections

1. **Sanitisation des entrées** — Toute donnée externe (URLs, titres, contenus) est nettoyée avant stockage.
2. **Validation Zod obligatoire** — Aucun JSON ne passe sans validation par `FactSchema`.
3. **Pas d'exécution de code** — L'agent ne compile ni n'exécute jamais de code provenant de sources externes.
4. **URLs whitelistées** — Seuls les domaines de confiance sont acceptés pour l'extraction automatique.

### Limites de Coût

| Ressource | Limite | Action si dépassée |
|-----------|--------|-------------------|
| Tokens par requête | 8 000 tokens max | Découper en sous-requêtes |
| Requêtes API par session | 50 max | Pause + demande Supervisor |
| Sources par fait | 10 max | Prioriser par fiabilité |
| Taille du contenu Markdown | 5 000 caractères max | Synthétiser |

### Limites de Jetons (Tokens)

- **Budget token par fait** : 2 000 tokens maximum pour la recherche + extraction
- **Budget token par synthèse** : 4 000 tokens maximum
- **Alerte** à 80% de la limite → notification au Supervisor

### Données Sensibles

- Ne **jamais** stocker d'informations personnelles identifiables (PII) non publiques.
- Les noms de personnes publiques sont acceptés uniquement dans un contexte factuel documenté.
- Les documents classifiés ou obtenus illégalement sont **exclus**.

### Protocole d'Escalade

```
SI source suspecte (phishing, malware, contenu illicite)
  → STOP immédiat
  → Log dans SHIELD_INCIDENTS.log
  → Notification Supervisor
  → Fait marqué comme REJETÉ

SI contradiction majeure entre sources fiables
  → Pause recherche
  → Documenter les deux versions
  → Escalade Supervisor pour arbitrage
```

### Domaines Autorisés pour Extraction

- `*.gov`, `*.edu`, `*.org` (institutions)
- `reuters.com`, `apnews.com`, `afp.com` (agences de presse)
- `arxiv.org`, `scholar.google.com` (académique)
- `github.com`, `stackoverflow.com` (technique)
- Médias de référence vérifiés (liste maintenue par Supervisor)
