import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startServer, stopServer } from "./test-helpers";

const base = "http://localhost:5000";
const suffix = Date.now().toString(36);
const username = `entrenador_${suffix}`;

let token = "";
let userId: number | null = null;
let favoriteId: number | null = null;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

describe("admin api", () => {
  beforeAll(async () => {
    await startServer();

    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "pablito", password: "pablito2026" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    token = data.token;
  });

  afterAll(async () => {
    if (userId && token) {
      await fetch(`${base}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      }).catch(() => {});
    }
    stopServer();
  });

  it("inicia sesión con la cuenta administradora", async () => {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "pablito", password: "pablito2026" }),
    });
    const data = await res.json();
    expect(data.user.role).toBe("admin");
    expect(data.token).toBeTruthy();
  });

  it("rechaza credenciales incorrectas", async () => {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "pablito", password: "incorrecta" }),
    });
    expect(res.status).toBe(401);
  });

  it("protege las rutas de administración", async () => {
    const res = await fetch(`${base}/api/admin/users`);
    expect(res.status).toBe(401);
  });

  it("crea, lista y actualiza entrenadores", async () => {
    const create = await fetch(`${base}/api/admin/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        username,
        password: "clave123",
        name: "Entrenador de Prueba",
        role: "trainer",
      }),
    });
    expect(create.status).toBe(201);
    const created = await create.json();
    userId = created.id;
    expect(created.username).toBe(username);
    expect(created.role).toBe("trainer");

    const list = await fetch(`${base}/api/admin/users`, { headers: authHeaders() });
    expect(list.status).toBe(200);
    const users = await list.json();
    expect(users.some((u: { id: number }) => u.id === userId)).toBe(true);

    const update = await fetch(`${base}/api/admin/users/${userId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ name: "Entrenador Actualizado" }),
    });
    expect(update.status).toBe(200);
    expect((await update.json()).name).toBe("Entrenador Actualizado");
  });

  it("crea, actualiza y elimina regalones desde administración", async () => {
    const create = await fetch(`${base}/api/admin/favorites`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ userId: username, pokemonId: 25, name: "pikachu" }),
    });
    expect(create.status).toBe(201);
    const favorite = await create.json();
    favoriteId = favorite.id;

    const update = await fetch(`${base}/api/admin/favorites/${favoriteId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ name: "pikachu-regalon" }),
    });
    expect(update.status).toBe(200);
    expect((await update.json()).name).toBe("pikachu-regalon");

    const remove = await fetch(`${base}/api/admin/favorites/${favoriteId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    expect(remove.status).toBe(204);
    favoriteId = null;
  });

  it("elimina un entrenador", async () => {
    const res = await fetch(`${base}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    expect(res.status).toBe(204);
    userId = null;
  });
});
