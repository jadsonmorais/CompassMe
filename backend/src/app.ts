import express from "express";
import cors from "cors";

import { createPool } from "./infrastructure/database/connection.js";
import { PgUserRepository } from "./infrastructure/database/repositories/PgUserRepository.js";
import { PgActivityRepository } from "./infrastructure/database/repositories/PgActivityRepository.js";
import { PgCompletionRepository } from "./infrastructure/database/repositories/PgCompletionRepository.js";
import { PgProgressRepository } from "./infrastructure/database/repositories/PgProgressRepository.js";
import { PgAuraRepository } from "./infrastructure/database/repositories/PgAuraRepository.js";
import { PgGoalsRepository } from "./infrastructure/database/repositories/PgGoalsRepository.js";
import { JwtProvider } from "./infrastructure/auth/JwtProvider.js";
import { BcryptHashProvider } from "./infrastructure/auth/HashProvider.js";

import { createAuthMiddleware } from "./infrastructure/http/middleware/authMiddleware.js";
import { errorHandler } from "./infrastructure/http/middleware/errorHandler.js";
import { createRateLimiter } from "./infrastructure/http/middleware/rateLimit.js";
import { createAuthRouter } from "./infrastructure/http/routes/auth.routes.js";
import { createActivitiesRouter } from "./infrastructure/http/routes/activities.routes.js";
import { createCompletionsRouter } from "./infrastructure/http/routes/completions.routes.js";
import { createProgressRouter, createAuraRouter } from "./infrastructure/http/routes/progress.routes.js";
import { createUsersRouter } from "./infrastructure/http/routes/users.routes.js";
import { createGoalsRouter } from "./infrastructure/http/routes/goals.routes.js";
import { createHistoryRouter } from "./infrastructure/http/routes/history.routes.js";

export function createApp(): express.Application {
  const app = express();

  const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  app.use(cors({ origin: allowedOrigin, credentials: true }));
  app.use(express.json());

  const pool = createPool();
  const userRepo = new PgUserRepository(pool);
  const activityRepo = new PgActivityRepository(pool);
  const completionRepo = new PgCompletionRepository(pool);
  const progressRepo = new PgProgressRepository(pool);
  const auraRepo = new PgAuraRepository(pool);
  const goalsRepo = new PgGoalsRepository(pool);

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");
  const jwtProvider = new JwtProvider(jwtSecret);
  const hashProvider = new BcryptHashProvider();

  // In-memory token blacklist (resets on restart; substituir por Redis em Phase 4)
  const tokenBlacklist = new Set<string>();
  const authMiddleware = createAuthMiddleware(jwtProvider, tokenBlacklist);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
  });

  const authRateLimit = createRateLimiter(20); // 20 req/min por IP nas rotas de auth
  app.use("/auth", authRateLimit, createAuthRouter(userRepo, hashProvider, jwtProvider, tokenBlacklist));
  app.use("/users", createUsersRouter(userRepo, authMiddleware));
  app.use("/activities", createActivitiesRouter(activityRepo, authMiddleware));
  app.use("/completions", createCompletionsRouter(completionRepo, activityRepo, authMiddleware));
  app.use("/progress", createProgressRouter(activityRepo, completionRepo, progressRepo, auraRepo, authMiddleware));
  app.use("/aura", createAuraRouter(auraRepo, authMiddleware));
  app.use("/goals", createGoalsRouter(goalsRepo, progressRepo, authMiddleware));
  app.use("/history", createHistoryRouter(activityRepo, completionRepo, progressRepo, authMiddleware));

  app.use(errorHandler);

  return app;
}
