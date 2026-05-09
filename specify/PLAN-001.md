# PLAN-001: CompassMe Technical Plan

**Data**: Maio 2026  
**Status**: ✅ Phase 0 · ✅ Phase 1 · ✅ Phase 2 · ✅ Phase 3 · ✅ Phase 4 Completed — 🚀 MVP Ready  
**Spec Ref**: [SPEC-001](SPEC.md)  
**Updated**: May 9, 2026

---

## 0. Implementation Notes (Phase 0)

> **Completed**: May 9, 2026  
> **Tasks**: T-001 .. T-005 (all ✅)  
> **Verification**: `tsc --noEmit` passes (0 errors) on both frontend and backend

### Deliverables
- **Backend**: Express server with health endpoint, PostgreSQL schema (`001-init.sql`), connection pool, domain entities, repository ports + PostgreSQL implementations, JWT provider, bcrypt hash provider
- **Frontend**: Astro 4.x with 4 pages (`/`, `/activities`, `/history`, `/settings`), responsive Layout with navigation, Nano Stores for user/activity/progress state
- **Type Safety**: All modules typed; strict TypeScript config on both sides

### Deviations from Original Plan
- Soft-delete implemented via `is_active` boolean (not `deleted_at` timestamp) — simpler for MVP
- Refresh token rotation deferred to T-006 (Phase 1)
- Auth middleware deferred to T-006 (Phase 1)
- No Redis yet — will be added in Phase 2+ when caching is needed
- No `value-objects/` folder yet — entities use primitive types for simplicity; may refactor later

---

## 0.1 Implementation Notes (Phase 1)

> **Completed**: May 9, 2026  
> **Tasks**: T-006 .. T-010 (all ✅)  
> **Verification**: `tsc --noEmit` 0 errors · `astro check` 0 errors, 0 warnings

### Deliverables (Phase 1)

- **Backend**: `POST /auth/register|login|refresh|logout` com JWT (access 15m + refresh 7d) · blacklist in-memory · `authMiddleware` · Zod validation · `errorHandler` global · CRUD `/activities` com ownership check e soft-delete · `POST|GET /completions` com upsert `ON CONFLICT`
- **Frontend**: `LoginForm.astro` + `RegisterForm.astro` (islands) · `AuthService.ts` (tokens em LocalStorage) · `ActivityList.astro` (toggle/edit/delete, CustomEvent `activities:refresh`) · `ActivityForm.astro` (modal create/edit) · Layout com proteção de rota via `data-require-auth` + botão Sair · `/login` e `/register` como páginas públicas

### Deviations from Plan (Phase 1)

- Token blacklist in-memory (sem Redis no MVP) — rotate on `POST /auth/refresh`, invalidate on `POST /auth/logout`
- `ActivityService.ts` no frontend centraliza todas as chamadas à API de atividades e completions

---

## 0.2 Implementation Notes (Phase 2)

> **Completed**: May 9, 2026  
> **Tasks**: T-011 .. T-015 (all ✅)  
> **Verification**: `tsc --noEmit` 0 errors · `astro check` 0 errors, 0 warnings

### Deliverables (Phase 2)

- **Backend**: `ProgressCalculator.ts` (lógica pura — OPTIONAL excluído do denominador) · `AuraCalculator.ts` (+5/+2/-1, multiplicador amplifica só ganhos positivos) · `IAuraRepository` + `PgAuraRepository` · `IProgressRepository` + `PgProgressRepository` · `CalculateDailyProgressUseCase` (orquestra + persiste) · `GET /progress` · `GET /aura` · `GET|PATCH /users/me` · migration `002-add-user-multiplier.sql`
- **Frontend**: `ProgressService.ts` · `Dashboard.astro` (barra animada, aura, banner de multiplicador, responde a `progress:refresh`) · `settings.astro` com seletor 1×/1.5×/2× persistido em DB e LocalStorage

### Deviations from Plan (Phase 2)

- Redis cache deferido — sem impacto no MVP; `GET /progress` recalcula e faz upsert a cada chamada
- Multiplier enviado como query param `?multiplier=` e salvo via `PATCH /users/me` (coluna `daily_multiplier` na tabela `users`)

---

## 0.4 Implementation Notes (Phase 4)

