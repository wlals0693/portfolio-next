import nextEnv from "@next/env";
import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
nextEnv.loadEnvConfig(process.cwd());
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@"))
  throw new Error("사용법: npm run admin -- 가입한이메일");
try {
  const options = {
    dbName: process.env.MONGODB_DB || "portfolio",
    serverSelectionTimeoutMS: 8000,
  };
  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
  } catch (e) {
    if (e.code !== "ECONNREFUSED" || e.syscall !== "querySrv") throw e;
    setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(process.env.MONGODB_URI, options);
  }
  const result = await mongoose.connection
    .collection("users")
    .updateOne({ email }, { $set: { role: "admin", updatedAt: new Date() } });
  if (!result.matchedCount)
    throw new Error("먼저 사이트에서 해당 이메일로 회원가입해주세요.");
  console.log("지정한 계정의 관리자 설정 완료. 새로고침하면 반영됩니다.");
} catch (e) {
  console.error(
    e.code || e.name,
    e.message?.startsWith("먼저")
      ? e.message
      : "관리자 설정에 실패했습니다. 계정과 DB 연결을 확인해주세요.",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
