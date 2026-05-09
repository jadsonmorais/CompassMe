export interface AuraHistory {
  id: string;
  userId: string;
  date: Date;
  auraDelta: number;
  auraTotal: number;
  reason: string | null;
  createdAt: Date;
}