> **Completed**: May 9, 2026  
> **Tasks**: T-020 .. T-024 (all ✅)  
> **Verification**: `tsc --noEmit` 0 errors · `astro check` 0 errors, 0 warnings · 15/15 unit tests passing

### Deliverables (Phase 4)

- **Backend**: `rateLimit.ts` (20 req/min em `/auth`, in-memory sliding window) · 15 unit tests (`node:test` + `tsx`) para `ProgressCalculator` e `AuraCalculator` · `backend/Dockerfile` multi-stage
- **Frontend**: `settings.astro` completo (ActivityList/Form + GoalsPanel editável + multiplier + logout) · `Toast.astro` global (`aria-live=assertive`, `window.toast()`) · fetch interceptor 401 → redirect login · touch targets ≥44px · `focus-visible` global · `frontend/Dockerfile` multi-stage + `nginx.conf`
- **CI/CD**: `.github/workflows/ci.yml` com jobs separados backend/frontend

### Deviations from Plan (Phase 4)

- Integration/E2E tests deferidos pós-MVP — requerem container PostgreSQL no CI
- README e API docs deferidos pós-MVP
- Deploy automático (Vercel/Railway) requer secrets manuais no repositório

---

## 0.3 Implementation Notes (Phase 3)

> **Completed**: May 9, 2026  
> **Tasks**: T-016 .. T-019 (all ✅)  
> **Verification**: `tsc --noEmit` 0 errors · `astro check` 0 errors, 0 warnings

### Deliverables (Phase 3)

- **Backend**: `Goal.ts` entity · `IGoalsRepository` + `PgGoalsRepository` (seed lazy de defaults + `ON CONFLICT`) · `GetGoalsSummaryUseCase` (avg de `daily_progress` por período) · `GET /goals` · `PUT /goals` · `GetHistoryUseCase` (agrega progress + completions + activities, paginação offset) · `GET /history?from=&to=&type=&status=&offset=&limit=` · migration `003-goals-unique-constraint.sql`
- **Frontend**: `GoalsService.ts` · `GoalsPanel.astro` (prop `editable`, barras CSS, feedback verde/vermelho) · `HistoryService.ts` · `HistoryView.astro` (filtros data/tipo/status, cards colapsáveis, botão "Carregar mais")

### Deviations from Plan (Phase 3)

- Histórico paginado via botão explícito em vez de scroll automático — melhor UX mobile, sem risco de loop de fetch
- `GoalsPanel` reutilizado em `/` (readonly) e `/settings` (editable) via prop Astro, evitando duplicação de componente

---

## 1. Decisões Arquiteturais

### 1.1 Stack Escolhido

| Camada | Tech | Justificativa |
|--------|------|--|
| **Frontend** | Astro 4.x + TypeScript 5.x | Islands Architecture reduz JS; responsivo nativo; Constituição §2 |
| **Backend** | Express.js + Node.js + TypeScript | Simples, maduro, type-safe; Constituição §2 |
| **Database** | PostgreSQL 15+ | ACID, constraints, índices nativos; sem vendor lock |
| **Auth** | JWT + Refresh Tokens | Stateless, seguro, standard industry |
| **Cache** | Redis (Phase 1+) | Sessão + histórico; optional inicialmente |

### 1.2 Padrões Arquiteturais

**Frontend**: Hexagonal/Islands
- **Port**: `ActivityService` (abstrato para chamadas API)
- **Adapters**: HTTP Client (fetch), LocalStorage
- **Islands**: Apenas Dashboard, ActivityForm, ToggleComplete são interativas

**Backend**: Hexagonal/Ports & Adapters
- **Entities**: User, Activity, ActivityCompletion, DailyProgress, AuraHistory
- **Ports**: `ProgressCalculator`, `ActivityRepository`, `UserRepository`
- **Adapters**: PostgreSQL, JWT, Express routes
- **Middleware**: Auth, Error handling, CORS, Rate limiting

**Dependency Inversion**:
```typescript
// ❌ AVOID
const db = new PgDatabase();

// ✅ DO (Ports)
interface ActivityRepository {
  getByUserId(userId: string, date: Date): Promise<Activity[]>;
  save(activity: Activity): Promise<void>;
}

// Adapter
class PgActivityRepository implements ActivityRepository { }

// Injection (Express middleware)
app.post('/activities', 
  authMiddleware, 
  (req, res, next) => {
    const service = new ActivityService(pgActivityRepository);
    service.create(req.body).then(...);
  }
);
```

