# EXECUTIVE SUMMARY: CompassMe Technical Plan

**Date**: May 4, 2026  
**Status**: ✅ **APPROVED by User** *(May 2026)*
**Spec ID**: SPEC-001  
**Plan ID**: PLAN-001

---

## 📝 Task Authorization Ledger

| Phase | Tasks | Status | Signed At | Rule |
|-------|-------|--------|-----------|------|
| Phase 0: Foundation | T-001 .. T-005 | ✅ **COMPLETED** | May 2026 | DoD met — type-check 0 errors |
| Phase 1: Auth & Activities | T-006 .. T-010 | 🟡 **AUTHORIZED** | May 2026 | Agent may begin implementation |
| Phase 2: Progress Engine | T-011 .. T-015 | ⬜ Pending | — | Blocked until Phase 1 DoD |
| Phase 3: Goals & History | T-016 .. T-019 | ⬜ Pending | — | Blocked until Phase 2 DoD |
| Phase 4: Polish & Deploy | T-020 .. T-024 | ⬜ Pending | — | Blocked until Phase 3 DoD |

**Rule**: Agent may ONLY touch code for tasks with ✅ in the ledger above. Violating this triggers a compliance stop.  

---

## 📌 Quick Overview

I've created a complete **Technical Plan** for CompassMe following your Spec with:

1. ✅ **Full Specification** (SPEC-001.md) – All features, requirements, data model
2. ✅ **Technical Architecture** (.skills/.md) – Stack choices, design patterns, interfaces
3. ✅ **C4 System Diagrams** (specify/c4/) – Context & container architecture
4. ✅ **24 Decomposed Tasks** (TASKS-001.md) – 4 sprints with agente assignments
5. ✅ **Project Structure** – Frontend (Astro), Backend (Express), Database (PostgreSQL)

---

## 🎯 Key Architectural Decisions

### Stack Chosen (Constituição §2 Compliant)
```
Frontend:    Astro 4.x + TypeScript 5.x
Backend:     Express.js + Node.js + TypeScript 5.x
Database:    PostgreSQL 15+ (ACID, indexes, constraints)
Auth:        JWT (access 15min, refresh 7 days)
State:       Nano Stores (frontend), PostgreSQL (backend)
Cache:       Redis (optional Phase 1+)
```

### Design Patterns
- **Hexagonal/Ports & Adapters**: Business logic isolated from I/O
- **Islands Architecture**: Only interactive components hydrated (Dashboard, ActivityForm, etc.)
- **Dependency Inversion**: All services accept injected dependencies
- **No Vendor Lock-in**: LLMs, DB, storage behind interfaces

---

## 📊 C4 Architecture

### System Context
```
User (mobile/desktop)
    ↓ Login, Track, View Progress
CompassMe System
    ├→ Email Service (future notifications)
    └→ Analytics (future)
```

### Containers
```
Browser (Astro Islands) ← API Routes (Express) → PostgreSQL
                               ↓
                            Auth Middleware
                            Progress Engine
                            (Multiplier Calc, Aura Logic)
```

**Key Components**:
- **Web Browser**: Responsive SPA (mobile 320px → desktop 1920px)
- **REST API**: Express with route handlers for auth, activities, progress, history
- **PostgreSQL**: Indexed schema (user_id, date), soft-delete auditing
- **Auth Module**: JWT provider, refresh token rotation, token blacklist
- **Progress Engine**: Calculates daily %, applies weights, earns aura

---

## 🔄 Critical Flows

### 1️⃣ Login Flow
```
Email + Password → Backend Auth
  ├─ Hash compare
  ├─ JWT sign (access + refresh)
  └─ User redirected to Dashboard
```

### 2️⃣ Mark Activity Complete Flow
```
Frontend toggle activity
  ↓
POST /completions {activity_id, date, completed}
  ↓
Backend ProgressCalculator
  ├─ Count completions for day
  ├─ Apply dailyWeight multiplier
  ├─ Calculate progress %
  ├─ Calculate aura delta
  └─ Update stores
  ↓
Frontend re-renders Dashboard (new %)
```

### 3️⃣ History Retrieval Flow
```
User filters by date range + type
  ↓
GET /history?from=&to=&type=ROUTINE
  ↓
Backend paginates (50/page, indexed query)
  ↓
Frontend infinite scroll + TanStack Query cache
```

---

## 📋 Database Schema

### Core Entities
- **users** (credentials, role)
- **activities** (definitions: ROUTINE, ONE_TIME, OPTIONAL)
- **activity_completions** (daily records: completed? multiplier applied?)
- **daily_progress** (pre-calculated: %, aura earned)
- **aura_history** (tracking: +5, +2, -1 per day)

### Indexes
```sql
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_completions_user_date ON activity_completions(user_id, date);
CREATE INDEX idx_progress_user_date ON daily_progress(user_id, date);
```

---

## 🚀 Implementation Roadmap (4 Sprints)

### Sprint 1: Foundation (T-001 to T-005)
- [ ] Project scaffold (Astro + Express)
- [ ] PostgreSQL schema + migrations
- [ ] JWT + Auth providers
- [ ] Base frontend layout
- [ ] State management (Nano Stores)

### Sprint 2: Auth & Activities (T-006 to T-010)
- [ ] Backend auth endpoints (register, login, refresh, logout)
- [ ] Frontend login/register UI
- [ ] Activity CRUD (backend + frontend)
- [ ] Activity completion tracking

