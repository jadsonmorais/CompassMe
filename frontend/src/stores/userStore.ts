import { atom } from "nanostores";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export const $user = atom<User | null>(null);
export const $isAuthenticated = atom<boolean>(false);

export function setUser(user: User | null): void {
  $user.set(user);
  $isAuthenticated.set(user !== null);
}

export function clearUser(): void {
  $user.set(null);
  $isAuthenticated.set(false);
}
