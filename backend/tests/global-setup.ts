import path from "path";
import { spawn, spawnSync, type ChildProcess } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { BASE_URL, isServerUp } from "./test-helpers";

const BACKEND_DIR = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const TEST_PORT = Number(process.env.TEST_PORT) || 5000;
const START_TIMEOUT_MS = 60000;
const STOP_TIMEOUT_MS = 10000;

const require = createRequire(import.meta.url);

let server: ChildProcess | null = null;
let serverOutput = "";

async function waitForHealth(timeoutMs: number, getError: () => Error | null) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const error = getError();
    if (error) throw error;
    if (await isServerUp()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`El servidor de pruebas no respondió en ${BASE_URL}/health en ${timeoutMs} ms`);
}

async function waitForShutdown(timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await isServerUp())) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function killTree(pid: number, signal: "SIGTERM" | "SIGKILL") {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  try {
    process.kill(-pid, signal);
  } catch {
    try {
      server?.kill(signal);
    } catch {}
  }
}

/**
 * Levanta un único servidor para toda la ejecución de Vitest. Antes cada
 * archivo de test lo arrancaba y lo mataba, y el SIGTERM del `npx` wrapper se
 * propagaba con retraso: el siguiente archivo reutilizaba un servidor que
 * moría a mitad de sus peticiones (ECONNRESET).
 */
export default async function setup() {
  if (await isServerUp()) {
    console.warn(`[tests] Reutilizando el servidor existente en ${BASE_URL}`);
    return async () => {};
  }

  let spawnError: Error | null = null;

  server = spawn(process.execPath, [require.resolve("tsx/cli"), "src/index.ts"], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
  });

  server.stdout?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });
  server.once("error", (err) => {
    spawnError = err;
  });

  try {
    await waitForHealth(START_TIMEOUT_MS, () => spawnError);
  } catch (err) {
    if (server.pid) killTree(server.pid, "SIGKILL");
    server = null;
    const details = serverOutput.trim();
    throw new Error(
      `El servidor de pruebas no arrancó en ${BASE_URL}. ¿PostgreSQL está corriendo?` +
        (details ? `\n--- salida del servidor ---\n${details}` : "") +
        (err instanceof Error ? `\nCausa: ${err.message}` : "")
    );
  }

  return async function teardown() {
    const pid = server?.pid;
    if (!pid) return;

    killTree(pid, "SIGTERM");

    if (await waitForShutdown(STOP_TIMEOUT_MS)) {
      server = null;
      return;
    }

    killTree(pid, "SIGKILL");
    if (!(await waitForShutdown(STOP_TIMEOUT_MS))) {
      console.warn(`[tests] No se pudo detener el servidor de pruebas (pid ${pid})`);
    }
    server = null;
  };
}
