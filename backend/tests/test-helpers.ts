import http from "http";

const TEST_PORT = Number(process.env.TEST_PORT) || 5000;
export const BASE_URL = process.env.TEST_BASE_URL ?? `http://localhost:${TEST_PORT}`;

const HEALTH_TIMEOUT_MS = 30000;

export function isServerUp(timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/health`, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * El servidor de pruebas lo levanta una sola vez el `globalSetup` de Vitest
 * (tests/global-setup.ts). Aquí solo esperamos a que esté sano para que un
 * fallo de arranque se reporte en el archivo de test que lo necesite.
 */
export async function startServer() {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await isServerUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `El servidor de pruebas no respondió en ${BASE_URL}/health (¿PostgreSQL está corriendo?)`
  );
}

/** No-op: el ciclo de vida del servidor vive en el `globalSetup`. */
export function stopServer() {}
