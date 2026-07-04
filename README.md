# ControlBase

ControlBase ist ein privates Web-Dashboard für Gesundheit, Disziplin, Finanzen/Käufe, Ideen-Parkplatz und CEO-Fokus.

Die Kernfrage der App lautet:

> Bin ich heute auf Kurs?

Dieses Repository ist als Startpunkt für Entwicklung mit Claude Code, Codex oder einem Entwickler gedacht.

## Ziel

Ein kostenlos hostbares MVP mit:

- React + Vite
- TailwindCSS
- Supabase Auth + PostgreSQL
- Netlify Hosting
- deutscher Oberfläche
- Mobile-first Bedienung

## MVP-Seiten

1. Dashboard
2. Heute
3. Käufe
4. Ideen
5. Wochenreview

## Setup grob

```bash
npm create vite@latest controlbase -- --template react
cd controlbase
npm install
npm install @supabase/supabase-js react-router-dom recharts lucide-react date-fns
npm install -D tailwindcss @tailwindcss/vite
```

Dann Supabase-Projekt erstellen, SQL in `supabase/schema.sql` und `supabase/rls_policies.sql` ausführen und `.env.example` nach `.env.local` kopieren.

## Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Environment variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Optional WHOOP preparation

This package now includes a prepared WHOOP integration concept, but WHOOP is intentionally not part of the MVP implementation path.

Relevant files:

- `docs/WHOOP_INTEGRATION.md`
- `docs/WHOOP_TASKS.md`
- `supabase/whoop_schema.sql`

Use `VITE_ENABLE_WHOOP=false` until the base daily check-in workflow is stable.

## Additional Preparation Included

This package also includes ready-to-build preparation files:

- `docs/IMPLEMENTATION_BACKLOG.md` — ordered build backlog for Claude Code/Codex
- `docs/UX_COPY_DE.md` — German UI text and warning messages
- `docs/PWA_PREP.md` — later installable web app preparation
- `docs/NOTIFICATIONS_SPEC.md` — reminder rules for later
- `docs/DATA_DICTIONARY.md` — field definitions
- `docs/ACCEPTANCE_TESTS.md` — MVP completion checklist
- `docs/GITHUB_ISSUES.md` — copyable GitHub issue list
- `docs/FEATURE_FLAGS.md` — environment-driven feature flags
- `netlify.toml` — Netlify deployment config
- `package.template.json` — package dependency template
- `supabase/seed_example.sql` — local test-data example
