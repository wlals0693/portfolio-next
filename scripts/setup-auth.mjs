import { randomBytes } from "node:crypto";
import { readFile, appendFile } from "node:fs/promises";
const path = new URL("../.env.local", import.meta.url);
let contents = "";
try {
  contents = await readFile(path, "utf8");
} catch {}
if (!/^AUTH_SECRET=.+/m.test(contents)) {
  await appendFile(
    path,
    `\nAUTH_SECRET=${randomBytes(48).toString("base64url")}\n`,
  );
  console.log("AUTH_SECRET 생성 완료 (.env.local에만 저장, 값 비공개)");
} else console.log("기존 AUTH_SECRET 유지");
