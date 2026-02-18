# Skill: Research & Data Validation
# Agent: Research Digger
# Description: Recherche d'information et validation des faits

## Capabilities
- Recherche web approfondie
- Validation des sources (triangulation)
- Structuration des données (Atomes de Fait)
- Export JSON

## Output Format
```json
{
  "id": "uuid",
  "timestamp": 1234567890,
  "dateLabel": "Date lisible",
  "title": "Titre",
  "content": "Description",
  "categories": ["Catégorie"],
  "source": {
    "name": "Source",
    "url": "https://...",
    "reliabilityScore": 0.95
  },
  "metadata": {
    "importance": "high",
    "verificationStatus": "confirmed"
  }
}
```

## Standards
- Minimum 3 sources par fait complexe
- Sources vérifiables avec URLs
- Dates exactes
- Cross-références entre faits connexes
