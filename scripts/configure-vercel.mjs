import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

nextEnv.loadEnvConfig(process.cwd());
const cli = join(process.env.APPDATA, "npm/node_modules/vercel/dist/index.js");
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI가 없습니다.");
for (const target of process.argv[2] ? [process.argv[2]] : ["production"]) {
  for (const key of ["MONGODB_URI", "MONGODB_DB"]) {
    const result = spawnSync(process.execPath, [cli, "env", "add", key, target, "--yes", "--sensitive"], {
      input: process.env[key] || "portfolio",
      encoding: "utf8",
      windowsHide: true,
      timeout: 60000,
    });
    if (result.status !== 0) {
      console.error(`${key} (${target}) 등록 실패. Vercel 환경변수 목록을 확인하세요.`);
      let message = result.stderr || "";
      for (const value of [process.env.MONGODB_URI, process.env.MONGODB_DB]) {
        if (value) message = message.replaceAll(value, "[REDACTED]");
      }
      console.error(message);
      process.exit(1);
    }
    console.log(`${key} (${target}) 등록 완료 (값 비공개)`);
  }
}
