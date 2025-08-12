# 🔧 Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Build Errors

#### TypeScript Errors
```bash
# Error: Type 'X' is not assignable to type 'Y'
npm run typecheck
```
**Solution**: Fix TypeScript errors or temporarily enable `ignoreBuildErrors: true` in `next.config.ts`

#### ESLint Errors
```bash
# Error: ESLint found X problems
npm run lint
```
**Solution**: Fix linting errors or temporarily enable `ignoreDuringBuilds: true` in `next.config.ts`

#### Memory Issues During Build
```bash
# Error: JavaScript heap out of memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Environment Variable Issues

#### Missing API Key
```bash
# Error: GEMINI_API_KEY is not defined
```
**Solution**: 
1. Create `.env.local` file
2. Add `GEMINI_API_KEY=your_actual_key`
3. Restart development server

#### Environment Variables Not Loading
```bash
# Error: process.env.GEMINI_API_KEY is undefined
```
**Solution**: 
- Ensure `.env.local` exists (not `.env`)
- Restart development server after changes
- Check file permissions

### Deployment Issues

#### Vercel Deployment Fails
```bash
# Error: Build failed
```
**Solutions**:
1. Check Vercel dashboard for build logs
2. Ensure environment variables are set in Vercel
3. Check Node.js version compatibility
4. Run `npm run build` locally first

#### Netlify Deployment Fails
```bash
# Error: Build command failed
```
**Solutions**:
1. Check Netlify build logs
2. Ensure `netlify.toml` is configured correctly
3. Set environment variables in Netlify dashboard
4. Check Node.js version (use 18+)

#### Static Export Issues
```bash
# Error: Static export failed
```
**Solutions**:
1. Remove `output: 'standalone'` from `next.config.ts`
2. Use `next export` instead of `next build`
3. Check for server-side code that can't be exported

### Runtime Issues

#### Hydration Errors
```bash
# Error: Hydration failed because the server rendered HTML didn't match
```
**Solution**: 
- Add `suppressHydrationWarning` to HTML element
- Use `useEffect` for client-side only code
- Check for date/time or locale differences

#### API Route Errors
```bash
# Error: API route not found
```
**Solution**:
- Ensure API routes are in `src/app/api/` directory
- Check file naming conventions
- Verify route handlers export correctly

#### CORS Issues
```bash
# Error: CORS policy blocked request
```
**Solution**:
- Add CORS headers to API routes
- Check domain configuration
- Use proper CORS middleware

### Dependency Issues

#### Package Installation Fails
```bash
# Error: npm install failed
```
**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Check Node.js version compatibility

#### Version Conflicts
```bash
# Error: Peer dependency conflicts
```
**Solutions**:
1. Use `npm ls` to identify conflicts
2. Update packages to compatible versions
3. Use `npm audit fix`
4. Check for duplicate packages

### Performance Issues

#### Slow Build Times
```bash
# Build takes too long
```
**Solutions**:
1. Enable Turbopack: `next dev --turbopack`
2. Use `.next` cache directory
3. Optimize imports and dependencies
4. Consider using `next-bundle-analyzer`

#### Large Bundle Size
```bash
# Bundle size too large
```
**Solutions**:
1. Use dynamic imports: `import dynamic from 'next/dynamic'`
2. Analyze bundle with `@next/bundle-analyzer`
3. Remove unused dependencies
4. Use tree shaking effectively

## 🛠️ Debugging Commands

### Local Development
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check environment variables
echo $GEMINI_API_KEY

# Run with debug logging
DEBUG=* npm run dev

# Check TypeScript
npm run typecheck

# Check linting
npm run lint
```

### Build and Deploy
```bash
# Clean build
npm run clean

# Build with verbose output
npm run build --verbose

# Test production build locally
npm run build && npm run start

# Check bundle size
npm run build && npx @next/bundle-analyzer
```

### Environment Checks
```bash
# Check if .env.local exists
ls -la .env*

# Check environment variable loading
node -e "console.log(process.env.GEMINI_API_KEY)"

# Test API key validity
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

## 📋 Pre-Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] Environment variables configured
- [ ] Build succeeds locally: `npm run build`
- [ ] Production server starts: `npm run start`
- [ ] API routes tested locally
- [ ] Environment variables set in deployment platform
- [ ] Domain and SSL configured (if applicable)

## 🆘 Getting Help

### Check Logs
1. **Local**: Check terminal output and browser console
2. **Vercel**: Check deployment logs in dashboard
3. **Netlify**: Check build logs in dashboard
4. **Browser**: Check Network tab and Console

### Common Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Google AI Documentation](https://ai.google.dev/docs)

### Still Stuck?
1. Check this troubleshooting guide
2. Search for similar issues online
3. Check GitHub issues for Next.js/Genkit
4. Provide detailed error logs when asking for help
