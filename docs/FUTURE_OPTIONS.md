# Future Options — ControlBase

These are optional future extensions. Do not implement in MVP unless explicitly requested.

## 1. PWA mode

Purpose:

- Install ControlBase on iPhone home screen.
- Make the app feel more native.

Features:

- `manifest.webmanifest`
- service worker
- app icon
- offline shell

## 2. Reminder system

Purpose:

- Reduce missed check-ins.

Options:

- Email reminders via Netlify Functions + scheduled functions
- Supabase Edge Functions
- Browser notifications via PWA
- Calendar reminders

Suggested reminders:

- Morning weigh-in
- Evening check-in
- Sunday weekly review
- CEO block reminder

## 3. Apple Health import

Purpose:

- Automatically import steps, weight, sleep if available.

Challenge:

- Web apps have limited direct Apple Health access.
- A native app or shortcut-based workaround may be needed.

Possible workaround:

- Apple Shortcut exports data to webhook.

## 4. WHOOP integration

Purpose:

- Import sleep, strain, recovery.

Requirements:

- WHOOP API access
- OAuth
- Backend function

## 5. Google Calendar integration

Purpose:

- Create and check CEO focus blocks.

Features:

- Schedule CEO blocks
- Detect missed blocks
- Weekly CEO adherence

## 6. Advanced finance module

Purpose:

- Track lifestyle budget and impulse purchases.

Features:

- Monthly lifestyle budget
- Categories
- No-buy days
- CSV import/export
- Investment checklist

## 7. AI weekly analysis

Purpose:

- Generate weekly pattern review.

Inputs:

- Check-ins
- Top 3 completion
- Purchase waitlist
- Weekly reviews

Output style:

- Direct
- Honest
- Specific
- German

Example output:

- "Du hast diese Woche nicht an Disziplin verloren, sondern an Abendstruktur."
- "Die zwei roten Tage hatten beide Alkohol + spätes Essen gemeinsam."

## 8. CEO module expansion

Purpose:

- Shift from operative overload to leadership control.

Features:

- CEO block planner
- Delegation backlog
- Strategic initiatives
- Revenue/margin notes
- Operative interruption log

## 9. Risk alerts

Purpose:

- Detect drift before it becomes failure.

Examples:

- 3 days no check-in
- 2 alcohol days in a week
- no CEO block completed
- 3 impulse purchases added in a week
- 5+ cigarettes above weekly average

## 10. Export and data ownership

Purpose:

- Maintain trust and privacy.

Features:

- CSV export
- Delete account
- Delete all data
- Local backup

## 11. Multi-user/product version

Only consider after personal MVP proves valuable.

Possible direction:

- SaaS for entrepreneurs
- Private accountability dashboard
- Paid coaching dashboard

Additional requirements:

- billing
- terms
- privacy policy
- onboarding
- account deletion
- tenant model
- rate limiting
- support process

---

## 12. WHOOP integration — prepared option

WHOOP can be prepared now but should not block MVP v1.

Recommended implementation:

- Feature flag: `VITE_ENABLE_WHOOP=false`
- Netlify Functions for OAuth and sync
- Supabase tables from `supabase/whoop_schema.sql`
- Dashboard card only when connected
- Manual sync first, scheduled sync second, webhooks third

Reference docs:

- `docs/WHOOP_INTEGRATION.md`
- `docs/WHOOP_TASKS.md`
- `supabase/whoop_schema.sql`
