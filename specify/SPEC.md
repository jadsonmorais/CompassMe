# SPEC-001: CompassMe - Daily Activity Wellness Tracker

**Data**: Maio 2026  
**Status**: ✅ Aprovada  
**Versão**: 1.0  
**Implementation**: Phase 0 ✅ Completed — Phase 1 🟡 Authorized  
**Updated**: May 9, 2026

---

## 0. Implementation Status

> This section tracks implementation progress against the specification.

### Completed (Phase 0 — May 9, 2026)
- ✅ Database schema: all tables (users, activities, completions, daily_progress, aura_history, goals)
- ✅ Domain entities: TypeScript interfaces for all models
- ✅ Repository pattern: PostgreSQL implementations with full CRUD
- ✅ Auth infrastructure: JWT provider, bcrypt hash provider
- ✅ Frontend scaffold: Astro 4.x with 4 pages and responsive layout
- ✅ State management: Nano Stores (user, activity, progress)
- ✅ Type safety: strict TypeScript, 0 errors on `tsc --noEmit`

### Pending (Phase 1+)
- ⬜ User registration and login endpoints
- ⬜ Activity CRUD API
- ⬜ Activity completion tracking
- ⬜ Progress calculation engine
- ⬜ Aura calculation and history
- ⬜ Dashboard with real-time progress
- ⬜ Goals (daily, weekly, monthly)
- ⬜ History view with filters
- ⬜ Settings page
- ⬜ Test suite (≥80% coverage target)
- ⬜ Accessibility (WCAG AA)
- ⬜ Deployment & CI/CD

---

## 1. Visão do Produto

CompassMe é um web app responsivo (mobile + desktop) de produtividade e wellness para ajudar a usuária a visualizar seu progresso diário através de tarefas estruturadas com um sistema de pesos compassivo que reconhece dias difíceis.

**Missão**: "Enxergar o quanto ela está indo bem" → visualização gamificada do progresso com sistema motivacional baseado em reputação ("aura farming").

---

## 2. Requisitos Funcionais

### 2.1 Gestão de Atividades

**Atividades Rotineiras** (`type: ROUTINE`)
- Tarefas recorrentes (diárias, semanais, mensais)
- Se marcada como completa no dia = 0 recorrências futuras
- Se pulada = recorre no dia seguinte
- Exemplos: exercício, meditação, tomar medicação

**Atividades One-Time** (`type: ONE_TIME`)
- Sem recorrência padrão
- Se marcada como completa = não recorre
- Se pulada = recorre apenas no dia seguinte (comportamento "missed deadline")
- Exemplos: assistir filme, sair com amigos, fazer compras

**Atividades Opcionais** (`type: OPTIONAL`)
- Não afetam o progresso geral
- Apenas para rastreamento
- Sem penalidade por não completar

### 2.2 Sistema de Pesos (Compaixão para Dias Difíceis)

**Multiplicador Diário** (`dailyWeight: float`)
- Default: 1.0
- Em dias "inegociáveis" (depressão, crise mental): até 2.0
- Atividade completa × multiplicador = valor para cálculo de progresso
- Exemplo: completar 3 tarefas em dia 2x = progresso equivalente a 6 tarefas em dia normal

**Variações por Tipo de Atividade**:
- `ROUTINE (inegociável)`: sempre conta (hard-coded weight 1.0)
- `ROUTINE (pode pular com penalidade)`: reduz 0.5 do progresso se pulada
- `ONE_TIME`: conta como 1.0 se completa
- `OPTIONAL`: não conta no percentual final

### 2.3 Cálculo de Progresso Diário

```
progresso_diario = (soma_atividades_completas × multiplicador_diario) / total_atividades_agendadas × 100%
```

- 0% = nenhuma tarefa completa
- 100% = todas as tarefas inegociáveis completadas
- Atividades opcionais não influenciam o denominador

### 2.4 Aura Farming (Sistema de Reputação)

**Ganho de Aura**:
- +5 aura por dia: todas as tarefas inegociáveis completas antes do deadline
- +2 aura: completou tarefas, mesmo que nem todas
- -1 aura: nenhuma tarefa concluída

**Uso de Aura**:
- Pequeno boost visual: cor/animação no dashboard
- Futuro: desbloquear badges/temas especiais
- Não afeta cálculo de progresso direto

**Deadline**:
- Default: midnight (UTC-3)
- Customizável por atividade
- "Aura farming" significa garantir que deadlines sejam respeitados para acumular reputação

### 2.5 Metas Multi-Temporais

**Daily Goals**:
- Target diário de progresso (ex: ≥80%)
- Reset a cada midnight
- Visual na tela principal

