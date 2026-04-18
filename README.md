# MudLab Backend

API for MudLab — a pottery gallery app where users can browse handmade ceramic pieces, create custom ones, and chat with an AI tour guide that explains pottery in plain language.

---

## Prerequisites

Make sure you have these installed before setting up:

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) (running locally)
- npm

---

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Copy the env file and fill in your values
cp .env.example .env

# 3. Generate the Prisma client (required to compile the app)
npx prisma generate

# 4. Run database migrations (creates the tables in your local DB)
npx prisma migrate deploy

# 5. Seed the database with pottery pieces
npm run db:seed

# 6. Start the dev server
npm run dev
```

Once running, interactive API docs are available at `http://localhost:3000/api-docs`.

---

## Environment Variables

```
JWT_SECRET=your-secret-key-min-32-chars
API_PORT=3000
DATABASE_URL=postgresql://user@localhost:5432/mudlabs
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=development
```

---

## Architecture

- **Runtime** — Node.js with Express and TypeScript
- **Database** — PostgreSQL via Prisma ORM
- **Auth** — JWT access tokens (15 min) + refresh tokens (30 days) stored in the DB
- **Validation** — express-openapi-validator reads the OpenAPI spec from JSDoc blocks above each route and rejects malformed requests before they hit the handler
- **Rate limiting** — auth endpoints capped at 10 requests per 15 min, tour guide at 1 per 30 sec
- **AI** — OpenAI GPT-4o mini powers the pottery tour guide

## Project Structure

```
src/
├── app.ts                   # Express app setup
├── main.ts                  # Server entry point
├── types.ts                 # Shared TypeScript interfaces
├── docs/
│   └── swagger.ts           # OpenAPI spec (served at /api-docs)
├── middleware/
│   ├── auth.ts              # JWT verification
│   ├── errorHandler.ts      # Global error handler
│   ├── rateLimit.ts         # Rate limiting for auth and tour guide
│   └── validate.ts          # Input validation helpers
├── routes/
│   ├── auth.ts              # /auth/*
│   ├── pieces.ts            # /pieces/*
│   ├── creations.ts         # /creations/*
│   └── tourGuide.ts         # /tour-guide/*
├── services/
│   ├── authService.ts       # Register, login, token management
│   ├── pieceService.ts      # Gallery queries and filtering
│   ├── creationService.ts   # Custom piece CRUD
│   └── tourGuideService.ts  # OpenAI integration
└── db/
    └── client.ts            # Prisma client instance
```

---

## Hosting

The API is deployed on **Vercel**. The database runs on **Neon** (serverless Postgres). Piece images are stored and served via **Cloudinary**.

---

## Code Quality

Linting and formatting use **Biome**. A pre-commit hook runs automatically on every commit — it auto-fixes formatting, then lints, then runs the full test suite. If any step fails the commit is blocked.

Request validation is handled by **express-openapi-validator**, which reads the OpenAPI spec and rejects malformed requests before they reach route handlers.

---

## Endpoints

Full interactive docs at `/api-docs`. Quick reference:

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /pieces
GET    /pieces/:id
GET    /pieces/meta/collections
GET    /pieces/meta/glazes

POST   /creations              (auth required)
GET    /creations/users/:id    (auth required)
DELETE /creations/:id          (auth required)

POST   /tour-guide/ask         (auth required)

GET    /health
```