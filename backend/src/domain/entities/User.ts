export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  dailyMultiplier: number;
  createdAt: Date;
  updatedAt: Date;
}
