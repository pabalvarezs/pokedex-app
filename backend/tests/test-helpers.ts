import http from "http";
import { spawn } from "child_process";

let serverPid: number | null = null;
let ownsServer = false;

function isServerUp(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:5000/health", (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function startServer() {
  if (await isServerUp()) {
    ownsServer = false;
    return;
  }
  return new Promise<void>((resolve, reject) => {
    const proc = spawn("npx", ["tsx", "src/index.ts"], {
      cwd: "/opt/data/pokedex-app/backend",
      stdio: ["ignore", "pipe", "pipe"],
    });
    serverPid = proc.pid;
    ownsServer = true;
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        proc.kill("SIGTERM");
        reject(new Error("server did not start in time"));
      }
    }, 30000);
    const poll = () => {
      http
        .get("http://localhost:5000/health", (res) => {
          if (res.statusCode === 200) {
            resolved = true;
            clearTimeout(timeout);
            resolve();
            res.resume();
          } else {
            res.resume();
            setTimeout(poll, 500);
          }
        })
        .on("error", () => setTimeout(poll, 500));
    };
    poll();
    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export function stopServer() {
  if (ownsServer && serverPid) {
    try {
      process.kill(serverPid, "SIGTERM");
    } catch {}
    serverPid = null;
    ownsServer = false;
  }
}
