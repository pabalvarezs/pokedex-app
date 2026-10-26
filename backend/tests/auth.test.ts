import { describe, it, expect, afterEach, vi } from "vitest";
import { createToken, verifyToken } from "../src/services/auth";

describe("auth tokens", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("crea y verifica un token válido", () => {
    const token = createToken("pablito");
    const payload = verifyToken(token);
    expect(payload?.sub).toBe("pablito");
  });

  it("rechaza una firma alterada", () => {
    const token = createToken("pablito");
    const [payload] = token.split(".");
    expect(verifyToken(`${payload}.firma-falsa`)).toBeNull();
  });

  it("rechaza tokens malformados", () => {
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("solo-payload")).toBeNull();
  });

  it("rechaza un token vencido", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = createToken("pablito");

    vi.setSystemTime(new Date("2026-01-10T00:00:00Z"));
    expect(verifyToken(token)).toBeNull();
  });
});
