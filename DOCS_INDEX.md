# FaceVital Documentation Index

Welcome! This file helps you find the right documentation for your needs.

## 🚀 Getting Started (Start Here!)

### First Time Users
1. **[QUICKSTART.md](./QUICKSTART.md)** ⭐ START HERE
   - 2-minute local setup
   - Deployment in 5 minutes
   - Basic troubleshooting

### Want to Deploy?
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide
  - Vercel (recommended)
  - Docker containers
  - Self-hosted servers
  - Production checklist

## 📚 Main Documentation

### Overview & Features
- **[README.md](./README.md)** - Complete documentation
  - All features explained
  - How it works (technical)
  - Browser requirements
  - Performance notes
  - Troubleshooting guide

### For Developers
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview
  - Tech stack details
  - File structure
  - Customization guide
  - Performance metrics

### Converting from Flask
- **[MIGRATION.md](./MIGRATION.md)** - Flask → Next.js migration
  - What changed
  - Architecture comparison
  - Performance improvements
  - What we kept/improved

## 🛠️ Configuration Files

### Build & Development
```
tsconfig.json           TypeScript configuration
tailwind.config.ts      Tailwind CSS configuration
next.config.mjs         Next.js configuration
.eslintrc.json          ESLint configuration
postcss.config.js       PostCSS configuration
```

### Deployment
```
vercel.json             Vercel deployment config
Dockerfile              Docker image definition
docker-compose.yml      Docker Compose setup
.dockerignore           Docker ignore patterns
.gitignore              Git ignore patterns
.env.example            Environment variables template
```

### Package Management
```
package.json            npm dependencies & scripts
package-lock.json       Locked dependency versions
```

## 📁 Project Structure

```
📂 Source Code
├── app/                 Next.js app directory
│   ├── layout.tsx      Root layout component
│   ├── page.tsx        Home page
│   ├── head.tsx        Meta tags & scripts
│   └── globals.css     Global styles
├── components/          React components
│   ├── face-vital-monitor.tsx      Main app (450 lines)
│   ├── video-feed.tsx              Camera display
│   ├── metrics-display.tsx         Health metrics
│   ├── trend-charts.tsx            Charts
│   └── alert-box.tsx               Notifications
└── lib/                 Utilities
    ├── signal-processing.ts        PPG & filtering (190 lines)
    ├── health-metrics.ts           Calculations (290 lines)
    └── pdf-generator.ts            PDF export (220 lines)

📂 Configuration
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── .eslintrc.json

📂 Deployment
├── Dockerfile
├── docker-compose.yml
├── vercel.json
└── .dockerignore

📂 Documentation
├── README.md           Main documentation
├── QUICKSTART.md      Getting started
├── DEPLOYMENT.md      Deployment guide
├── MIGRATION.md       Flask → Next.js
├── PROJECT_SUMMARY.md Overview
└── DOCS_INDEX.md      This file
```

## 🎯 Common Tasks

### "I want to..."

#### Run locally
→ See **[QUICKSTART.md](./QUICKSTART.md)** section "Local Development"

#### Deploy to production
→ See **[DEPLOYMENT.md](./DEPLOYMENT.md)**

#### Understand the code
→ See **[README.md](./README.md)** and **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**

#### Know what changed from Flask
→ See **[MIGRATION.md](./MIGRATION.md)**

#### Customize colors/styling
→ See **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** section "Customization"

#### Change health calculations
→ See `lib/health-metrics.ts` with inline comments

#### Add new features
→ Create component in `components/` or utility in `lib/`

#### Fix deployment issues
→ See **[DEPLOYMENT.md](./DEPLOYMENT.md)** section "Troubleshooting"

#### Debug camera problems
→ See **[QUICKSTART.md](./QUICKSTART.md)** or **[README.md](./README.md)** troubleshooting

#### Use with Docker
→ See **[DEPLOYMENT.md](./DEPLOYMENT.md)** section "Option 2: Self-Hosted (Docker)"

## 📊 Documentation Overview

| Document | Length | Audience | Time |
|----------|--------|----------|------|
| QUICKSTART | 270 lines | Everyone | 5 min |
| README | 210 lines | Users/Devs | 15 min |
| DEPLOYMENT | 215 lines | DevOps/Deployers | 20 min |
| MIGRATION | 330 lines | Flask users | 10 min |
| PROJECT_SUMMARY | 345 lines | Developers | 15 min |

