# Friends‑Inspired Snake (PWA)

A cozy, sitcom‑vibe Snake game with obstacles, power‑ups, speed boosts, and background music. 100% client‑side, installable as a PWA, and playable offline.

> Note: This project is an original homage with generic assets—no copyrighted TV show content is included.

## Features
- Canvas Snake with wrap-around
- Obstacles (orange blocks)
- Power‑ups:
  - ☕ Coffee: temporary speed boost
  - 🛡️ Shield: survive one crash
  - 🍕 Pizza: +5 score and slight slow‑mo
- Background music with toggle
- Mobile on‑screen controls
- PWA: manifest + service worker + icons
- Offline play & install prompt

## Run locally
Any static server works. Example with Python:
```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

## Deploy
Upload the contents of this folder to any static hosting:
- **Netlify**: Drag‑and‑drop the folder to the dashboard.
- **Vercel**: Create new project → "Other" → output directory is the project root.
- **GitHub Pages**: Push to `main`, enable Pages for root.
- **Cloudflare Pages / Firebase Hosting**: serve as a static site.

No build step required.

## Files
- `index.html` – UI layout + canvas
- `app.js` – game logic
- `sw.js` – service worker (cache‑first)
- `manifest.webmanifest` – PWA manifest
- `assets/icons/*` – app icons (64/192/512)
- `assets/audio/bg-music.wav` – original loop
- `assets/images/couch.svg` – decorative image

Enjoy! 🎮
