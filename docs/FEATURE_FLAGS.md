# Feature Flags

Use environment variables to keep MVP small and future modules hidden until ready.

## Flags

```env
VITE_FEATURE_WHOOP=false
VITE_FEATURE_PWA=false
VITE_FEATURE_NOTIFICATIONS=false
VITE_FEATURE_CEO_ADVANCED=false
VITE_FEATURE_EXPORT=false
VITE_FEATURE_AI_REVIEW=false
```

## Rules
- Features behind false flags must not appear as active functionality.
- Placeholders are allowed if clearly marked "später" or "coming soon".
- Never ship unfinished integrations that can corrupt private data.

## Suggested Implementation
Create `src/config/features.ts`:

```ts
export const features = {
  whoop: import.meta.env.VITE_FEATURE_WHOOP === 'true',
  pwa: import.meta.env.VITE_FEATURE_PWA === 'true',
  notifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS === 'true',
  ceoAdvanced: import.meta.env.VITE_FEATURE_CEO_ADVANCED === 'true',
  export: import.meta.env.VITE_FEATURE_EXPORT === 'true',
  aiReview: import.meta.env.VITE_FEATURE_AI_REVIEW === 'true',
};
```
