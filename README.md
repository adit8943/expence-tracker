# Spendwise — MERN Expense Tracker

Personal expense tracking application built with MongoDB, Express, React, and Node.js (JavaScript only).

## Setup

1. Start MongoDB locally or create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env`, then provide `MONGO_URI` and a strong `JWT_SECRET`.
3. In separate terminals, run `npm run dev` in both `server` and `client`.
4. Open `http://localhost:5173`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/PATCH /api/auth/me`
- `GET/POST/PATCH/DELETE /api/transactions`
- `GET /api/transactions/summary`, `GET /api/transactions/categories`
