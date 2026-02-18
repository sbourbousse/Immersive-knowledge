# 🧠 Immersive Knowledge Architecture

> Architecture de l'Information Immersive : Timeline interactive sur l'évolution de l'IA Générative

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sbourbousse/Immersive-knowledge)

## 🎯 À propos

Cette application présente une **timeline immersive** de l'évolution de l'Intelligence Artificielle Générative, de GPT-1 (2018) aux agents autonomes (2025).

### Fonctionnalités

- 📜 **Timeline horizontale** avec scroll immersif
- 🔍 **Focus Mode** pour explorer les détails
- ⚖️ **Mode Comparaison** (IA vs Régulation)
- 📊 **15 faits historiques** validés avec sources
- ⚡ **Animations 60 FPS** avec GSAP

## 🚀 Déploiement One-Click

Clique sur le bouton ci-dessus ou :

```bash
# Cloner le repo
git clone https://github.com/sbourbousse/Immersive-knowledge.git
cd Immersive-knowledge

# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Build pour prod
npm run build
```

## 🏗️ Stack Technique

- **Next.js 14** (App Router)
- **TypeScript** strict
- **GSAP** + ScrollTrigger
- **Tailwind CSS**
- **Lenis** (smooth scroll)

## 📁 Structure

```
├── app/                 # Next.js App Router
├── components/          # Composants React
│   ├── Hero/           # Animation d'entrée
│   ├── Timeline/       # Timeline horizontale
│   ├── TimelineComparison/  # Mode comparaison
│   └── FocusMode/      # Modal exploration
├── facts/              # 15 faits JSON
├── hooks/              # Hooks personnalisés
└── lib/                # Utilitaires
```

## 📊 Données

15 faits couvrant :
- 🟦 **Technologie** (GPT-1 à GPT-4, Sora, Agents)
- 🟩 **Économie** (Investissements, coûts)
- 🟥 **Régulation** (EU AI Act, interdictions)
- 🟪 **Société** (Grèves Hollywood, adoption)

## 🎨 Design

- Dark mode immersif
- Animations fluides 60 FPS
- Accessibilité (reduced-motion)
- Responsive

---

*Généré par un système multi-agents autonomes* 🤖
