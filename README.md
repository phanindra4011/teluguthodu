# Telugu Thodu - AI Learning Assistant

An AI-powered learning assistant for Telugu students, built with Next.js, Genkit, and Google AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API key

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd teluguthodu
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Your app will be available at: http://localhost:9003

### Environment Variables

Create a `.env.local` file with:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:9003
```

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run deploy:vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `GEMINI_API_KEY`: Your Google AI API key

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   npm run deploy:netlify
   ```

3. **Set environment variables in Netlify dashboard**

### Option 3: Static Export

For static hosting (GitHub Pages, etc.):
```bash
npm run export
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check
- `npm run clean` - Clean build files
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run deploy:netlify` - Deploy to Netlify

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors:**
   ```bash
   npm run clean
   npm install
   npm run build
   ```

2. **Environment Variables:**
   - Ensure `.env.local` exists and has correct values
   - Check deployment platform environment variables

3. **Port Conflicts:**
   - Change port in `package.json` dev script if needed

### Local vs Global

- **Local**: Uses `.env.local` for environment variables
- **Global**: Set environment variables in deployment platform dashboard

## 📁 Project Structure

```
teluguthodu/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── ai/           # AI integration (Genkit)
│   ├── lib/          # Utilities and actions
│   └── hooks/        # Custom React hooks
├── public/            # Static assets
├── next.config.ts     # Next.js configuration
├── vercel.json        # Vercel deployment config
├── netlify.toml      # Netlify deployment config
└── package.json       # Dependencies and scripts
```

## 🚀 Features

- AI-powered chat interface
- Telugu language support
- File upload and processing
- Responsive design
- Dark/light theme
- Grade-specific learning

## 📝 License

This project is private and proprietary.
