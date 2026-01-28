# Argo Note - AI-Powered Blog Automation SaaS

Argo Note is an AI-powered blog automation platform that helps users create, manage, and publish SEO-optimized content for their WordPress sites.

## Features

### Phase 1: Infrastructure & Auth
- Google OAuth authentication via Supabase
- User management and profiles
- WordPress site provisioning (multisite on VPS)

### Phase 2: Core AI Pipeline
- **LLM Integration**: Gemini 2.0 Flash via LiteLLM proxy
- **Web Research**: Tavily API for real-time research
- **Product Analysis**: 5-phase AI pipeline (A-E)
- **Article Generation**: SEO-optimized content with source citations

### Phase 3: User Interface
- Responsive dashboard with navigation
- Site, product, and article management
- Review and publish workflow

### Phase 4: Automation
- Cron-based schedule execution
- Automated article generation and WordPress publishing

### Phase 5: Monetization
- Stripe subscription integration
- Trial, Starter, and Pro plans

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (Google OAuth)
- **Background Jobs**: Inngest
- **Payments**: Stripe
- **AI**: Gemini via LiteLLM, Tavily for search

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy and configure environment:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Start Inngest dev server (separate terminal):
   ```bash
   npx inngest-cli dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── onboarding/        # New user flow
├── components/ui/         # Reusable UI components
├── lib/                   # Core libraries
│   ├── ai/                # AI services
│   ├── inngest/           # Background functions
│   ├── prisma/            # Database
│   ├── stripe/            # Payments
│   └── wordpress/         # WP REST API
└── types/                 # TypeScript definitions
```

## Documentation

For detailed architecture and integration information, see:
- `docs/architecture/` - System architecture documents
- `docs/phases/` - Implementation phase details

## License

Private - All rights reserved.
