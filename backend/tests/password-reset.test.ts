import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startServer, stopServer, BASE_URL } from "./test-helpers";
import { prisma } from "../src/services/prisma";
import { hashResetToken } from "../src/services/passwordReset";

const base = BASE_URL;
const suffix = Date.now().toString(36);
const username = `reset_${suffix}`;
const initialPassword = "claveVieja123";

let adminToken = "";
let userId: number | null = null;

function jsonHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function forgotPassword(name: string) {
  return fetch(`${base}/api/auth/forgot-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ username: name }),
  });
}

async function login(name: string, password: string) {
  return fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ username: name, password }),
  });
}

async function resetWithToken(token: string, password: string) {
  return fetch(`${base}/api/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ token, password }),
  });
}

describe("recuperación de contraseña", () => {
  beforeAll(async () => {
    await startServer();

    const adminLogin = await login("pablito", "pablito2026");
    expect(adminLogin.status).toBe(200);
    adminToken = (await adminLogin.json()).token;

    const created = await fetch(`${base}/api/admin/users`, {
      method: "POST",
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        username,
        password: initialPassword,
        name: "Entrenador de Recuperación",
        role: "trainer",
        email: `${username}@example.com`,
      }),
    });
    expect(created.status).toBe(201);
    userId = (await created.json()).id;
  });

  afterAll(async () => {
    if (userId && adminToken) {
      await fetch(`${base}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: jsonHeaders(adminToken),
      }).catch(() => {});
    }
    await prisma.$disconnect().catch(() => {});
    stopServer();
  });

  it("responde igual para un usuario inexistente (sin enumerar cuentas)", async () => {
    const res = await forgotPassword(`fantasma_${suffix}`);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toMatch(/si el usuario existe/i);
    expect(data.devResetUrl).toBeUndefined();
  });

  it("impide registrar dos entrenadores con el mismo email", async () => {
    const res = await fetch(`${base}/api/admin/users`, {
      method: "POST",
      headers: jsonHeaders(adminToken),
      body: JSON.stringify({
        username: `dup_${suffix}`,
        password: "clave123",
        name: "Entrenador Duplicado",
        role: "trainer",
        email: `${username}@example.com`,
      }),
    });

    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/email/i);
  });

  it("genera un enlace de un solo uso, guarda solo el hash y cambia la contraseña", async () => {
    const res = await forgotPassword(username);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.devResetUrl).toContain("/restablecer/");

    const token = String(data.devResetUrl).split("/restablecer/")[1];
    expect(token).toBeTruthy();

    const stored = await prisma.passwordReset.findFirst({
      where: { userId: userId! },
      orderBy: { createdAt: "desc" },
    });
    expect(stored?.tokenHash).toBe(hashResetToken(token));
    expect(stored?.tokenHash).not.toBe(token);

    const shortPassword = await resetWithToken(token, "123");
    expect(shortPassword.status).toBe(400);

    const reset = await resetWithToken(token, "claveNueva456");
    expect(reset.status).toBe(200);

    expect((await login(username, initialPassword)).status).toBe(401);
    expect((await login(username, "claveNueva456")).status).toBe(200);

    // El mismo enlace ya no sirve.
    const reuse = await resetWithToken(token, "otraClave789");
    expect(reuse.status).toBe(400);
    expect((await reuse.json()).error).toMatch(/ya se usó|no es válido/i);
  });

  it("rechaza un token expirado", async () => {
    const token = `vencido-${suffix}`;
    await prisma.passwordReset.create({
      data: {
        userId: userId!,
        tokenHash: hashResetToken(token),
        source: "self",
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const res = await resetWithToken(token, "otraClave789");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/venció/i);
  });

  it("invalida el enlace anterior cuando se solicita uno nuevo", async () => {
    const first = await (await forgotPassword(username)).json();
    const second = await (await forgotPassword(username)).json();

    const firstToken = String(first.devResetUrl).split("/restablecer/")[1];
    const secondToken = String(second.devResetUrl).split("/restablecer/")[1];

    expect((await resetWithToken(firstToken, "clavePrimera111")).status).toBe(400);
    expect((await resetWithToken(secondToken, "claveSegunda222")).status).toBe(200);
  });

  it("permite al admin listar solicitudes y generar un enlace", async () => {
    const requested = await forgotPassword(username);
    expect(requested.status).toBe(200);

    const list = await fetch(`${base}/api/admin/password-resets`, {
      headers: jsonHeaders(adminToken),
    });
    expect(list.status).toBe(200);
    const pending = await list.json();
    expect(pending.some((item: { username: string }) => item.username === username)).toBe(true);

    const generated = await fetch(`${base}/api/admin/users/${userId}/password-reset`, {
      method: "POST",
      headers: jsonHeaders(adminToken),
    });
    expect(generated.status).toBe(201);

    const generatedData = await generated.json();
    expect(generatedData.url).toContain("/restablecer/");
    expect(generatedData.hasEmail).toBe(true);

    const token = String(generatedData.url).split("/restablecer/")[1];
    const reset = await resetWithToken(token, "claveAdmin333");
    expect(reset.status).toBe(200);
    expect((await login(username, "claveAdmin333")).status).toBe(200);
  });

  it("protege las rutas de recuperación de administración", async () => {
    const res = await fetch(`${base}/api/admin/password-resets`);
    expect(res.status).toBe(401);
  });
});
