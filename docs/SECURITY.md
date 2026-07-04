# Security and Privacy — ControlBase

## Data sensitivity

ControlBase stores sensitive personal behavior data:

- Weight
- Smoking
- Alcohol
- Health routines
- Expenses
- Private notes
- CEO focus notes

Therefore the app must be private by default.

## MVP security requirements

1. Authentication required for all app pages.
2. No public read access to private data.
3. Row Level Security enabled for all user-owned tables.
4. Users can only access rows where `user_id = auth.uid()`.
5. No Supabase service role key in frontend.
6. No third-party analytics in MVP.
7. No public sharing links in MVP.
8. Use HTTPS via Netlify and Supabase.

## Supabase keys

Safe in frontend:

- Supabase anon key, when RLS is correctly configured.

Never expose:

- Supabase service role key.
- Database password.
- JWT secret.

## Recommended auth

For private use:

- Email/password or magic link.
- Keep signup disabled or limited if possible.

If this becomes a product later:

- Add explicit privacy policy.
- Add account deletion.
- Add export/delete user data.
- Add consent for any analytics.

## Local development

Use `.env.local` and never commit it.

## Netlify

Store env vars in Netlify project settings.

## Backups

MVP: rely on Supabase project backups/free tier limitations. For serious long-term use, add periodic CSV export.

## Future privacy improvements

- CSV export
- Delete all user data button
- Account deletion flow
- Optional local encryption for notes
- Audit log for important changes
