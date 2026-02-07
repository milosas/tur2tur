# Baltic Tournament Planner (turnyru-lenteles)

## Project Overview

Tournament management platform for the Baltic market (Lithuania, Latvia, Estonia).
Supports 4 languages: Lithuanian (LT), Latvian (LV), Estonian (EE), English (EN).
Organizers create tournaments, manage teams, generate brackets, and track match results.

## Tech Stack

- **Framework**: Next.js 16 App Router (TypeScript)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **i18n**: next-intl (LT, LV, EE, EN)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Deployment**: Vercel (planned)

## Current Phase

**Phase 1 — Skeleton + Auth + i18n** (in-progress)

## Project Structure

```
src/
├── app/
│   └── [locale]/          # Locale-based routing (lt, lv, ee, en)
│       ├── layout.tsx      # Root layout with providers
│       ├── page.tsx        # Landing page
│       ├── auth/           # Auth pages (login, register, callback)
│       └── dashboard/      # Protected routes (future)
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── Header.tsx          # Navigation + language switcher + auth
│   └── Footer.tsx          # Site footer
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       ├── server.ts       # Server-side Supabase client
│       └── middleware.ts   # Supabase session refresh helper
├── i18n/
│   ├── request.ts          # next-intl request config
│   └── routing.ts          # Locale routing config
└── middleware.ts            # Root middleware (i18n + auth session)

messages/                    # Translation JSON files
├── lt.json
├── lv.json
├── ee.json
└── en.json

public/                      # Static assets
```

## Database Schema (Supabase)

```sql
-- User profiles (extends Supabase auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'lt',
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Tournaments
tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  format TEXT CHECK (format IN ('round_robin', 'single_elimination', 'double_elimination')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'in_progress', 'completed')),
  max_teams INT,
  start_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Teams
teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  captain_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Tournament-Team registrations
tournament_teams (
  tournament_id UUID REFERENCES tournaments(id),
  team_id UUID REFERENCES teams(id),
  seed INT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tournament_id, team_id)
)

-- Matches
matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  round INT NOT NULL,
  match_number INT NOT NULL,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_score INT,
  away_score INT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

## Conventions

### Language
- All code (variables, functions, comments) in **English**
- All user-facing text goes through **next-intl** translation keys
- Never hardcode UI strings — always use `useTranslations('Namespace')`

### Components
- Use **shadcn/ui** as the base component library
- Style with **Tailwind CSS** utility classes
- Component files use PascalCase: `Header.tsx`, `LanguageSwitcher.tsx`

### Supabase
- Use `@supabase/ssr` package with client/server/middleware pattern
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- Middleware helper: `src/lib/supabase/middleware.ts`
- Environment variables in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### File Ownership (Agent Teams)
When using agent teams, each agent owns specific files to prevent conflicts:

| Agent | Owned Files |
|-------|-------------|
| i18n-agent | `src/i18n/`, `src/middleware.ts`, `messages/*.json`, `src/app/[locale]/layout.tsx` |
| auth-agent | `src/lib/supabase/`, `src/app/[locale]/auth/`, `.env.local` |
| ui-agent | `src/components/`, `src/app/[locale]/page.tsx` |

**Rule**: Do NOT edit files owned by another agent. If you need changes in another agent's files, document the requirement and coordinate.

**Dependency**: auth-agent must wait for i18n-agent to finish `src/middleware.ts` before adding auth middleware logic.

## Phase Plan

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Skeleton + Auth + i18n | in-progress |
| 2 | Tournament CRUD + Dashboard | todo |
| 3 | Team Management + Registration | todo |
| 4 | Bracket Generation + Match Tracking | todo |
| 5 | Real-time Updates + Notifications | todo |
| 6 | Polish + Deploy | todo |

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
