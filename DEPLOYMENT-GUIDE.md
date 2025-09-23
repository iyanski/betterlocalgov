# 🚀 Deployment Guide for Local Government Websites

This guide covers deploying your local government website to various platforms, with a focus on Vercel (recommended) and other alternatives.

## 🌟 Recommended: Deploy to Vercel

Vercel is the recommended platform for local government websites because it offers:

- Free hosting for public projects
- Automatic deployments from GitHub
- Global CDN for fast loading
- Easy custom domain setup
- Built-in analytics
- Zero configuration required

### Step 1: Prepare Your Repository

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Ensure your repository is public** (required for free Vercel hosting)

### Step 2: Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository**
5. **Configure project settings**

### Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. **Go to Settings → Environment Variables**
2. **Add the following variables:**

```env
VITE_GOVERNMENT_NAME=Your City/Municipality Name
VITE_GOVERNMENT_TYPE=City
VITE_REGION=Region VII
VITE_PROVINCE=Cebu
VITE_WEBSITE_URL=https://your-project.vercel.app
VITE_CONTACT_EMAIL=info@your-city.gov.ph
VITE_CONTACT_PHONE=(032) 123-4567
VITE_FACEBOOK_URL=https://facebook.com/your-government
VITE_TWITTER_URL=https://twitter.com/your-government
VITE_INSTAGRAM_URL=https://instagram.com/your-government
VITE_YOUTUBE_URL=https://youtube.com/your-government
VITE_SITE_DESCRIPTION=Official website of Your City/Municipality
VITE_SITE_KEYWORDS=government, local government, services, your city
```

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for deployment to complete** (usually 2-3 minutes)
3. **Your website will be available at** `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. **Go to Settings → Domains**
2. **Add your custom domain** (e.g., `your-city.gov.ph`)
3. **Follow DNS configuration instructions**
4. **Enable SSL certificate** (automatic with Vercel)

## 🔄 Automatic Deployments

Once connected, Vercel will automatically deploy:

- **Every push to main branch** → Production deployment
- **Pull requests** → Preview deployments
- **Branch pushes** → Preview deployments

## 📊 Vercel Analytics (Optional)

1. **Go to Analytics tab** in your Vercel dashboard
2. **Enable Web Analytics** (free tier available)
3. **View visitor statistics and performance metrics**

## 🌐 Alternative Deployment Options

### Option 1: Netlify

#### Manual Deployment

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Automatic Deployment

1. **Connect GitHub repository to Netlify**
2. **Set build command:** `npm run build`
3. **Set publish directory:** `dist`
4. **Add environment variables** in Netlify dashboard

### Option 2: GitHub Pages

#### Setup GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_GOVERNMENT_NAME: ${{ secrets.GOVERNMENT_NAME }}
          VITE_GOVERNMENT_TYPE: ${{ secrets.GOVERNMENT_TYPE }}
          # Add other environment variables

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Configure Repository

1. **Go to Settings → Pages**
2. **Select "GitHub Actions" as source**
3. **Add secrets** for environment variables

### Option 3: Traditional Web Hosting

#### Build and Upload

```bash
# Build the project
npm run build

# Upload dist/ folder to your web server
# via FTP, cPanel, or hosting provider's file manager
```

#### Server Requirements

- **Static file hosting** (Apache, Nginx, or similar)
- **HTTPS support** (SSL certificate)
- **Custom domain** capability
- **CDN** (recommended for performance)

## 🔧 Environment-Specific Configurations

### Development Environment

```env
# .env.local
VITE_GOVERNMENT_NAME=Your City (Development)
VITE_WEBSITE_URL=http://localhost:5173
VITE_CONTACT_EMAIL=dev@your-city.gov.ph
```

### Staging Environment

```env
# .env.staging
VITE_GOVERNMENT_NAME=Your City (Staging)
VITE_WEBSITE_URL=https://staging.your-city.gov.ph
VITE_CONTACT_EMAIL=staging@your-city.gov.ph
```

### Production Environment

```env
# .env.production
VITE_GOVERNMENT_NAME=Your City
VITE_WEBSITE_URL=https://your-city.gov.ph
VITE_CONTACT_EMAIL=info@your-city.gov.ph
```

## 🛡️ Security Considerations

### Environment Variables

- **Never commit** `.env.local` files
- **Use strong, unique** values for production
- **Rotate secrets** regularly
- **Limit access** to environment variables

### HTTPS and SSL

- **Always use HTTPS** in production
- **Configure HSTS** headers
- **Use secure cookies** if applicable
- **Regular security audits**

### Content Security

- **Validate all user inputs**
- **Sanitize content** before display
- **Use Content Security Policy** headers
- **Regular security updates**

## 📈 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
# Use WebP format when possible
# Compress images before upload
```

### CDN Configuration

- **Enable CDN** for static assets
- **Configure caching** headers
- **Use image optimization**
- **Enable compression**

### Monitoring

- **Set up uptime monitoring**
- **Monitor performance metrics**
- **Track error rates**
- **Regular performance audits**

## 🔄 Continuous Deployment

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variables Not Loading

- Check variable names (must start with `VITE_`)
- Verify values in deployment platform
- Restart deployment after changes

#### Routing Issues

- Configure redirects for SPA routing
- Check base URL configuration
- Verify all routes are accessible

#### Performance Issues

- Optimize images and assets
- Enable compression
- Use CDN for static files
- Monitor bundle size

### Getting Help

1. **Check deployment logs** in your platform dashboard
2. **Test locally** with production build: `npm run preview`
3. **Verify environment variables** are set correctly
4. **Check network connectivity** and DNS settings
5. **Contact support** for your hosting platform

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Content reviewed and updated
- [ ] Images optimized and compressed
- [ ] Links tested and working
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Analytics tracking set up
- [ ] Backup strategy in place
- [ ] Monitoring configured

## 🎯 Post-Deployment Tasks

1. **Test all functionality** on the live site
2. **Verify all links** are working
3. **Check mobile responsiveness**
4. **Test form submissions** (if any)
5. **Verify analytics** are tracking
6. **Set up monitoring** and alerts
7. **Create backup** of working configuration
8. **Document deployment** process for team

---

**Remember**: Always test your deployment in a staging environment before going live with production data.
