# Genius Trading Journal (Tradezella)

A lightweight trading journal built with React — local-only storage (localStorage) and analytics for tracking R, win rate, and equity curve.

## Quick start

Install dependencies and run locally:

```bash
npm install
npm start
```

Build for production:

```bash
npm run build
```

## Deploy to Vercel

You can deploy this app to Vercel in two ways:

1) Using the Vercel web dashboard
- Create a new project and import your Git repository.
- Set the framework preset to "Create React App" (Vercel detects automatically).
- Build command: `npm run build` (default)
- Output directory: `build`
- Deploy.

2) Using the Vercel CLI

Install the Vercel CLI and run:

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or run the convenience npm script:

```bash
npm run deploy
```

The repo includes `vercel.json` which sets up SPA rewrites so client-side routing works.

## Notes

- Data is stored locally in `localStorage` under the key defined in `src/utils/constants.js` (`STORAGE_KEY`).
- Authentication is a simple local lock using a password in `src/utils/constants.js` (change or remove before sharing publicly).
- If you want remote sync (Firebase / Supabase), I can add that next.

*** End Patch