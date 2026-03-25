# 🚀 Deploy Smart Farm Management System

## Quick Deployment Options

### Option 1: Railway (Recommended - Free & Easy)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/smart-farm.git
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect it's a Node.js app
   - Add environment variable: `SESSION_SECRET` (any random string)
   - Click "Deploy"

3. **Your app will be live at:** `https://your-app-name.up.railway.app`

---

### Option 2: Vercel (Free & Fast)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts** - Vercel will detect Node.js and deploy automatically

---

### Option 3: Heroku (Paid but Professional)

1. **Install Heroku CLI**
   ```bash
   # Download from devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-smart-farm
   heroku config:set SESSION_SECRET=your-secret-key
   git push heroku main
   ```

---

## Environment Variables

Set these in your hosting platform:

| Variable | Value | Required |
|----------|-------|----------|
| `SESSION_SECRET` | Any random string | ✅ |
| `NODE_ENV` | `production` | Optional |
| `PORT` | Auto-set by platform | Optional |

---

## Database Notes

- **SQLite database is automatically created** on first run
- **Data persists** between deployments on Railway
- **Backup your database** regularly by downloading the `.db` file

---

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login/logout
- [ ] Add sample data (crops, livestock, etc.)
- [ ] Verify all pages load correctly
- [ ] Test mobile responsiveness
- [ ] Check currency shows as KSH

---

## Custom Domain (Optional)

### Railway
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

---

## Troubleshooting

**"Application Error"**
- Check logs in your hosting platform
- Ensure all dependencies are installed
- Verify environment variables are set

**"Database Locked"**
- Restart the application
- Check if multiple instances are running

**"Session Issues"**
- Clear browser cookies
- Verify SESSION_SECRET is set
- Check cookie settings

---

## Security Notes

- Change the default session secret
- Use HTTPS in production (automatic on most platforms)
- Regular backups of your database
- Monitor for suspicious activity

---

## Support

If you encounter issues:
1. Check the platform's logs
2. Verify environment variables
3. Ensure your repository has all files
4. Test locally first with `npm start`

**Your Smart Farm Management System will be live and accessible to users worldwide! 🌍🚜**
