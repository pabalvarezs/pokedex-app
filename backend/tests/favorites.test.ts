import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startServer, stopServer } from "./test-helpers";

describe("favorites api", () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(() => {
    stopServer();
  });
  it("CRUD cycle", async () => {
    const base = "http://localhost:5000/api/favorites";
    await fetch(`${base}/25`, { method: "DELETE" }).catch(() => {});
    const post = await fetch(base, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pokemonId: 25, name: "pikachu" }),
    });
    expect(post.status).toBe(201);
    const check = await fetch(`${base}/25/check`);
    expect((await check.json()).favorite).toBe(true);
    const del = await fetch(`${base}/25`, { method: "DELETE" });
    expect(del.status).toBe(204);
  });
});
