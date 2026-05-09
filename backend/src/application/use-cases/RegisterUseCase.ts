import { z } from "zod";
import type { IUserRepository } from "../../ports/IUserRepository.js";
import type { IHashProvider } from "../../ports/IHashProvider.js";
import type { User } from "../../domain/entities/User.js";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(100).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashProvider: IHashProvider
  ) {}

  async execute(input: RegisterInput): Promise<Omit<User, "passwordHash">> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
    }

    const passwordHash = await this.hashProvider.hash(input.password);
    const user = await this.userRepo.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName ?? null,
      dailyMultiplier: 1.0,
    });

    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
