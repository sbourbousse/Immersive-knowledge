# 🚀 Déploiement One-Click Vercel

## Option 1 : Bouton Deploy (Recommandé)

Clique sur ce bouton :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsbourbousse%2FImmersive-knowledge&project-name=immersive-knowledge&repository-name=Immersive-knowledge)

## Option 2 : CLI Vercel

```bash
# Installe Vercel CLI si pas déjà fait
npm i -g vercel

# Dans le dossier du projet
cd Immersive-knowledge
vercel --prod
```

## Option 3 : Import depuis GitHub

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique **"Add New Project"**
3. Choisis **"Immersive-knowledge"** dans la liste
4. Vercel détecte automatiquement Next.js
5. Clique **Deploy**

---

## ⚙️ Configuration détectée automatiquement

- **Framework** : Next.js 14
- **Build Command** : `next build`
- **Output Directory** : `.next`
- **Node Version** : 18.x

Aucune config supplémentaire requise ! 🎉

---

## 📁 Structure du repo

```
Immersive-knowledge/
├── app/                 # Next.js App Router
├── components/          # React components (Hero, Timeline, FocusMode...)
├── facts/              # 15 faits historiques JSON
├── hooks/              # Custom hooks (useGSAP, useLenis)
├── lib/                # Utilities
├── types/              # TypeScript types
└── schemas/            # Zod validation schemas
```

---

## 🎨 Fonctionnalités

- 📜 Timeline horizontale immersive avec GSAP
- 🔍 Focus Mode pour explorer les détails
- ⚖️ Mode Comparaison (IA vs Régulation)
- 📊 15 faits historiques validés
- ⚡ Animations 60 FPS

---

**Une fois déployé, ton site sera accessible sur :** `https://immersive-knowledge.vercel.app`
