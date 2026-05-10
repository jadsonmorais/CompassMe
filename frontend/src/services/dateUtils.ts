/** Retorna data local no formato YYYY-MM-DD (sem conversão UTC). */
export function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Adiciona N dias a uma data local e retorna YYYY-MM-DD. */
export function localDateAdd(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}
