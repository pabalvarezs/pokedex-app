import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startServer, stopServer } from "./test-helpers";

const BASE_URL = "http://localhost:5000";

describe("favorites api", () => {
  let token = "";
  let authHeaders: Record<string, string> = {};

  beforeAll(async () => {
    await startServer();
    const login = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "pablito", password: "pablito2026" }),
    });
    const body = (await login.json()) as { token: string };
    token = body.token;
    authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  });

  afterAll(() => {
    stopServer();
  });

  it("rechaza peticiones sin token", async () => {
    const res = await fetch(`${BASE_URL}/api/favorites`);
    expect(res.status).toBe(401);
  });

  it("CRUD cycle", async () => {
    const base = `${BASE_URL}/api/favorites`;
    await fetch(`${base}/25`, { method: "DELETE", headers: authHeaders }).catch(() => {});
    const post = await fetch(base, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ pokemonId: 25, name: "pikachu" }),
    });
    expect(post.status).toBe(201);
    const check = await fetch(`${base}/25/check`, { headers: authHeaders });
    expect((await check.json()).favorite).toBe(true);
    const del = await fetch(`${base}/25`, { method: "DELETE", headers: authHeaders });
    expect(del.status).toBe(204);
  });
});