### 1.3 Sem Acoplamento a Vendor

| Aspecto | Isolation |
|---------|-----------|
| **LLM** | Não usado MVP; será abstrato quando precisar |
| **Database** | Repository pattern; fácil migrar de PostgreSQL → Neo4j |
| **Auth** | JWT genérico; sem Auth0/Firebase lock-in |
| **Storage** | Blob storage abstrato (S3, local file, GCS) |

---

## 2. Interfaces e Fronteiras de Módulo

### 2.1 Frontend Modules

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.astro (interactive island)
│   │   ├── ActivityList.astro (interactive island)
│   │   ├── ActivityForm.astro (interactive island)
│   │   ├── HistoryView.astro (interactive island)
│   │   └── ProgressBar.astro (static)
│   ├── services/
│   │   ├── ActivityService.ts (port: IActivityService)
│   │   ├── AuthService.ts (port: IAuthService)
│   │   ├── ProgressService.ts (port: IProgressService)
│   │   └── HttpClient.ts (adapter)
│   ├── stores/
│   │   ├── userStore.ts (Nano Stores)
│   │   ├── activityStore.ts
│   │   └── progressStore.ts
│   ├── pages/
│   │   ├── index.astro (dashboard)
│   │   ├── activities.astro
│   │   ├── history.astro
│   │   └── settings.astro
│   └── layout/
│       └── Layout.astro (responstive grid)
└── astro.config.mjs (TypeScript, view transitions, images opt)
```

**Port Definitions**:
```typescript
// services/port.ts
export interface IActivityService {
  listToday(): Promise<Activity[]>;
  create(input: CreateActivityInput): Promise<Activity>;
  markComplete(id: string, completed: boolean): Promise<void>;
  getHistory(filter: HistoryFilter): Promise<Activity[]>;
}

export interface IAuthService {
  login(email: string, password: string): Promise<{access: string; refresh: string}>;
  logout(): Promise<void>;
  refresh(): Promise<string>;
}

export interface IProgressService {
  getTodayProgress(): Promise<DailyProgress>;
  getWeeklyGoal(): Promise<WeeklyGoal>;
  getMonthlyGoal(): Promise<MonthlyGoal>;
}
```

### 2.2 Backend Modules

```
backend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Activity.ts
│   │   │   ├── ActivityCompletion.ts
│   │   │   ├── DailyProgress.ts
│   │   │   └── AuraHistory.ts
│   │   └── value-objects/
│   │       ├── Email.ts
│   │       ├── ActivityType.ts
│   │       └── ProgressPercentage.ts
│   ├── application/
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   ├── ActivityService.ts
│   │   │   ├── ProgressService.ts
│   │   │   └── HistoryService.ts
│   │   ├── dtos/
│   │   │   ├── CreateActivityDTO.ts
│   │   │   ├── ProgressResponseDTO.ts
│   │   │   └── ...
│   │   └── use-cases/
│   │       ├── LoginUseCase.ts
│   │       ├── CreateActivityUseCase.ts
│   │       ├── MarkCompleteUseCase.ts
│   │       └── CalculateDailyProgressUseCase.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── repositories/
│   │   │   │   ├── PgUserRepository.ts (implements IUserRepository)
│   │   │   │   ├── PgActivityRepository.ts
│   │   │   │   ├── PgCompletionRepository.ts
│   │   │   │   └── PgProgressRepository.ts
│   │   │   ├── migrations/
│   │   │   │   ├── 001-init.sql
│   │   │   │   ├── 002-add-indexes.sql
│   │   │   │   └── ...
│   │   │   └── connection.ts
│   │   ├── http/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── activities.routes.ts
│   │   │   │   ├── progress.routes.ts
│   │   │   │   ├── history.routes.ts
│   │   │   │   └── aura.routes.ts
│   │   │   └── middleware/
│   │   │       ├── authMiddleware.ts
│   │   │       ├── errorHandler.ts
│   │   │       ├── rateLimit.ts
│   │   │       └── cors.ts
│   │   └── auth/
│   │       ├── JwtProvider.ts (implements IJwtProvider)
│   │       └── HashProvider.ts (bcrypt)
│   ├── ports/
│   │   ├── IUserRepository.ts
│   │   ├── IActivityRepository.ts
│   │   ├── IProgressCalculator.ts
│   │   └── IJwtProvider.ts
│   ├── app.ts (Express setup, dependency injection)
│   └── server.ts (entry point)
└── package.json
```

**Injection Points**:
```typescript
// app.ts
const userRepo = new PgUserRepository(pgPool);
const activityRepo = new PgActivityRepository(pgPool);
const progressCalc = new ProgressCalculator();
const jwtProvider = new JwtProvider(process.env.JWT_SECRET);
const authService = new AuthService(userRepo, jwtProvider, hashProvider);
const activityService = new ActivityService(activityRepo, progressCalc);

