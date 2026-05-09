# 🧭 CompassMe

A compassionate daily activity tracker for productivity and wellness. Track your daily progress with a weight system that recognizes difficult days, earn aura through consistent effort, and visualize your goals across daily, weekly, and monthly timescales.

**Status**: Phase 0 ✅ Completed — Phase 1 🟡 Authorized  
**Updated**: May 9, 2026

---

## 📋 Documentation

- **Specification**: [SPEC-001](specify/SPEC.md) – Requirements and feature set
- **Technical Plan**: [PLAN-001](specify/PLAN-001.md) – Architecture, design decisions, and technical details
- **Implementation Tasks**: [TASKS-001](specify/TASKS-001.md) – Decomposed tasks for 4 implementation sprints
- **Approval Status**: [APPROVAL.md](APPROVAL.md) – Executive summary and authorization ledger
- **C4 Diagrams**: 
  - [System Context](specify/c4/01-Context.md)
  - [Container Architecture](specify/c4/02-Container.md)

---

## 🚀 Implementation Progress

### Phase 0: Foundation ✅ COMPLETED

| Task | Description | Status |
|------|-------------|--------|
| T-001 | Project scaffold (Astro + Express) | ✅ |
| T-002 | PostgreSQL schema & migrations | ✅ |
| T-003 | JWT & auth providers | ✅ |
| T-004 | Frontend layout & routing | ✅ |
| T-005 | Nano Stores state management | ✅ |

**Verification**: `npm run lint` passes (0 TypeScript errors) on both frontend and backend.

### Phase 1: Auth & Activities 🟡 IN PROGRESS

| Task | Description | Status |
|------|-------------|--------|
| T-006 | Backend auth endpoints | ⬜ |
| T-007 | Frontend auth UI | ⬜ |
| T-008 | Activity CRUD backend | ⬜ |
| T-009 | Activity UI frontend | ⬜ |
| T-010 | Activity completion tracking | ⬜ |

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional for Phase 1+)

### Development

```bash
# Clone & install
git clone <repo> && cd CompassMe
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate

# Start both frontend + backend
npm run dev              # Astro on localhost:3000
# In another terminal:
npm run dev:server       # Express on localhost:3001
```

### Testing
```bash
npm run test             # Run all tests
npm run test:coverage    # Coverage report
```

### Building
```bash
npm run build            # Build both frontend + backend
npm run build:frontend
npm run build:backend
```

## 🏗️ Project Structure

```
CompassMe/
├── specify/
│   ├── SPEC.md              # Feature specification
│   ├── PLAN-001.md          # Technical plan
│   ├── TASKS-001.md         # Implementation tasks
│   ├── APPROVAL.md          # Authorization ledger
│   └── c4/
│       ├── 01-Context.md    # System context
│       └── 02-Container.md  # Architecture
├── frontend/                # Astro 4.x SPA
│   ├── src/
│   │   ├── components/      # Astro islands (empty — Phase 1)
│   │   ├── services/        # Port definitions (empty — Phase 1)
│   │   ├── stores/          # Nano Stores ✅
│   │   │   ├── userStore.ts
│   │   │   ├── activityStore.ts
│   │   │   └── progressStore.ts
│   │   ├── pages/           # Routes ✅
│   │   │   ├── index.astro
│   │   │   ├── activities.astro
│   │   │   ├── history.astro
│   │   │   └── settings.astro
│   │   └── layout/
│   │       └── Layout.astro # Base layout ✅
│   └── astro.config.mjs
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── domain/          # Entities ✅
│   │   │   ├── entities/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Activity.ts
│   │   │   │   ├── ActivityCompletion.ts
│   │   │   │   ├── DailyProgress.ts
│   │   │   │   └── AuraHistory.ts
│   │   ├── application/     # Services, DTOs (Phase 1)
│   │   ├── infrastructure/  # DB, HTTP, Auth ✅
│   │   │   ├── database/
│   │   │   │   ├── connection.ts
│   │   │   │   ├── migrations/001-init.sql
│   │   │   │   └── repositories/
│   │   │   │       ├── PgUserRepository.ts
│   │   │   │       └── PgActivityRepository.ts
│   │   │   ├── auth/
│   │   │   │   ├── JwtProvider.ts
│   │   │   │   └── HashProvider.ts
│   │   │   └── http/        # Routes, middleware (Phase 1)
│   │   ├── ports/           # Interfaces ✅
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IActivityRepository.ts
│   │   │   ├── IJwtProvider.ts
│   │   │   └── IHashProvider.ts
│   │   ├── app.ts           # Express setup ✅
│   │   └── server.ts        # Entry point ✅
│   └── package.json
└── README.md (this file)
```

