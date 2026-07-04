# Product Requirements Document — ControlBase

## 1. Product summary

ControlBase is a private personal dashboard for tracking and controlling daily behavior across health, discipline, finances, purchases, ideas, and CEO focus.

The MVP supports a 30-day realistic discipline plan and helps the user avoid over-optimization, impulse purchases, alcohol drift, missed CEO focus blocks, and inconsistent health tracking.

## 2. Target user

Primary user: one German-speaking individual who wants a private control cockpit.

Key traits:

- High responsibility, CEO role.
- Many parallel ideas and projects.
- Strong optimization drive.
- Wants direct feedback, not generic motivation.
- Needs a system that reduces friction.
- Uses iPhone and desktop.

## 3. Core problem

The user has many goals and high ambition, but risks losing progress through too many parallel projects, impulsive optimization, inconsistent health routines, lifestyle spending, alcohol/rauching drift, and operative overload.

## 4. Product goal

Make daily behavior visible and controllable with minimal friction.

Primary question:

> Bin ich heute auf Kurs?

## 5. MVP scope

### Must have

- Authentication
- Dashboard
- Daily check-in
- Daily Top 3
- Purchase waitlist with 7-day rule
- Idea parking lot
- Weekly review
- Basic charts/summary
- Supabase persistence
- Netlify deployment

### Should have

- Mobile-first layout
- German UI
- Simple status system: green/yellow/red
- Basic form validation
- Empty states
- Edit existing entries

### Could have later

- Push/email reminders
- Apple Health import
- WHOOP import
- Calendar integration
- Advanced CEO dashboard
- Budget module
- AI weekly analysis
- CSV export
- PWA install support

### Won't have in MVP

- Team features
- Public sharing
- Payment system
- Native mobile app
- Complex gamification
- Advanced analytics

## 6. Core user stories

### Daily check-in

As a user, I want to enter my daily values quickly so that I can see whether I am on track.

Fields:

- Date
- Weight
- Sleep quality
- Steps
- Training type
- Alcohol yes/no
- Cigarettes
- First cigarette time
- Food quality
- Expenses over 50 CHF
- Top 3 status
- Notes

### Daily Top 3

As a user, I want to define one business, one health, and one private/financial priority each day so that I avoid scattered focus.

### Purchase waitlist

As a user, I want to park purchases over 300 CHF for 7 days so that I reduce impulse spending.

### Idea parking

As a user, I want to capture new ideas without starting them immediately so that I reduce context switching.

### Weekly review

As a user, I want a weekly summary and reflection so that I can adjust next week based on real behavior.

## 7. Success criteria

MVP success means:

- The user opens the app daily.
- Check-in takes less than 2 minutes.
- The dashboard clearly shows status.
- Purchase waitlist prevents impulse decisions.
- Weekly review gives actionable feedback.
- The app remains simple enough to keep using.

## 8. Product tone

Direct, clear, structured, honest.

Examples:

- "Heute auf Kurs"
- "Noch nicht eingetragen"
- "7-Tage-Regel aktiv"
- "Nicht sofort starten. Erst parken."
- "Du hast diese Woche deine Alkoholregel überschritten."

Avoid fluffy generic motivation.