app.use(
  authMiddleware({
    jwtProvider,
    tokenBlacklist: new RedisTokenBlacklist(redisClient),
  })
);

app.post('/activities', (req, res) => {
  const useCase = new CreateActivityUseCase(activityRepo, userRepo);
  useCase.execute(req.body, req.user.id).then(...);
});
```

---

## 3. Dependências Externas

### 3.1 Frontend
- `astro@^4.0.0`
- `typescript@^5.0.0`
- `@tanstack/query@^5.0.0` (data fetching + caching)
- `nano-stores@^0.9.0` (state management)
- `date-fns@^3.0.0` (date utilities)
- `framer-motion@^10.0.0` (animations, smooth transitions)

### 3.2 Backend
- `express@^4.18.0`
- `typescript@^5.0.0`
- `pg@^8.0.0` (PostgreSQL)
- `jsonwebtoken@^9.0.0`
- `bcryptjs@^2.4.0`
- `cors@^2.8.0`
- `dotenv@^16.0.0`
- `zod@^3.22.0` (validation)

### 3.3 Dev
- `jest@^29.0.0` + `@testing-library/react`
- `eslint@^8.0.0`, `prettier@^3.0.0`
- `@types/node`, `@types/express`

---

## 4. Pontos de Injeção de Dependência

| Camada | Point | Strategy |
|--------|-------|----------|
| **Frontend** | HttpClient | Constructor injection em ActivityService |
| **Frontend** | Store | Singleton global (Nano Stores) |
| **Backend** | Repositories | Constructor injection em Services |
| **Backend** | Auth Provider | Middleware factory function |
| **Backend** | ProgressCalculator | Injected em ActivityService |
| **Backend** | Database Pool | Singleton em connection.ts |

---

## 5. Fluxos Críticos

### 5.1 Login Flow

```
User Input (email, password)
  ↓
[Frontend] POST /auth/login
  ↓
[Backend] AuthService.login()
  ├─ UserRepository.findByEmail()
  ├─ HashProvider.compare(password, hash)
  ├─ JwtProvider.sign({user_id, role})
  └─ Return {access, refresh}
  ↓
[Frontend] Store JWT in LocalStorage
[Frontend] Update userStore
[Frontend] Redirect to /activities
```

### 5.2 Mark Activity Complete Flow

```
User clicks toggle (ActivityList island)
  ↓
[Frontend] POST /completions {activity_id, completed, date}
  ↓
[Backend] MarkCompleteUseCase
  ├─ ActivityCompletionRepository.save()
  ├─ ProgressCalculator.calculateDaily()
  │  ├─ Get all activities for user+date
  │  ├─ Count completed
  │  ├─ Apply dailyWeight multiplier
  │  ├─ Calc progress %
  │  └─ Calc aura delta
  ├─ ProgressRepository.save()
  ├─ AuraRepository.save()
  └─ Return updated DailyProgress
  ↓
[Frontend] Update progressStore
[Frontend] Re-render Dashboard with new %
```

### 5.3 History Retrieval Flow

```
User navigates to /history + applies filters
  ↓
[Frontend] GET /history?from=YYYY-MM-DD&to=YYYY-MM-DD&type=ROUTINE
  ↓
[Backend] HistoryService.getFiltered()
  ├─ ActivityCompletionRepository.findByUserAndDateRange()
  ├─ ProgressRepository.findByUserAndDateRange()
  ├─ Format response (paginated, sorted by date DESC)
  └─ Return 50 records + hasMore flag
  ↓
