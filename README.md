# MudLab Backend

API for MudLab — a pottery gallery app where users can browse handmade ceramic pieces, create custom ones, and chat with an AI tour guide that explains pottery in plain language.

---

## Prerequisites

Make sure you have these installed before setting up:

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) (running locally or remote)
- npm

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Run database migrations
npx prisma migrate deploy

# 4. Start dev server
npm run dev
```

---

## Environment Variables

```
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
API_PORT=3000
API_URL=http://localhost:3000
DATABASE_URL=postgresql://user@localhost:5432/mudlabs
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=development
```

---

## Architecture

Express + TypeScript API with a PostgreSQL database managed via Prisma ORM.

```
src/
├── main.ts                  # Server entry point, route mounting
├── types.ts                 # Shared TypeScript interfaces
├── client.ts                # Axios client (for frontend consumption)
├── middleware/
│   ├── auth.ts              # JWT verification middleware
│   └── errorHandler.ts      # Global error handler
├── routes/
│   ├── auth.ts              # POST /auth/register, /auth/login
│   ├── pieces.ts            # GET /pieces, /pieces/:id
│   ├── creations.ts         # POST/GET/DELETE /creations
│   └── tourGuide.ts         # POST /tour-guide/ask
├── services/
│   ├── authService.ts       # Register, login, JWT generation
│   ├── pieceService.ts      # Gallery queries and filtering
│   ├── creationService.ts   # Custom piece CRUD
│   └── tourGuideService.ts  # OpenAI integration (in progress)
└── db/
    └── client.ts            # Prisma client instance
```

---

## What's Done

- JWT auth — register, login, protected routes
- Prisma schema + initial migration
- PostgreSQL connected via Prisma ORM
- All CRUD for creations (create, list, delete with ownership check)
- Piece filtering by collection, glaze, and type
- Global error handling with consistent response shape

## What's Pending

- **OpenAI tour guide** — service is scaffolded, API call not wired up yet
- **Input validation** — email format, password strength, UUID checks
- **Seed data** — no pottery pieces in the DB yet, `Piece` table is empty
- **Swagger / API docs** — not set up yet

---

## Endpoints

```
POST   /auth/register
POST   /auth/login

GET    /pieces
GET    /pieces/:id

POST   /creations          (auth required)
GET    /creations          (auth required)
DELETE /creations/:id      (auth required)

POST   /tour-guide/ask     (auth required)

GET    /health
```
