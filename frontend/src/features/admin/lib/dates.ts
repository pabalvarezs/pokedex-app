const TIME_ZONE = "America/Santiago";

const DAY_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Variantes que el backend podría usar para el último acceso. */
export interface LastLoginSource {
  last_login_at?: string | null;
  lastLoginAt?: string | null;
  last_login?: string | null;
}

export function getLastLoginAt(source: LastLoginSource): string | null {
  return source.last_login_at ?? source.lastLoginAt ?? source.last_login ?? null;
}

/**
 * Normaliza los formatos que llegan al panel a un `Date` válido.
 * La API serializa fechas de Prisma como ISO (YYYY-MM-DDTHH:mm:ss.sssZ),
 * pero también aceptamos el formato visible dd-MM-yyyy (y dd/MM/yyyy).
 * Para fechas sin hora usamos mediodía UTC, que cae dentro del mismo día
 * en Santiago tanto en horario de invierno como de verano.
 */
export function parseAdminDate(value: string | null | undefined): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const parsed = new Date(`${raw}T12:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parts = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (parts) {
    const day = Number(parts[1]);
    const month = Number(parts[2]);
    const year = Number(parts[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const parsed = new Date(Date.UTC(year, month - 1, day, 12));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function partsInSantiago(date: Date) {
  const values = new Map<string, string>();
  for (const part of DAY_PARTS.formatToParts(date)) {
    if (part.type !== "literal") values.set(part.type, part.value);
  }
  return {
    year: values.get("year") ?? "",
    month: values.get("month") ?? "",
    day: values.get("day") ?? "",
  };
}

/** Clave YYYY-MM-dd en zona horaria de Santiago. */
export function toDayKey(value: string | Date): string {
  const date = typeof value === "string" ? parseAdminDate(value) : value;
  if (!date) return "";
  const { year, month, day } = partsInSantiago(date);
  return `${year}-${month}-${day}`;
}

/** Fecha visible en formato dd-MM-yyyy. */
export function formatDayLabel(value: string | Date): string {
  const key = toDayKey(value);
  if (!key) return "—";
  const [year, month, day] = key.split("-");
  return `${day}-${month}-${year}`;
}

/**
 * Texto relativo en español de Chile (p. ej. "hace 2 h").
 * Devuelve la fecha absoluta cuando la diferencia es mayor a 30 días.
 */
export function formatRelativeDate(value: string | null | undefined): string {
  const date = parseAdminDate(value);
  if (!date) return "fecha desconocida";

  const deltaMs = date.getTime() - Date.now();
  const minutes = Math.abs(deltaMs) / 60_000;
  if (minutes < 1) return "ahora mismo";

  const formatter = new Intl.RelativeTimeFormat("es-CL", {
    numeric: "auto",
    style: "narrow",
  });
  if (minutes < 60) return formatter.format(Math.round(deltaMs / 60_000), "minute");
  if (minutes < 1_440) return formatter.format(Math.round(deltaMs / 3_600_000), "hour");
  if (minutes < 43_200) return formatter.format(Math.round(deltaMs / 86_400_000), "day");
  return formatDayLabel(date);
}

/**
 * Genera las claves de los últimos `days` días (incluido hoy) en Santiago.
 * Se calcula en UTC a mediodía para no cruzar de día por el offset local.
 */
export function lastDayKeys(days: number, from = new Date()): string[] {
  const keys: string[] = [];
  const cursor = new Date(`${toDayKey(from)}T12:00:00Z`);
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(cursor);
    day.setUTCDate(day.getUTCDate() - index);
    keys.push(day.toISOString().slice(0, 10));
  }
  return keys;
}
