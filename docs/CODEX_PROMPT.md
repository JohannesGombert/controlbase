# Prompt for Codex / Claude Code

Use this prompt after placing the ControlBase manifest files into a new repository.

---

You are developing ControlBase, a private German-language personal control dashboard.

Read these files first:

1. `AGENTS.md`
2. `manifest.json`
3. `docs/PRD.md`
4. `docs/ARCHITECTURE.md`
5. `docs/UI_SPEC.md`
6. `docs/TASKS.md`
7. `docs/SECURITY.md`
8. `supabase/schema.sql`
9. `supabase/rls_policies.sql`

Build the MVP only. Do not add extra features beyond the MVP unless explicitly requested.

Use this stack:

- React + Vite
- TailwindCSS
- react-router-dom
- Supabase Auth + PostgreSQL
- Recharts
- lucide-react
- date-fns
- Netlify-compatible build

The UI language must be German.

Core product question:

> Bin ich heute auf Kurs?

MVP pages:

1. Dashboard
2. Heute
3. Käufe
4. Ideen
5. Wochenreview
6. Login

Implement in this order:

1. Project setup
2. Supabase client
3. Auth and protected routes
4. Layout and navigation
5. Today page check-in
6. Today page Top 3
7. Dashboard summary
8. Purchase waitlist
9. Ideas parking lot
10. Weekly review
11. Basic charts
12. Netlify deployment readiness

Important constraints:

- Do not expose secrets.
- Use env vars only.
- Assume RLS is enabled.
- Do not create public data access.
- Keep forms short and mobile-first.
- Daily check-in must take less than 2 minutes.
- Avoid over-engineering.
- Keep copy direct and strict, not fluffy.

When implementing, create small reusable components and service files. Keep business logic readable.

After each major step, update a short checklist in the repository.
