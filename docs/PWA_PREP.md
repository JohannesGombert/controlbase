# PWA Preparation

Goal: Prepare ControlBase so it can later be installed on iPhone/Android as a lightweight web app.

## MVP Decision
PWA support is optional for MVP. Prepare files, but do not let PWA work delay core tracking.

## Future PWA Features
- Installable app icon
- Offline shell
- Local draft check-in if offline
- Sync when online
- Daily reminder via browser notification where supported

## Files to Add Later
- `public/manifest.webmanifest`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- Service worker via Vite PWA plugin

## Suggested Manifest
```json
{
  "name": "ControlBase",
  "short_name": "ControlBase",
  "description": "Tägliches Kontrollsystem für Gesundheit, Fokus, Finanzen und Führung.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## iPhone Note
iOS web push support depends on installation and browser support. Do not rely on push notifications in MVP. Use email reminders or in-app warnings first.
