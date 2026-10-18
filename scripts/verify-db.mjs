import nextEnv from "@next/env";
import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

nextEnv.loadEnvConfig(process.cwd());
const marker = `connection-test-${randomUUID().slice(0, 12)}`;
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
let projectId;
async function post(path, body, cookie) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(response.ok, `API 실패: ${path} (${response.status})`);
  return { data: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] };
}
try {
  const options = { dbName: process.env.MONGODB_DB || "portfolio", serverSelectionTimeoutMS: 8000 };
  try { await mongoose.connect(process.env.MONGODB_URI, options); }
  catch (error) {
    if (error?.code !== "ECONNREFUSED" || error?.syscall !== "querySrv") throw error;
    setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(process.env.MONGODB_URI, options);
  }
  const db = mongoose.connection;
  assert.equal(await db.collection("projects").countDocuments({ seedKey: /^legacy-/ }), 5);
  console.log("PASS: 기존 프로젝트 5개 저장 확인");
  const created = await post("/api/projects", { password: "5425", title: marker, category: "기타", status: "진행 중", summary: "DB 연결 검증용 임시 데이터", tech: "Next.js, MongoDB", features: "저장 확인", deployUrl: "https://example.com", githubUrl: "", videoUrl: "", image: "" });
  projectId = new mongoose.Types.ObjectId(created.data.project.id);
  assert.ok(await db.collection("projects").findOne({ _id: projectId, title: marker }));
  console.log("PASS: 관리자 프로젝트 추가 및 DB 저장");
  const liked = await post(`/api/projects/${projectId}/like`, {});
  assert.equal(liked.data.likes, 1);
  assert.ok(liked.cookie);
  const repeated = await post(`/api/projects/${projectId}/like`, {}, liked.cookie);
  assert.equal(repeated.data.likes, 1);
  const commented = await post(`/api/projects/${projectId}/comments`, { name: "연결 테스트", content: marker });
  assert.equal(commented.data.comments.length, 1);
  const stored = await db.collection("projects").findOne({ _id: projectId });
  assert.equal(stored.likes, 1);
  assert.equal(stored.comments[0].content, marker);
  assert.ok(stored.comments[0].createdAt);
  console.log("PASS: 좋아요 저장·중복 방지, 댓글 저장");
  await post("/api/messages", { name: marker, email: "test@example.com", content: marker });
  assert.equal(await db.collection("messages").countDocuments({ name: marker, content: marker }), 1);
  console.log("PASS: 메시지 DB 저장");
} catch (error) {
  console.error("검증 실패:", error instanceof assert.AssertionError ? error.message : error?.code || error?.name);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.collection("projects").deleteOne({ title: marker, ...(projectId ? { _id: projectId } : {}) });
    await mongoose.connection.collection("messages").deleteOne({ name: marker, content: marker });
    console.log("임시 테스트 데이터 정리 완료 (사용자 데이터 유지)");
  }
  await mongoose.disconnect();
}
