# 🚀 Netlify Deployment Guide

## ✅ Issues Fixed

The following issues have been resolved to make your Netlify deployment work:

1. **TypeScript Error**: Removed invalid `models` property from Genkit configuration
2. **Next.js Config**: Updated deprecated `experimental.serverComponentsExternalPackages` to `serverExternalPackages`
3. **PDF Parser**: Fixed import issues and added proper type declarations
4. **Build Configuration**: Optimized for Netlify deployment

## 🚀 Deploy to Netlify

### Option 1: Netlify CLI (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   npm run deploy:netlify
   ```

### Option 2: Netlify Dashboard

1. **Push your code to GitHub**
2. **Go to [Netlify](https://app.netlify.com/)**
3. **Click "New site from Git"**
4. **Connect your GitHub repository**
5. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** `18`

## 🔧 Environment Variables

**IMPORTANT:** Set these in your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   NODE_VERSION=18
   ```

## 📋 Pre-Deployment Checklist

- [ ] ✅ Build succeeds locally: `npm run build`
- [ ] ✅ All TypeScript errors resolved
- [ ] ✅ Environment variables configured
- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Netlify account connected

## 🚨 Common Netlify Issues

### Build Fails with TypeScript Errors
```bash
# Fix locally first
npm run typecheck
npm run build
```

### Environment Variables Not Loading
- Check Netlify dashboard → Site settings → Environment variables
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Function Timeout
- API routes are limited to 10 seconds by default
- Consider optimizing heavy operations
- Use background jobs for long-running tasks

### Memory Issues
- Netlify has memory limits for build process
- Optimize dependencies and imports
- Remove unused packages

## 🔍 Debugging Netlify Builds

### Check Build Logs
1. Go to Netlify dashboard
2. Click on your site
3. Go to **Deploys** tab
4. Click on failed deploy
5. Check build logs for errors

### Local Build Test
```bash
# Test build locally before deploying
npm run build

# Test production server locally
npm run start
```

### Environment Variable Test
```bash
# Test if environment variables are loaded
node -e "console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET')"
```

## 📱 Netlify Configuration

Your `netlify.toml` is configured with:
- ✅ Correct build command
- ✅ Proper publish directory
- ✅ Node.js version 18
- ✅ Next.js plugin
- ✅ Function configuration for API routes

## 🎯 Next Steps After Deployment

1. **Test your deployed site**
2. **Verify API routes work**
3. **Check environment variables**
4. **Monitor build logs**
5. **Set up custom domain (optional)**

## 🆘 Still Having Issues?

1. **Check this troubleshooting guide**
2. **Review Netlify build logs**
3. **Ensure local build works**
4. **Verify environment variables**
5. **Check Netlify status page**

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Environment Variables](https://docs.netlify.com/environment-variables/get-started/)
