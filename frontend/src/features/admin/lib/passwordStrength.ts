export interface PasswordStrength {
  /** 0 a 4 segmentos encendidos. Solo visual: no bloquea el envío. */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  bar: string;
}

/** Medidor simple de fortaleza; la regla real sigue siendo el mínimo de 6. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Sin contraseña", bar: "bg-slate-200" };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const normalized = Math.max(1, Math.min(4, score)) as 1 | 2 | 3 | 4;
  const meta: Record<1 | 2 | 3 | 4, { label: string; bar: string }> = {
    1: { label: "Floja", bar: "bg-red-500" },
    2: { label: "Aceptable", bar: "bg-amber-500" },
    3: { label: "Buena", bar: "bg-emerald-500" },
    4: { label: "Excelente", bar: "bg-emerald-600" },
  };

  return { score: normalized, label: meta[normalized].label, bar: meta[normalized].bar };
}