## ✅ Implemented Features (Phase 0)

- **Project Scaffold**: Astro 4.x frontend + Express backend with TypeScript strict mode
- **Database Schema**: PostgreSQL with users, activities, completions, daily_progress, aura_history, goals tables
- **Connection Pool**: pg Pool with environment-based configuration
- **Domain Entities**: TypeScript interfaces for all core models
- **Repository Pattern**: PgUserRepository, PgActivityRepository with full CRUD
- **Auth Providers**: JWT signing/verification, bcrypt password hashing
- **Frontend Layout**: Responsive dark theme with navigation
- **Routing**: 4 pages (`/`, `/activities`, `/history`, `/settings`)
- **State Management**: Nano Stores for user, activity, and progress state
- **Health Endpoint**: `/health` for monitoring

## 🚧 Upcoming Features (Phase 1+)

### Core Features (MVP)
- ⬜ **User Authentication**: Register, login, logout with JWT
- ⬜ **Daily Activity Tracking**: Routine, one-time, and optional activities
- ⬜ **Activity CRUD**: Create, edit, delete activities
- ⬜ **Activity Completion**: Toggle complete/skip with daily tracking
- ⬜ **Progress Visualization**: Real-time 0-100% progress bar
- ⬜ **Weight System**: Multipliers for difficult days (compassionate scoring)
- ⬜ **Aura Farming**: Reputation system (+5, +2, -1 per day)
- ⬜ **Multi-Temporal Goals**: Daily, weekly, monthly targets
- ⬜ **History**: Filter and browse all past activities
- ⬜ **Responsive Design**: Mobile (320px) + tablet + desktop optimizations
- ⬜ **Accessibility**: WCAG AA compliance

## 📊 Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 4.x + TypeScript 5.x |
| Backend | Express.js + Node.js |
| Database | PostgreSQL 15+ |
| Auth | JWT + Refresh Tokens |
| State (Frontend) | Nano Stores |
| Data Fetch (Frontend) | TanStack Query |
| Cache (Optional) | Redis |
| Testing | Jest + React Testing Library |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) + Railway (backend) |

## 🏛️ Architecture Principles

- **Hexagonal/Ports & Adapters**: Business logic isolated from I/O
- **Dependency Inversion**: Contracts before implementations
- **No Vendor Lock-in**: Abstractions for LLM, DB, and storage
- **Islands Architecture**: Minimal JavaScript, only interactive components hydrated
- **Type-Safe**: TypeScript everywhere

## 🔒 Security

- ✅ HTTPS only
- ✅ JWT with short expiry (15 min access, 7 day refresh)
- ✅ Parameterized SQL queries
- ✅ Rate limiting (10 req/sec per user)
- ✅ CORS configured
- ✅ Input validation (Zod)
- ✅ WCAG AA accessibility

## 📈 Performance

- Frontend load: < 3s
- Interactions: < 200ms
- Database queries indexed on (user_id, date)
- Client-side caching with TanStack Query
- Server-side caching with Redis (optional)
- Pagination (50 records/page for history)

## 🧪 Testing

- Unit tests for ProgressCalculator, AuraCalculator
- Integration tests for API routes
- Component tests for UI islands
- E2E test for login → activity → logout flow
- Target: ≥80% coverage on critical paths

## 🚢 Deployment

**Frontend**: Vercel (auto-deploy on main)
**Backend**: Railway (auto-deploy on main)
**Database**: Managed PostgreSQL (Neon, Railway, or similar)

See [.skills/ §9](specify/.skills/.md#9-deployment--devops) for detailed CI/CD setup.

## 📝 Contributing

1. Create feature branch from `main`
2. Run tests: `npm run test`
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Open PR for review

## 📞 Support

For questions or issues, open an issue on GitHub.

## 📄 License

MIT

---

**Status**: 🟡 Technical Plan Awaiting Approval (see [.skills/](specify/.skills/.md))
**Last Updated**: May 2026

