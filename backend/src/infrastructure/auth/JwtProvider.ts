import jwt, { type SignOptions } from "jsonwebtoken";
import type { IJwtProvider } from "../../ports/IJwtProvider.js";

export class JwtProvider implements IJwtProvider {
  constructor(private readonly secret: string) {}

  sign(payload: Record<string, unknown>, expiresIn: string): string {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): Record<string, unknown> {
    return jwt.verify(token, this.secret) as Record<string, unknown>;
  }
}