## 🔗 External Resources

### Official Docs
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MediaPipe Documentation](https://mediapipe.dev)

### Deployment Platforms
- [Vercel Platform](https://vercel.com)
- [Docker Documentation](https://docs.docker.com)
- [Railway.app](https://railway.app)
- [Netlify](https://docs.netlify.com)

### Learning Resources
- [Next.js Learning Path](https://nextjs.org/learn)
- [React Hooks Guide](https://react.dev/reference/react)
- [Vercel Tutorials](https://vercel.com/docs)

## 💡 Quick Reference

### Commands

```bash
# Development
npm install              Install dependencies
npm run dev              Start dev server

# Production
npm run build            Build for production
npm start                Start production server
npm run lint             Check code quality
npm run type-check       Check TypeScript

# Docker
docker build -t facevital .
docker run -p 3000:3000 facevital
docker-compose up
```

### Environment Variables

```bash
NEXT_PUBLIC_APP_URL     App URL (auto-set on Vercel)
NODE_ENV                development | production
```

### Important Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root HTML structure |
| `app/page.tsx` | Home page JSX |
| `app/globals.css` | Global styles |
| `package.json` | Dependencies |
| `lib/health-metrics.ts` | All calculations |
| `components/face-vital-monitor.tsx` | Main app |

## 🐛 Troubleshooting Quick Links

### Camera Issues
- [README: Camera Not Working](./README.md#troubleshooting)
- [QUICKSTART: Camera Not Working](./QUICKSTART.md#troubleshooting)

### Face Detection
- [README: Face Not Detecting](./README.md#troubleshooting)
- [QUICKSTART: Face Not Detecting](./QUICKSTART.md#troubleshooting)

### Inaccurate Metrics
- [README: Inaccurate Metrics](./README.md#troubleshooting)
- [QUICKSTART: Performance Tips](./QUICKSTART.md#performance-tips)

### Build Errors
- [QUICKSTART: Build Fails](./QUICKSTART.md#build-fails)
- [DEPLOYMENT: Troubleshooting](./DEPLOYMENT.md#troubleshooting)

### Deployment Issues
- [DEPLOYMENT: Troubleshooting](./DEPLOYMENT.md#troubleshooting)
- [DEPLOYMENT: Common Issues](./DEPLOYMENT.md)

## 📞 Getting Help

### Documentation First
1. Check table of contents above
2. Search for your topic
3. Read relevant document section

### Debugging
1. Check browser console for errors
2. Enable verbose logging
3. Check GitHub issues
4. Review troubleshooting sections

### Report Issues
- GitHub Issues (if public repo)
- Contact maintainer
- Check existing issues first

## 📋 Document Reading Order

### First Time?
1. This file (you are here) 👈
2. QUICKSTART.md (5 min)
3. README.md (15 min)

### Going Production?
1. DEPLOYMENT.md (20 min)
2. Deployment platform docs
3. Testing & monitoring setup

### Developing?
1. PROJECT_SUMMARY.md (15 min)
2. Source code structure
3. lib/ and components/ files

### Migrating from Flask?
1. MIGRATION.md (10 min)
2. Review new file structure
3. Start development

## ✅ Pre-Deployment Checklist

- [ ] Read QUICKSTART.md
- [ ] Run locally successfully: `npm run dev`
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Choose deployment method
- [ ] Review DEPLOYMENT.md
- [ ] Follow platform-specific steps
- [ ] Test in production
- [ ] Monitor for errors

## 🎓 Learning Path

### Beginner
1. QUICKSTART.md - Get running
2. README.md - Understand features
3. Try local setup

### Intermediate
1. PROJECT_SUMMARY.md - Architecture
2. Explore components/
3. Try customization

### Advanced
1. MIGRATION.md - Deep dive
2. Study lib/ files
3. Contribute improvements

---

## Next Steps

**Choose your path:**

- 🚀 **Just want to use it?** → [QUICKSTART.md](./QUICKSTART.md)
- 🌐 **Want to deploy?** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- 💻 **Want to develop?** → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- 🔄 **Coming from Flask?** → [MIGRATION.md](./MIGRATION.md)
- 📖 **Need everything?** → [README.md](./README.md)

Happy developing! 🫀
