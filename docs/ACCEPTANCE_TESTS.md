# MVP Acceptance Tests

Use this checklist before calling MVP complete.

## Auth
- [ ] User can sign up.
- [ ] User can log in.
- [ ] User can log out.
- [ ] Private routes redirect logged-out users.

## Daily Check-in
- [ ] User can create today's check-in.
- [ ] User can edit today's check-in.
- [ ] App prevents duplicate check-ins for same date/user.
- [ ] Empty optional fields do not break dashboard.

## Top 3
- [ ] User can create 3 tasks for today.
- [ ] User can mark each task done.
- [ ] Dashboard shows completion.

## Dashboard
- [ ] Shows today's status.
- [ ] Shows last 7 or 14 days weight chart.
- [ ] Shows training count this week.
- [ ] Shows alcohol days this week.
- [ ] Shows cigarette average.
- [ ] Shows open purchase decisions.

## Purchases
- [ ] User can add a purchase.
- [ ] Decision date is automatically +7 days.
- [ ] User can approve/reject/postpone.
- [ ] Dashboard highlights due decisions.

## Ideas
- [ ] User can add idea.
- [ ] User can change status.
- [ ] Idea defaults to parked.

## Weekly Review
- [ ] User can create one review per week.
- [ ] Auto-summary uses daily check-ins.
- [ ] Manual reflection saves.

## Security
- [ ] RLS is enabled for all user tables.
- [ ] User A cannot read User B records.
- [ ] Supabase service key is not used in frontend.
- [ ] WHOOP secrets are not in frontend.

## Deployment
- [ ] `npm run build` passes.
- [ ] Netlify deploy works.
- [ ] Refreshing nested routes works.
