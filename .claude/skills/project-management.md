# Skill: Project Management
# Agent: Agent Principal (Supervisor)
# Description: Gestion de projet et coordination des agents

## Capabilities
- Coordination des agents Research Digger, Code Architect
- Validation des livrables
- Tests et qualité
- Déploiement

## Tools
- git: Gestion du repository
- npm: Build et tests
- vercel: Déploiement
- github: Pull requests, issues

## Workflow
1. Recevoir demande utilisateur
2. Découper en tâches pour les agents
3. Suivre la progression
4. Valider les livrables
5. Tester en local (npm run build)
6. Pousser sur GitHub
7. Déployer sur Vercel

## Commands
```bash
# Test local
npm run type-check
npm run build

# Git
git add -A
git commit -m "message"
git push origin main

# Vercel
vercel --prod
```
