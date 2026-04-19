# MudLab Backend

API for MudLab, an interactive pottery gallery where users can browse handmade ceramic pieces, create custom ones, and chat with an AI tour guide that explains pottery in plain language.

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
CLOUDINARY_URL=cloudinary://your-api-key:your-api-secret@your-cloud-name
NODE_ENV=development
```

---

## Architecture

- **Build** — TypeScript compiler (`tsc`) compiles `src/` → `dist/` before deployment
- **Runtime** — Node.js with Express
- **Database** — PostgreSQL via Prisma ORM
- **Auth** — JWT access tokens (15 min) + refresh tokens (30 days) stored in the DB
- **Validation** — OpenAPI spec enforced globally via express-openapi-validator (see [Validation](#validation))
- **Rate limiting** — auth endpoints capped at 10 requests per 15 min, tour guide at 1 per 30 sec
- **AI** — OpenAI GPT-4o mini powers the pottery tour guide; DALL-E 3 generates custom piece images
- **Image storage** — Cloudinary stores and serves all generated images

## Project Structure

```
src/
├── app.ts                   # Express app setup
├── main.ts                  # Server entry point
├── types.ts                 # Re-exports API types from schemas; internal-only types live here
├── schemas/
│   └── index.ts             # Zod schemas — single source of truth for all API types
├── docs/
│   └── swagger.ts           # OpenAPI spec built from schemas (served at /api-docs)
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

## Types

Each type is defined once and flows to both the backend and frontend automatically. There is one place per concern:

| What | Where |
|------|-------|
| API shapes — anything a route sends or receives | `src/schemas/index.ts` |
| Internal shared types — never sent to a client (e.g. `JWTPayload`) | `src/types.ts` |
| Types only used in one file | Define them locally in that file |

### Making a type change

**1. Edit `src/schemas/index.ts`**
Add or update the shape and its constraints here (e.g. `z.string().email()`, `z.string().min(8)`). The TypeScript type is immediately importable anywhere in the backend — no separate interface needed.

**2. Update `src/docs/swagger.ts` if the type is part of a route**
This file is not auto-generated — edit it by hand. Find the relevant `registry.registerPath()` call and point it at your updated schema. You are not redefining the shape here, just telling the route to use it. Skip this step if the type isn't part of a request or response.

**3. Restart the server**
`/api-docs.json` is generated at runtime from `swagger.ts`. No build step — just restart and the spec reflects your changes.

**4. Tell frontends to re-run codegen**
```bash
# run this in the frontend project
npx openapi-typescript http://localhost:3000/api-docs.json -o src/api/types.ts
```
Frontends can add this as a script in their `package.json` so it's easy to re-run:
```json
"gen:types": "openapi-typescript http://localhost:3000/api-docs.json -o src/api/types.ts"
```

---

## Changing the Database Schema

Any time you modify `prisma/schema.prisma`, run this before starting the app or tests:

```bash
# Create and apply a new migration
npx prisma migrate dev --name describe-your-change
```

`prisma generate` runs automatically via the `postinstall` script after every `npm install`, so the TypeScript types stay in sync. If you ever see an error like `Module '@prisma/client' has no exported member 'Prisma'`, run `npx prisma generate` manually to fix it.

---

## Hosting

The API is deployed on **Vercel**. The database runs on **Neon** (serverless Postgres). Piece images are stored and served via **Cloudinary**.

---

## Validation

All request shapes are defined as Zod schemas in `src/schemas/index.ts`. These schemas drive both the OpenAPI spec and TypeScript types — there is one place to define a field, its format, and its constraints.

The OpenAPI spec generated from those schemas is enforced globally by **express-openapi-validator** before requests reach any handler. Route handlers don't duplicate validation logic — if the validator passes a request through, the handler can trust the shape of the data.

---

## Code Quality

Linting and formatting use **Biome**. A pre-commit hook runs automatically on every commit — it auto-fixes formatting, then lints, then runs the full test suite. If any step fails the commit is blocked.

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

POST   /creations                    (auth required)
POST   /creations/generate-image     (auth required)
GET    /creations/users/:id          (auth required)
DELETE /creations/:id                (auth required)

POST   /tour-guide/ask         (auth required)

GET    /health
```

---

## Limitations
- Logout doesn't fully log you out. The access token stays valid up to 15 min. 
- If DB save fails after Cloudinary upload, or vice versa, images are permanently orphaned with no recovery path.
- Expired refresh tokens never cleaned up
- Max 10 conversation turns hardcoded (MAX_HISTORY_TURNS = 10 in tourGuideService.ts).
- No user profile management has no view/edit profile, no password reset, no email verification.
- Only exact-match filtering on pieces; no full-text search.
- Creations are entirely private, no public gallery.