### Sprint 3: Progress Engine (T-011 to T-015)
- [ ] ProgressCalculator (core logic, unit-testable)
- [ ] Aura calculation + history
- [ ] Daily progress endpoint
- [ ] Dashboard display (%, aura, goals)
- [ ] Multiplier UI (weight system)

### Sprint 4: Goals & History (T-016 to T-024)
- [ ] Goals (daily/weekly/monthly)
- [ ] History with filters + pagination
- [ ] Settings page
- [ ] Error handling & edge cases
- [ ] Tests + documentation
- [ ] Accessibility (WCAG AA)
- [ ] CI/CD setup + deployment

---

## ⚙️ Dependency Injection Points

| Layer | Point | Strategy |
|-------|-------|----------|
| **Frontend** | HttpClient | Constructor injection in ActivityService |
| **Frontend** | Stores | Singleton (Nano Stores) |
| **Backend** | Repositories | Constructor injection in Services |
| **Backend** | Auth Provider | Middleware factory |
| **Backend** | ProgressCalculator | Injected in ActivityService |
| **Backend** | Database Pool | Singleton in connection.ts |

---

## 🔒 Security & Performance

### Security
- ✅ JWT access token (15 min expiry)
- ✅ Refresh token rotation (7 days)
- ✅ Password hashing (bcryptjs, 10 rounds)
- ✅ HTTPS only
- ✅ Rate limiting (10 req/sec per user)
- ✅ Input validation (Zod)
- ✅ SQL injection protection (parameterized)

### Performance
- ✅ Frontend load: < 3s
- ✅ Interactions: < 200ms
- ✅ Database indexed on (user_id, date)
- ✅ Client caching: TanStack Query
- ✅ Server caching: Redis (optional)
- ✅ Pagination: 50 records/page

---

## 🧪 Testing Strategy

### Coverage Targets
- **Unit**: ProgressCalculator, AuraCalculator, utilities (≥90%)
- **Integration**: API routes with test DB (≥80%)
- **E2E**: Login → activity toggle → logout (smoke test)
- **Overall**: ≥80% on critical paths

### Tools
- **Backend**: Jest + Supertest
- **Frontend**: Jest + React Testing Library
- **Mocks**: All external calls mocked (DB, Auth)

---

## 🚢 Deployment

| Environment | Platform | Strategy |
|-------------|----------|----------|
| **Frontend** | Vercel | Auto-deploy on `main` merge |
| **Backend** | Railway | Auto-deploy on `main` merge |
| **Database** | Managed PostgreSQL | Neon / Railway |
| **Cache (optional)** | Managed Redis | Upstash / Heroku Redis |

---

## 📁 Files Created

```
projetos/CompassMe/
├── README.md                          # This quick-start guide
├── specify/
│   ├── SPEC.md                        # Full specification
│   ├── .skills/.md                    # Technical plan (this document)
│   ├── TASKS-001.md                   # 24 decomposed tasks
│   └── c4/
│       ├── 01-Context.md              # System context diagram
│       └── 02-Container.md            # Container architecture
├── frontend/                          # Ready for scaffolding
└── backend/                           # Ready for scaffolding
```

---

## ✅ Approval Checklist

Before I dispatch tasks to developers, **please verify**:

- [ ] **Stack choices OK?** (Astro + Express + PostgreSQL)
- [ ] **Architecture makes sense?** (Hexagonal, Islands, DI)
- [ ] **C4 diagrams clear?** (Context + Container)
- [ ] **Task decomposition realistic?** (4 sprints, 2-3 weeks each)
- [ ] **Security sufficient?** (JWT, rate limit, validation)
- [ ] **Performance targets achievable?** (< 3s load, < 200ms interactions)
- [ ] **Any changes to scope/features?**
- [ ] **Any preferred agente for specific tasks?**

---

## 🎯 Next Steps (After Approval)

1. ✅ **I confirm approval** → I'll dispatch to agentes:
   - `developer-frontend` → T-001, T-004, T-005, T-007, T-009, T-014, T-015, T-017, T-019, T-020, T-023
   - `developer-node` → T-001, T-002, T-003, T-006, T-008, T-010, T-011, T-012, T-013, T-016, T-018, T-021, T-022, T-024
   - `qa-agent` → T-022 (testing suite)

2. 📋 **Each agente** receives:
   - Task ID, input, expected output
   - Critério de aceite (acceptance criteria)
   - Dependency graph (which tasks must finish first)
   - Injection points for DI

3. 🔄 **I reconcile** cross-cutting concerns:
   - API contracts align
   - Database schema matches
   - Error handling consistent
   - Tests all pass

4. 📦 **Final PR** to main with all completed work

---

## 💬 Questions for You

1. **Are the 4 sprints reasonable timing?** (2-3 weeks each)
2. **Do you want Redis included in MVP or Phase 1+?**
3. **Timezone**: Is UTC-3 (Brazil) correct for deadline calculation?
4. **Future integrations**: Any LLM features, notifications, or sharing already planned?

---

## 📞 Ready to Approve?

Reply with:
```
✅ APROVO o .skills/
```

And I'll immediately start dispatching tasks to developers! 🚀

---

**Current Status**: 🟡 Awaiting Your Approval  
**All Files**: ✅ Generated in `projetos/CompassMe/specify/`  
**Time to Approval**: Ready for your review

