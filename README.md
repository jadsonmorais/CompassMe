# CompassMe

Rastreador de atividades diárias com sistema de progresso, Aura e metas multi-temporais.

**Produção**: [compass-me.vercel.app](https://compass-me.vercel.app)  
**API**: [compassme-production.up.railway.app](https://compassme-production.up.railway.app/health)  
**Status**: MVP completo — todas as 24 tasks concluídas

---

## Stack

| Camada | Tech |
|--------|------|
| Frontend | Astro 4.x + TypeScript 5 |
| Backend | Express.js + Node.js 20 |
| Banco | PostgreSQL 16 |
| Auth | JWT (access 15min + refresh 7d) |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

---

## Funcionalidades

- **Autenticação** — registro, login, logout, refresh token
- **Atividades** — ROUTINE (diária/semanal por dias/mensal), ONE_TIME (com data), OPTIONAL
- **Recorrência semanal** — seleção de dias da semana individuais
- **Toggle de conclusão** — marca/desmarca por dia
- **Progresso diário** — barra 0–100%, OPTIONAL excluída do denominador
- **Aura** — +5 (100%), +2 (parcial), -1 (0%); multiplicador amplifica ganhos
- **Multiplicador diário** — 1×, 1.5×, 2× para dias difíceis
- **Metas** — diária (80%), semanal (75%), mensal (70%) — editáveis
- **Histórico** — filtros por data, tipo, status; paginação
- **Navbar responsiva** — hamburger menu no mobile

---

## Desenvolvimento local

### Pré-requisitos
- Docker e Docker Compose

### Subir tudo

```bash
git clone https://github.com/jadsonmorais/CompassMe.git
cd CompassMe
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3002/health
- Banco: localhost:5432

### Sem Docker

```bash
# Backend
cd backend
cp env.example .env        # edite DATABASE_URL e JWT_SECRET
npm install
npm run dev                # http://localhost:3001

# Frontend (outro terminal)
cd frontend
cp env.example .env        # edite PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev                # http://localhost:3000
```

### Migrations

```bash
# Com Docker (automático ao subir)
docker compose up --build

# Manual (psql)
psql $DATABASE_URL -f backend/src/infrastructure/database/migrations/001-init.sql
psql $DATABASE_URL -f backend/src/infrastructure/database/migrations/002-add-user-multiplier.sql
psql $DATABASE_URL -f backend/src/infrastructure/database/migrations/003-goals-unique-constraint.sql
```

---

## Testes

```bash
cd backend
npm test
# 15 testes — ProgressCalculator (8) + AuraCalculator (7)
```

---

## Deploy

### Variáveis de ambiente

**Railway (backend)**:
```
NODE_ENV=production
JWT_SECRET=<string aleatória de 32+ chars>
CORS_ORIGIN=https://compass-me.vercel.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Vercel (frontend)**:
```
PUBLIC_API_URL=https://compassme-production.up.railway.app
```

### Migrations em produção

Execute no painel **Database → Query** do Railway (ou via psql com a URL pública):

```sql
-- Cole o conteúdo de 001-init.sql, depois 002 e 003
```

---

## Estrutura

```
CompassMe/
├── .github/workflows/ci.yml   # CI: type-check + tests + build
├── docker-compose.yml          # Ambiente local completo
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.ts                      # Express + DI
│   │   ├── domain/entities/            # User, Activity, Goal...
│   │   ├── application/
│   │   │   ├── services/               # ProgressCalculator, AuraCalculator
│   │   │   └── use-cases/              # Login, Register, GetHistory...
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   ├── migrations/         # 001, 002, 003
│   │   │   │   └── repositories/       # PgUser, PgActivity...
│   │   │   ├── http/
│   │   │   │   ├── routes/             # auth, activities, progress...
│   │   │   │   └── middleware/         # authMiddleware, rateLimit...
│   │   │   └── auth/                   # JwtProvider, HashProvider
│   │   └── ports/                      # Interfaces (IUserRepository...)
│   └── tests/unit/                     # 15 unit tests
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── components/                 # ActivityList, ActivityForm, Dashboard...
        ├── layout/Layout.astro         # Navbar responsiva + Toast + auth guard
        ├── pages/                      # index, activities, history, settings...
        └── services/                   # AuthService, ActivityService...
```

---

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Login → `{accessToken, refreshToken}` |
| POST | `/auth/refresh` | Rotacionar refresh token |
| POST | `/auth/logout` | Invalidar tokens |
| GET | `/users/me` | Perfil do usuário |
| PATCH | `/users/me` | Atualizar perfil/multiplicador |
| GET | `/activities` | Listar atividades do dia |
| POST | `/activities` | Criar atividade |
| PUT | `/activities/:id` | Editar atividade |
| DELETE | `/activities/:id` | Soft-delete |
| GET | `/completions` | Completions do dia |
| POST | `/completions` | Marcar como feita/desfeita |
| GET | `/progress` | Progresso diário + Aura |
| GET | `/aura` | Total de Aura |
| GET | `/goals` | Metas + progresso atual |
| PUT | `/goals` | Atualizar meta |
| GET | `/history` | Histórico com filtros |