**Weekly Goals**:
- Target para a semana (ex: média ≥75%)
- Reset segunda-feira
- Histórico semanal com sparkline

**Monthly Goals**:
- Target mensal (ex: média ≥70%)
- Reset 1º dia do mês
- Histórico mensal com chart

### 2.6 Telas e Fluxos

**Tela 1: Dashboard Principal**
- Progresso percentual do dia (0-100% com barra visual)
- Status da atividade atual ("pulse" para próxima tarefa)
- Resumo de aura (counter + visual badge)
- Atalhos: rotina, one-time, histórico, settings

**Tela 2: Atividades Rotineiras**
- Lista de todas as rotinas do dia
- Toggle completa/incompleta
- Mostrar multiplicador do dia
- Botão: "marcar todas como completas"

**Tela 3: Atividades One-Time**
- Lista de tarefas sem recorrência do dia
- Toggle completa/incompleta
- Indicador de "missed deadline" se pulada

**Tela 4: Histórico**
- Unlimited history (todos os dias anteriores)
- Filtrar por: período, tipo de atividade, status
- Visualizar: % diário, aura ganho, atividades completadas

**Tela 5: Settings**
- Editar atividades (criar, editar, deletar)
- Configurar multiplicadores por dia
- Definir deadlines customizados
- Metas diárias/semanais/mensais

---

## 3. Requisitos Não-Funcionais

### 3.1 Responsividade
- ✅ Desktop (1920px+)
- ✅ Tablet (768px-1024px)
- ✅ Mobile (320px-767px)
- CSS Grid/Flexbox, sem framework pesado

### 3.2 Performance
- Carregamento inicial < 3s
- Interação < 200ms (toggle, click)
- Histórico paginado (50 registros/page)

### 3.3 Segurança
- JWT com refresh tokens
- HTTPS only
- CORS configurado
- Rate limiting em endpoints críticos
- Dados criptografados em repouso (opcional: apenas senhas + dados sensíveis)

### 3.4 Escalabilidade
- Suport para 10K+ usuárias simultâneas (future proofing)
- Cache de leitura para histórico (Redis optional)
- DB estruturada para índices em user_id + date

### 3.5 Confiabilidade
- Backup automático (diário)
- Rollback de alterações em atividades (soft-delete)
- Logs de auditoria para mudanças de progresso/aura

---

## 4. Estrutura de Dados Conceitual

### Entidades Principais

```
User
├── id (UUID)
├── email (unique)
├── password_hash
├── role (ADMIN | USER)
└── created_at

Activity
├── id (UUID)
├── user_id (FK)
├── name
├── type (ROUTINE | ONE_TIME | OPTIONAL)
├── weight (0.5 | 1.0 | 2.0)
├── deadline (HH:MM, default 23:59)
└── created_at

ActivityCompletion
├── id (UUID)
├── activity_id (FK)
├── user_id (FK)
├── date
├── completed (boolean)
├── multiplier_applied (float)
└── timestamp

DailyProgress
├── id (UUID)
├── user_id (FK)
├── date
├── total_activities
├── completed_count
├── daily_weight
├── progress_percentage
├── aura_earned
└── computed_at

AuraHistory
├── id (UUID)
├── user_id (FK)
├── date
├── aura_delta (+5, +2, -1)
├── reason
└── timestamp
```

---

## 5. Critérios de Aceite

- [ ] User pode login/logout com JWT
- [ ] User pode criar/editar/deletar atividades (ROUTINE, ONE_TIME, OPTIONAL)
- [ ] Dashboard exibe progresso % do dia (0-100%)
- [ ] Toggle de conclusão afeta progresso em tempo real
- [ ] Multiplicador diário é aplicado corretamente no cálculo
- [ ] Aura é calculada e exibida corretamente
- [ ] Histórico ilimitado acessível e filtrado
- [ ] Metas diárias/semanais/mensais aparecem em settings
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Performance: < 3s load time, < 200ms interações

---

## 6. Restrições e Suposições

**Restrições**:
- MVP sem autenticação social (apenas email/password)
- Sem notificações push (fase 2)
- Sem compartilhamento de atividades (solo user app)

**Suposições**:
- Usuária sempre no mesmo timezone (UTC-3, Brasil)
- Histórico nunca deletado (apenas soft-delete)
- One-Time atividade: não recorre após completa, mas recorre 1x se pulada

---

## 7. Stack Padrão (Constituição §2)

- **Frontend**: Astro 4.x + TypeScript 5.x (Islands Architecture)
- **Backend**: Node.js (Express) + TypeScript 5.x
- **Database**: PostgreSQL 15+
- **Auth**: JWT + refresh tokens
- **Cache**: Redis (optional, fase 1+)

