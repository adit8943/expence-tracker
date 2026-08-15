# Spendwise — MERN Expense Tracker

Spendwise is a personal finance tracker built with MongoDB, Express, React, and Node.js. The entire project uses JavaScript—no TypeScript.

## Features

- JWT registration, sign-in, sign-out, and protected routes
- Income and expense creation, editing, deletion, search, filters, and pagination
- Default and custom categories plus date-range filtering
- Dashboard balance cards, recent transactions, and financial charts
- Profile settings, validation, error handling, and responsive UI

## Project structure

```text
client/   React application
server/   Express REST API and MongoDB models
```

## Setup

1. Start MongoDB locally or create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env`, then configure `MONGO_URI` and `JWT_SECRET`.
3. In separate terminals, run:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/PATCH /api/auth/me`
- `GET/POST /api/transactions`
- `PATCH/DELETE /api/transactions/:id`
- `GET /api/transactions/summary`, `GET /api/transactions/categories`
