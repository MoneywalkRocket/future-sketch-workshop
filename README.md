# Future Sketch Workshop

A workshop tool for teams to sketch and visualize their app's future in 1, 3, or 5 years.
Draw a rough UI sketch, describe your vision, and let AI refine it into a polished concept.

## Features

- **Three vision modes**: 1 Year (near-term), 3 Years (evolution), 5 Years (visionary)
- **Drawing canvas**: Brush size slider, color picker (8 presets + custom), undo/redo, clear, grid toggle
- **AI refinement**: Sends your sketch to Gemini API to generate a polished UI mock
- **PNG export**: Download the refined image with your comment, timestamp, and mode label burned in
- **Mobile-first**: Works on iPhone Safari, Android Chrome, and desktop
- **Privacy-first**: No server storage, everything stays in-browser (sessionStorage)

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS 3
- HTML Canvas (custom, no heavy dependencies)
- Google Gemini API (server-side only)

## Getting Started

### Prerequisites

- Node.js >= 18
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for image generation |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |

## Architecture

```
src/
├── app/
│   ├── page.tsx                      # Mode selection (1y/3y/5y)
│   ├── draw/[mode]/page.tsx          # Drawing canvas + prompt input
│   ├── result/page.tsx               # Result viewer + export
│   └── api/gemini/refine/route.ts    # Server-side Gemini proxy
├── components/
│   ├── ModeSelection.tsx             # Landing page cards
│   ├── DrawingCanvas.tsx             # Full drawing tool with controls
│   ├── PromptForm.tsx                # Vision description + comment inputs
│   └── ResultViewer.tsx              # Refined image display + download
├── lib/
│   ├── prompt-builder.ts             # Assembles Gemini prompt from mode + user input
│   ├── rate-limit.ts                 # In-memory IP-based rate limiter
│   └── export-png.ts                 # Merges image + comment into downloadable PNG
└── types/
    └── index.ts                      # Mode types, configs, validation
```

## Security

- **API key is server-side only**: The Gemini API key is never sent to the browser. All AI calls go through `/api/gemini/refine`.
- **Rate limiting**: 30 requests per 10 minutes per IP to prevent abuse.
- **Input validation**: Image size capped at ~5MB, prompt capped at 500 chars.
- **No data persistence**: No database, no file storage. Drawings exist only in the browser.

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# GEMINI_API_KEY = your_key
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Troubleshooting

| Issue | Solution |
|---|---|
| "AI service not configured" | Make sure `GEMINI_API_KEY` is set in `.env.local` and restart the dev server |
| "Rate limit exceeded" | Wait a few minutes (30 req / 10 min limit) |
| "Image too large" | Simplify your drawing or clear and redraw |
| AI returns no image | Try adding more detail to your sketch or a more descriptive prompt |
| Canvas doesn't respond to touch | Make sure you're using a modern mobile browser (Safari 15+, Chrome 90+) |
| Build fails on Node 16 | Upgrade to Node.js 18+ |

## Testing

```bash
# Run all tests
npm test

# Tests cover:
# - Prompt builder (correct assembly for each mode)
# - Rate limiter (allows/blocks correctly, per-IP isolation)
# - Type validation (mode validation, config completeness)
```

## License

ISC
