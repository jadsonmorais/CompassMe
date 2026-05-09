import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { RegisterUseCase, RegisterSchema } from "../../../application/use-cases/RegisterUseCase.js";
import { LoginUseCase, LoginSchema } from "../../../application/use-cases/LoginUseCase.js";
import type { IUserRepository } from "../../../ports/IUserRepository.js";
import type { IHashProvider } from "../../../ports/IHashProvider.js";
import type { IJwtProvider } from "../../../ports/IJwtProvider.js";

export function createAuthRouter(
  userRepo: IUserRepository,
  hashProvider: IHashProvider,
  jwtProvider: IJwtProvider,
  tokenBlacklist: Set<string>
): Router {
  const router = Router();

  const registerUseCase = new RegisterUseCase(userRepo, hashProvider);
  const loginUseCase = new LoginUseCase(userRepo, hashProvider, jwtProvider);

  router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const user = await registerUseCase.execute(parsed.data);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const tokens = await loginUseCase.execute(parsed.data);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  });

  router.post("/refresh", (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken required" });
      return;
    }
    if (tokenBlacklist.has(refreshToken)) {
      res.status(401).json({ error: "Token revoked" });
      return;
    }
    try {
      const payload = jwtProvider.verify(refreshToken);
      if (payload.type !== "refresh") {
        res.status(401).json({ error: "Not a refresh token" });
        return;
      }
      // Rotate: blacklist old refresh token
      tokenBlacklist.add(refreshToken);
      const accessToken = jwtProvider.sign(
        { sub: payload.sub, email: payload.email },
        "15m"
      );
      const newRefreshToken = jwtProvider.sign(
        { sub: payload.sub, type: "refresh" },
        "7d"
      );
      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  });

  router.post("/logout", (req: Request, res: Response) => {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      tokenBlacklist.add(header.slice(7));
    }
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      tokenBlacklist.add(refreshToken);
    }
    res.status(204).send();
  });

  return router;
}
