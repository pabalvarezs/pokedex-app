import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "http";
import { startServer, stopServer } from "./test-helpers";

describe("backend health", () => {
  beforeAll(async () => {
    await startServer();
  });
  afterAll(() => {
    stopServer();
  });
  it("returns ok", async () => {
    const body = await new Promise<string>((resolve, reject) => {
      http
        .get("http://localhost:5000/health", (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    });
    expect(JSON.parse(body).status).toBe("ok");
  });
});
