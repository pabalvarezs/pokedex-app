import { afterEach, describe, expect, it } from "vitest";
import {
  buildResetUrl,
  getAppUrl,
  getResetTtlMs,
  hashResetToken,
} from "../src/services/passwordReset";

const originalAppUrl = process.env.APP_URL;
const originalCors = process.env.CORS_ORIGIN;
const originalTtl = process.env.PASSWORD_RESET_TTL_MINUTES;

afterEach(() => {
  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };

  restore("APP_URL", originalAppUrl);
  restore("CORS_ORIGIN", originalCors);
  restore("PASSWORD_RESET_TTL_MINUTES", originalTtl);
});

describe("utilidades de recuperación de contraseña", () => {
  it("hashea el token de forma determinista y no guarda el valor original", () => {
    const token = "token-secreto";
    const hash = hashResetToken(token);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(token);
    expect(hashResetToken(token)).toBe(hash);
    expect(hashResetToken(`${token}-otro`)).not.toBe(hash);
  });

  it("construye la URL con APP_URL y sin doble barra", () => {
    process.env.APP_URL = "https://pokechile.cl/";
    expect(getAppUrl()).toBe("https://pokechile.cl");
    expect(buildResetUrl("abc")).toBe("https://pokechile.cl/restablecer/abc");
  });

  it("usa CORS_ORIGIN si no hay APP_URL", () => {
    delete process.env.APP_URL;
    process.env.CORS_ORIGIN = "https://pokechile.cl";
    expect(buildResetUrl("abc")).toBe("https://pokechile.cl/restablecer/abc");
  });

  it("cae a localhost cuando no hay configuración", () => {
    delete process.env.APP_URL;
    delete process.env.CORS_ORIGIN;
    expect(getAppUrl()).toBe("http://localhost:5173");
  });

  it("usa 30 minutos por defecto y respeta el override", () => {
    delete process.env.PASSWORD_RESET_TTL_MINUTES;
    expect(getResetTtlMs()).toBe(30 * 60 * 1000);

    process.env.PASSWORD_RESET_TTL_MINUTES = "10";
    expect(getResetTtlMs()).toBe(10 * 60 * 1000);

    process.env.PASSWORD_RESET_TTL_MINUTES = "0";
    expect(getResetTtlMs()).toBe(30 * 60 * 1000);
  });
});
