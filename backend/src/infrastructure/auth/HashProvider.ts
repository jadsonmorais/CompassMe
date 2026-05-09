import bcrypt from "bcryptjs";
import type { IHashProvider } from "../../ports/IHashProvider.js";

export class BcryptHashProvider implements IHashProvider {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
