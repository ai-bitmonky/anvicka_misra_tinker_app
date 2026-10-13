# Tinker

Describe a web page in your own words. Tinker writes the HTML, CSS and JavaScript, shows the page straight away, and lets you change anything by asking ("make it dark", "change the title to Riya's 10th") or by editing the code. No login, no account — everything runs in the browser and the project is saved in `localStorage` (`tinker:v1`).

Next.js 15 (App Router) + TypeScript + plain CSS + zustand. A faithful port of `Tinker_v1.0.html`.

## Two versions, one engine
- **Desktop** (≥ 1000px wide): top bar + Chat / Code / Output panes.
- **Mobile** (< 1000px): native-app shell — nav bar, sliding panes, swipe, blurred tab bar, toasts. Installable (PWA manifest, standalone).
- `src/middleware.ts` guesses the device from the user agent so the first paint is right; on the client `matchMedia("(max-width: 999.98px)")` has the final say and follows resizes.
- Engine: `src/lib/engine/` (colours, templates, highlighter, plain-words interpreter, preview). State: `src/lib/store.ts`.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

## Deploy
Push to GitHub and import the repo in Vercel (framework: Next.js, no settings or env vars needed). Optional: set `NEXT_PUBLIC_SITE_URL` for absolute Open Graph URLs (Vercel's production URL is used by default).