[Frontend] TanStack Query caches result
[Frontend] Render HistoryView with infinite scroll
```

---

## 6. Decisões de Banco de Dados

### 6.1 Schema Overview

```sql
-- Users (credentials, role)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'USER', -- ADMIN | USER
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Activities (definition, type, weight)
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- ROUTINE | ONE_TIME | OPTIONAL
  base_weight FLOAT DEFAULT 1.0,
  deadline_time TIME DEFAULT '23:59:00',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Activity Completions (daily records)
CREATE TABLE activity_completions (
  id UUID PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id),
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  multiplier_applied FLOAT DEFAULT 1.0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily Progress (pre-calculated for perf)
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  total_activities INT,
  completed_count INT,
  daily_weight FLOAT DEFAULT 1.0,
  progress_percentage FLOAT,
  aura_earned INT DEFAULT 0,
  computed_at TIMESTAMP DEFAULT NOW()
);

-- Aura History (tracking earned/lost)
CREATE TABLE aura_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  aura_delta INT, -- +5, +2, -1
  reason VARCHAR(255), -- 'all_completed', 'partial', 'none'
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes (critical for perf)
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_completions_user_date ON activity_completions(user_id, date);
CREATE INDEX idx_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX idx_aura_user_date ON aura_history(user_id, date);
```

### 6.2 Constraints
- `users.email`: UNIQUE, NOT NULL
- `activities.user_id`: FK (cascade delete soft)
- `activity_completions`: UNIQUE(activity_id, user_id, date)
- `daily_progress`: UNIQUE(user_id, date)

---

## 7. Considerações de Performance

### 7.1 Caching Strategy
- **Client-side**: TanStack Query com TTL 5min para atividades do dia
- **Server-side**: Redis cache para `progress:user_id:YYYY-MM-DD` (TTL 1h)
- **Invalidation**: On completion, invalidate progress cache + ActivityCompletion cache

### 7.2 Database Queries
- All queries indexed on `(user_id, date)` combinations
- Batch: Preload all activities for user on login
- Pagination: History limited to 50/page, offset-based

### 7.3 Frontend Assets
- Astro static pre-rendering onde possível
- Image optimization (AVIF + WebP fallback)
- CSS: Minified, no unused styles
- JS islands: Minimal hydration, lazy-loaded where possible

---

## 8. Segurança

### 8.1 Authentication
- ✅ JWT access token (15min expiry)
- ✅ JWT refresh token (7 days, rotated on use)
- ✅ Refresh token blacklist (Redis logout)
- ✅ Password hashing (bcryptjs, 10 rounds)
- ✅ HTTPS only (enforced in headers)

### 8.2 Authorization
- ✅ Role-based (ADMIN, USER)
- ✅ User can only access own activities/history
- ✅ Admin can view all users (phase 2)

### 8.3 Input Validation
- ✅ Zod schema validation (backend)
- ✅ Client-side validation (UX feedback)
- ✅ SQL injection protection (parameterized queries)

### 8.4 Rate Limiting
- ✅ 10 requests/sec per user
- ✅ 100 requests/hour per IP (auth endpoints)
- ✅ Sliding window algorithm (Redis)

---

## 9. Deployment & DevOps

### 9.1 CI/CD
- GitHub Actions workflow:
  - ✅ ESLint + Prettier
  - ✅ Unit tests (Jest)
  - ✅ Build frontend (Astro)
  - ✅ Build backend (TypeScript → JS)
  - ✅ Docker image push (if approved)

### 9.2 Infrastructure
- **Frontend**: Vercel / Netlify (auto-deploy on main)
- **Backend**: Railway / Render (auto-deploy on main, ENV vars)
- **Database**: Managed PostgreSQL (Neon, Railway)
- **Redis**: Managed (Optional Heroku Redis / Upstash)

### 9.3 Monitoring
- Logs: Structured JSON (Winston / Pino)
- Metrics: Response times, error rates (phase 2)
- Alerts: Slack on 500 errors

---

## 10. Testing Strategy

### 10.1 Frontend
- **Unit**: Stores, utilities (date calcs)
- **Integration**: Components with mock API
- **E2E**: Dashboard flow, activity toggle

### 10.2 Backend
- **Unit**: ProgressCalculator, ProgressService (mocked repos)
- **Integration**: API routes with test DB
- **Contract**: Response shape validation (Zod)

### 10.3 Coverage Target
- Aim for ≥80% on critical paths (auth, progress calc)
- Mock all external calls (DB, Auth)

