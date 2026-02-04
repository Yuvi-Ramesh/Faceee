# FaceVital Deployment Guide

This guide covers how to deploy FaceVital to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository initialized
- GitHub account (for Vercel)

## Quick Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications with optimized performance.

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Convert to Next.js"
git push origin main
```

**Step 2: Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"

The application will be live at `your-app.vercel.app`

**Environment Variables:**
- Add `NEXT_PUBLIC_APP_URL` if needed (auto-configured by Vercel)

### Option 2: Self-Hosted (Docker)

Deploy to any server or cloud platform with Docker.

**Build Docker Image:**
```bash
docker build -t facevital:latest .
```

**Run Container:**
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  facevital:latest
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
```

### Option 3: Railway

1. Connect GitHub repository
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Next.js
5. Configure domain if needed

### Option 4: Netlify

**Note:** Netlify works with Next.js but requires adapter configuration.

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Deploy

## Production Build & Testing

### Local Production Build
```bash
npm run build
npm start
```

Visit `http://localhost:3000` to verify.

### Build Output
- `.next/` - Production build
- `public/` - Static assets
- All client-side processing happens in browser

## Performance Optimizations

The application includes:

✅ **Next.js Optimizations:**
- Image optimization
- Code splitting
- Automatic CSS minification
- Asset compression

✅ **Runtime Optimizations:**
- Client-side processing (no server API calls)
- Efficient signal processing
- Hardware-accelerated canvas rendering
- Lazy-loaded MediaPipe WASM

## Security Headers

Vercel and deployment configurations include:

- `Strict-Transport-Security`: Forces HTTPS
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Prevents clickjacking
- `Permissions-Policy`: Restricts camera/microphone access to same-origin

## HTTPS/SSL

- **Vercel**: Automatic SSL certificate
- **Docker**: Use nginx reverse proxy with Let's Encrypt
- **Self-hosted**: Use Cloudflare or similar

## Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records as shown

### Self-Hosted
Point DNS A record to your server IP and configure nginx/Apache.

## Monitoring

### Vercel Analytics
- Automatic Real User Monitoring (RUM)
- Performance metrics in dashboard
- Error tracking

### Self-Hosted
Consider:
- Sentry for error tracking
- Datadog/NewRelic for monitoring
- Prometheus + Grafana for metrics

## Troubleshooting

### Camera Not Working in Production
- Ensure HTTPS (required for getUserMedia)
- Check browser console for errors
- Verify permissions-policy headers

### MediaPipe Not Loading
- Check CDN availability
- Verify CORS headers
- Check browser console for 404s

### High Memory Usage
- Verify Vercel project tier
- Monitor with Vercel Analytics
- Check for memory leaks in Chrome DevTools

## Scaling Considerations

Since all processing is client-side:
- No database needed
- No API scaling required
- Bandwidth usage = static assets + CDN traffic
- Can handle unlimited concurrent users

## Backup & Updates

### Version Control
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Updating Dependencies
```bash
npm update
npm audit fix
npm run build
```

## Cost Estimates

- **Vercel Free Tier**: $0/month (good for personal use)
- **Vercel Pro**: $20/month (recommended for production)
- **Self-hosted VPS**: $5-20/month depending on provider
- **Docker Hub**: Free image hosting

## Support

For deployment issues:
1. Check [Next.js Deployment](https://nextjs.org/docs/deployment)
2. Review [Vercel Documentation](https://vercel.com/docs)
3. Open GitHub issue for bugs

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Click "Redeploy" on previous version

### Self-Hosted
```bash
git revert <commit-hash>
npm run build
npm start
```
