# FaceVital Quick Start Guide

Get FaceVital running in minutes on your local machine or in production.

## Local Development (2 minutes)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Steps

1. **Clone & Install**
   ```bash
   cd FaceVital-Next
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - Grant camera permissions when prompted

4. **Use the App**
   - Click "Start Camera"
   - Wait for green "Face Detected" badge
   - Click "Start Scan" and hold still for 30s
   - View real-time metrics
   - Download PDF report when complete

---

## Production Deployment

### Option A: Vercel (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Click "Deploy"
   - ✅ Live at `your-app.vercel.app`

### Option B: Docker

1. **Build Image**
   ```bash
   docker build -t facevital .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 facevital
   ```

3. **Or Use Docker Compose**
   ```bash
   docker-compose up
   ```

### Option C: Linux Server (Ubuntu/Debian)

1. **SSH into server**
   ```bash
   ssh user@your-server.com
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd FaceVital-Next
   npm install
   ```

4. **Build & Start**
   ```bash
   npm run build
   npm start
   ```

5. **Use PM2 for Auto-Restart**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "facevital" -- start
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Development Tips

### Code Structure
```
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utilities & calculations
│   ├── signal-processing.ts  # PPG & filtering
│   ├── health-metrics.ts     # Metric calculations
│   └── pdf-generator.ts      # PDF export
└── public/           # Static assets
```

### Key Files

- `components/face-vital-monitor.tsx` - Main component
- `lib/health-metrics.ts` - All health calculations
- `lib/signal-processing.ts` - Signal filtering & PPG extraction

### Running Tests
```bash
npm run type-check  # TypeScript check
npm run lint        # ESLint check
```

---

## Troubleshooting

### Camera Not Working
```
❌ Error: Camera access denied
✅ Solution: Check browser permissions, use HTTPS in production
```

### Face Not Detecting
```
❌ Problem: Green badge won't appear
✅ Solutions:
   - Improve lighting (soft, even light)
   - Position face more centrally
   - Move closer to camera
   - Clean camera lens
```

### MediaPipe Not Loading
```
❌ Error: "MediaPipe failed to load"
✅ Solutions:
   - Refresh page (may need 3-5s for scripts to load)
   - Check internet connection
   - Try different browser
   - Clear browser cache
```

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

---

## Performance Tips

### For Better Accuracy
- ✅ Use good lighting (window light is ideal)
- ✅ Keep face 30-45cm from camera
- ✅ Minimize facial movement during scan
- ✅ Ensure camera is clean
- ✅ Use a stable surface/tripod if possible

### For Better Performance
- ✅ Close other browser tabs
- ✅ Disable browser extensions
- ✅ Use modern browser (Chrome/Edge/Safari)
- ✅ Check internet speed (stable connection helps)

---

## Security Notes

- All processing happens in your browser (client-side only)
- No data is sent to any server
- Camera stream is only used during active session
- Clear local data by clearing browser cache/cookies
- Use HTTPS in production (Vercel does this automatically)

---

## Advanced Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Build Optimization
```bash
# Production build with analysis
npm run build
```

### Docker Deployment
See `DEPLOYMENT.md` for detailed Docker setup with Nginx, SSL, etc.

---

## Next Steps

1. ✅ Get app running locally
2. ✅ Test with your camera
3. ✅ Customize styling (Tailwind CSS in `app/globals.css`)
4. ✅ Deploy to Vercel/Docker/Server
5. ✅ Share with others!

---

## Support & Resources

- **Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **GitHub Issues**: Report bugs and request features
- **Next.js Docs**: https://nextjs.org/docs
- **MediaPipe Docs**: https://mediapipe.dev

---

## License

MIT - Free to use for personal and commercial projects

Happy scanning! 🫀
