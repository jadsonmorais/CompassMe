import { z } from "zod";
import type { IUserRepository } from "../../ports/IUserRepository.js";
import type { IHashProvider } from "../../ports/IHashProvider.js";
import type { IJwtProvider } from "../../ports/IJwtProvider.js";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashProvider: IHashProvider,
    private readonly jwtProvider: IJwtProvider,
    private readonly accessExpiry: string = "15m",
    private readonly refreshExpiry: string = "7d"
  ) {}

  async execute(input: LoginInput): Promise<AuthTokens> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
    }

    const valid = await this.hashProvider.compare(input.password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
    }

    const accessToken = this.jwtProvider.sign(
      { sub: user.id, email: user.email },
      this.accessExpiry
    );
    const refreshToken = this.jwtProvider.sign(
      { sub: user.id, type: "refresh" },
      this.refreshExpiry
    );

    return { accessToken, refreshToken };
  }
}
