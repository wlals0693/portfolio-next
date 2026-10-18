import nextEnv from "@next/env";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { setServers } from "node:dns/promises";
nextEnv.loadEnvConfig(process.cwd());
if (!process.env.MONGODB_URI)
  throw new Error(".env.local에 MONGODB_URI를 설정해주세요.");
const seeds = JSON.parse(
  await readFile(new URL("../data/projects.json", import.meta.url), "utf8"),
);
try {
  const options = {
    dbName: process.env.MONGODB_DB || "portfolio",
    serverSelectionTimeoutMS: 8000,
  };
  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
  } catch (error) {
    if (error?.code !== "ECONNREFUSED" || error?.syscall !== "querySrv") throw error;
    setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(process.env.MONGODB_URI, options);
  }
  const collection = mongoose.connection.collection("projects");
  for (const [i, p] of seeds.entries())
    await collection.updateOne(
      { seedKey: `legacy-${i}` },
      {
        $setOnInsert: {
          ...p,
          seedKey: `legacy-${i}`,
          likes: 0,
          likedBy: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  console.log("기존 프로젝트 5개 시드 완료 (기존 데이터 유지).");
} catch (error) {
  console.error("MongoDB 연결/시드 실패:", error?.code || error?.name || "UnknownError", "단계:", error?.syscall || "connect");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
