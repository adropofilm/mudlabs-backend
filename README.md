# MudLab Backend Scaffold

Complete Express + TypeScript backend scaffold with JWT authentication, ready for implementation.

## Setup

```bash
# Copy .env.example to .env and fill in values
cp .env.example .env

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm build
npm start
```

## What's Included

✅ **Structure:** Organized folders for routes, services, middleware, database
✅ **Types:** All TypeScript interfaces defined (src/types.ts)
✅ **Routes:** All 10 endpoints scaffolded with TODO comments
✅ **Auth:** JWT + bcrypt setup, authMiddleware, login/register routes
✅ **Database:** JSON file helpers (src/db/helpers.ts)
✅ **Error Handling:** Consistent error responses, custom APIError class
✅ **Frontend Export:** Axios client with interceptors (src/client.ts)

## What Needs Implementation

### High Priority

**1. Database Files** (src/db/data/)
- `pieces.json` — Pre-populate with gallery pottery pieces
- `users.json` — Empty at start
- `creations.json` — Empty at start

Example pieces.json structure:
```json
[
  {
    "id": "uuid-here",
    "name": "Sage Bowl",
    "collection": "minimalist",
    "glaze": "matte",
    "color": "sage",
    "type": "bowl",
    "description": "Handmade ceramic bowl...",
    "photoUrl": "https://..."
  }
]
```

**2. Input Validation** (src/routes/)
- Email format validation
- Password strength validation (min 8 chars, etc.)
- UUID format validation
- Request body validation

**3. OpenAI Integration** (src/services/tourGuideService.ts)
- Call OpenAI API with conversation history
- Build dynamic system prompt with gallery context
- Handle streaming responses

### Medium Priority

**4. Filtering** (src/services/pieceService.ts)
- Implement collection/glaze/type filtering

**5. Ownership Verification** (src/routes/creations.ts)
- Verify user owns creation before delete
- Handle admin access if needed

**6. Error Messages**
- Make error messages more helpful
- Add specific validation error details

## File Structure

```
mudlab-backend-scaffold/
├── src/
│   ├── main.ts                 # Express server setup
│   ├── types.ts                # All TypeScript interfaces (DONE ✅)
│   ├── client.ts               # Axios client for frontend (DONE ✅)
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification (DONE ✅)
│   │   └── errorHandler.ts     # Error handling (DONE ✅)
│   ├── routes/
│   │   ├── auth.ts             # POST /auth/login, /auth/register (SCAFFOLD ⚠️)
│   │   ├── pieces.ts           # GET /pieces, /pieces/:id (SCAFFOLD ⚠️)
│   │   ├── creations.ts        # POST/GET/DELETE /creations (SCAFFOLD ⚠️)
│   │   └── tourGuide.ts        # POST /tour-guide/ask (SCAFFOLD ⚠️)
│   ├── services/
│   │   ├── authService.ts      # JWT + bcrypt logic (DONE ✅)
│   │   ├── pieceService.ts     # Gallery queries (SCAFFOLD ⚠️)
│   │   ├── creationService.ts  # Creation CRUD (SCAFFOLD ⚠️)
│   │   └── tourGuideService.ts # OpenAI integration (SCAFFOLD ⚠️)
│   └── db/
│       ├── helpers.ts          # Read/write JSON files (DONE ✅)
│       └── data/
│           ├── pieces.json     # TO POPULATE
│           ├── users.json      # Created at runtime
│           └── creations.json  # Created at runtime
├── package.json                # (DONE ✅)
├── tsconfig.json               # (DONE ✅)
├── .env.example                # (DONE ✅)
└── README.md                   # (DONE ✅)
```

## Next Steps

1. **Copy this scaffold** to mudlab-backend repo
2. **Create pieces.json** with pre-populated pottery pieces
3. **Implement TODO comments** in routes and services
4. **Add input validation** in all routes
5. **Connect OpenAI API** for tour guide
6. **Test endpoints** with Postman/Insomnia
7. **Publish to npm** as @mudlab/backend once working

## Environment Variables

```
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
API_PORT=3000
API_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-key
NODE_ENV=development
```

## Key Design Decisions

- **Stateless JWT Auth** — No session storage, tokens are verified on each request
- **JSON Database** — Simple and fast for MVP, can upgrade to PostgreSQL later
- **Structured Errors** — All errors follow consistent { error, message, statusCode } format
- **Frontend Export** — Backend exports types and axios client for frontend to use

## Testing Endpoints

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123","name":"User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Get pieces
curl http://localhost:3000/pieces

# Get protected route (requires token)
curl http://localhost:3000/users/user-id/creations \
  -H "Authorization: Bearer eyJ..."
```

Good luck! 🏺
