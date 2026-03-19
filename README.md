# eblog.theewn

A full-stack blog platform built with Next.js 16. Admins manage content through a dashboard; an AI agent (Claude) automatically drafts blog posts from Google Trends daily, which admins review and publish.

## Features

- **Public blog** — SEO-optimised listing and individual post pages with OG/Twitter meta and JSON-LD schema
- **Tag filtering** — click-to-filter by topic on the home page
- **Admin dashboard** — create, edit, approve, and delete posts; protected by JWT auth
- **AI-generated drafts** — Claude reads Google Trends daily at 9 AM UTC, writes a full blog post, and saves it as `pending` for admin review
- **Markdown authoring** — posts are written in Markdown, converted to HTML, and stored in MongoDB
- **Automatic admin seeding** — first admin account is created from env vars on server startup (no manual setup step)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI | MUI v6 |
| Database | MongoDB + Mongoose |
| Auth | Custom JWT (`jose` + `bcryptjs`) |
| AI | Anthropic Claude (`claude-opus-4-6`) |
| Trends | Google Trends RSS + `fast-xml-parser` |
| Markdown | `marked` |
| Deployment | Vercel (cron via `vercel.json`) |

## Getting Started

### Prerequisites

- Node.js 20+
- A running MongoDB instance (local or Atlas)
- Anthropic API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret — `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Email for the initial admin account |
| `ADMIN_PASSWORD` | Password for the initial admin account |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `CRON_SECRET` | Secret used to authenticate the cron endpoint |
| `NEXT_PUBLIC_BASE_URL` | Full base URL (e.g. `https://yourdomain.com`) |

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The first admin account is created automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD` when the server starts. No manual setup call needed.

### 4. Log in

Visit [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with your admin credentials.

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages with Navigation + Footer layout
│   │   ├── page.tsx        # Home — blog listing with tag filter
│   │   └── blog/[slug]/    # Individual blog post
│   ├── admin/              # Login page
│   ├── admin/dashboard/    # Protected admin area
│   │   └── blogs/          # Blog management (list, new, edit)
│   └── api/
│       ├── auth/           # Login / logout
│       ├── blogs/          # CRUD endpoints
│       ├── cron/           # AI blog generation (called by Vercel Cron)
│       └── setup/          # Manual admin creation fallback
├── components/
│   ├── admin/              # AdminSidebar, BlogTable, MarkdownEditor
│   ├── blog/               # BlogCard, TagFilter
│   └── ui/                 # Navigation, Footer
├── lib/                    # mongodb, auth, claude, trends helpers
├── models/                 # Mongoose models (Blog, User)
└── instrumentation.ts      # Admin seeding on startup
```

## Admin Workflow

1. AI drafts are saved with `status: pending` and `origin: ai`
2. Admin reviews drafts at **Pending Review** in the sidebar
3. Approving a post sets `status: published`, records `publishedAt`, and sets `author` to the reviewer's email
4. Published posts appear on the public site immediately

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables in the Vercel dashboard
3. The cron job in `vercel.json` runs `/api/cron/generate-blogs` daily at 09:00 UTC — set `CRON_SECRET` to the same value in both `.env.local` and the Vercel dashboard

```json
{
  "crons": [{ "path": "/api/cron/generate-blogs", "schedule": "0 9 * * *" }]
}
```
