# Spendwise Client

The React frontend for the Spendwise personal expense tracker. It uses JavaScript and Vite.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The development server runs at `http://localhost:5173` by default.

## Configuration

Copy `.env.example` to `.env` only when the API URL differs from `http://localhost:5000/api`.

## Source structure

- `components/` — reusable UI pieces
- `pages/` — route-level screens
- `layouts/` — shared navigation
- `constants/` and `utils/` — shared values and helpers
- `api.js` — configured JWT-aware API client
