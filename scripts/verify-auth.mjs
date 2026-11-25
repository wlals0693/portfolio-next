import nextEnv from "@next/env";
import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
nextEnv.loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const marker = `auth-test-${randomUUID().slice(0, 8)}`;
const password = randomBytes(24).toString("base64url");
const emails = [
  `${marker}-a@example.com`,
  `${marker}-b@example.com`,
  `${marker}-admin@example.com`,
];
let projectId,
  statusBefore,
  statusTouched = false;
class Client {
  cookies = new Map();
  async send(path, body, method = "POST", form = false) {
    const r = await fetch(base + path, {
      method,
      redirect: "manual",
      headers: {
        Origin: new URL(base).origin,
        Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
        ...(body
          ? {
              "Content-Type": form
                ? "application/x-www-form-urlencoded"
                : "application/json",
            }
          : {}),
      },
      ...(body
        ? {
            body: form
              ? new URLSearchParams(body).toString()
              : JSON.stringify(body),
          }
        : {}),
      signal: AbortSignal.timeout(30000),
    });
    for (const cookie of r.headers.getSetCookie()) {
      const raw = cookie.split(";")[0];
      const at = raw.indexOf("=");
      this.cookies.set(raw.slice(0, at), raw.slice(at + 1));
    }
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data, headers: r.headers };
  }
  async login(email) {
    const csrf = await this.send("/api/auth/csrf", undefined, "GET");
    assert.ok(csrf.data.csrfToken);
    await this.send(
      "/api/auth/callback/credentials",
      {
        csrfToken: csrf.data.csrfToken,
        email,
        password,
        callbackUrl: base + "/projects",
      },
      "POST",
      true,
    );
    const s = await this.send("/api/auth/session", undefined, "GET");
    assert.equal(s.data.user?.email, email, "실제 로그인 실패");
    return s.data.user;
  }
}
const anon = new Client(),
  a = new Client(),
  b = new Client(),
  admin = new Client();
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
  const db = mongoose.connection;
  for (const email of emails) {
    const r = await anon.send("/api/register", {
      name: marker,
      email,
      password,
      role: "admin",
    });
    assert.equal(r.status, 201, `registration HTTP ${r.status}`);
    const u = await db.collection("users").findOne({ email });
    assert.equal(u.role, "user");
    assert.notEqual(u.passwordHash, password);
  }
  await db
    .collection("users")
    .updateOne({ email: emails[2] }, { $set: { role: "admin" } });
  const au = await a.login(emails[0]);
  await b.login(emails[1]);
  assert.equal((await admin.login(emails[2])).role, "admin");
  console.log("PASS: Auth.js 실제 로그인·해시 저장·회원가입 role 조작 차단");
  assert.equal(
    (await anon.send("/api/projects", { password: "5425" })).status,
    401,
  );
  assert.equal((await a.send("/api/projects", {})).status, 403);
  assert.equal(
    (await anon.send("/api/messages/inbox", { password: "5425" })).status,
    401,
  );
  assert.equal((await a.send("/api/messages/inbox", {})).status, 403);
  assert.equal((await admin.send("/api/messages/inbox", {})).status, 200);
  console.log("PASS: 비로그인401·일반회원403·관리자 메시지 조회 허용");
  const input = {
    title: marker,
    category: "기타",
    status: "진행 중",
    summary: marker,
    tech: "Next.js,Auth.js",
    features: "RBAC,IDOR",
    deployUrl: "",
    githubUrl: "",
    videoUrl: "",
    image: "",
  };
  const created = await admin.send("/api/projects", input);
  assert.equal(created.status, 201);
  projectId = created.data.project.id;
  assert.equal(
    (await a.send(`/api/projects/${projectId}`, input, "PATCH")).status,
    403,
  );
  assert.equal(
    (await a.send(`/api/projects/${projectId}`, undefined, "DELETE")).status,
    403,
  );
  assert.equal(
    (
      await admin.send(
        `/api/projects/${projectId}`,
        { ...input, summary: `${marker}-edited` },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await db
        .collection("projects")
        .findOne({ _id: new mongoose.Types.ObjectId(projectId) })
    ).summary,
    `${marker}-edited`,
  );
  console.log("PASS: 관리자 프로젝트 추가·수정 및 회원 직접 API 호출 차단");
  assert.equal(
    (
      await anon.send(`/api/projects/${projectId}/comments`, {
        content: marker,
      })
    ).status,
    401,
  );
  const written = await a.send(`/api/projects/${projectId}/comments`, {
    content: marker,
    name: "위조한 작성자",
    authorId: "000000000000000000000000",
  });
  assert.equal(written.status, 201);
  const comment = written.data.comments[0];
  assert.equal(comment.authorId, au.id);
  assert.equal(comment.name, marker);
  const path = `/api/projects/${projectId}/comments/${comment.id}`;
  assert.equal(
    (await b.send(path, { content: "attack" }, "PATCH")).status,
    404,
  );
  assert.equal((await b.send(path, undefined, "DELETE")).status, 404);
  let stored = await db
    .collection("projects")
    .findOne({ _id: new mongoose.Types.ObjectId(projectId) });
  assert.equal(stored.comments[0].content, marker);
  assert.equal(
    (await a.send(path, { content: `${marker}-own-edit` }, "PATCH")).status,
    200,
  );
  assert.equal((await a.send(path, undefined, "DELETE")).status, 200);
  console.log(
    "PASS: 작성자 위조 차단·사용자 B의 IDOR 수정/삭제 거부·본인 수정/삭제 성공",
  );
  const legacyId = new mongoose.Types.ObjectId();
  await db
    .collection("projects")
    .updateOne(
      { _id: new mongoose.Types.ObjectId(projectId) },
      {
        $push: {
          comments: {
            _id: legacyId,
            name: marker,
            content: "legacy",
            createdAt: new Date(),
          },
        },
      },
    );
  const legacyPath = `/api/projects/${projectId}/comments/${legacyId}`;
  assert.equal((await a.send(legacyPath, undefined, "DELETE")).status, 404);
  assert.equal((await admin.send(legacyPath, undefined, "DELETE")).status, 200);
  console.log("PASS: 기존 익명 댓글은 일반회원 변경 불가·관리자 삭제 가능");
  statusBefore = await db
    .collection("currentstatuses")
    .findOne({ key: "wardrobe" });
  const status = {
    summary: marker,
    milestones: [{ title: "권한 검증용 임시 단계", status: "진행 과제" }],
  };
  assert.equal((await a.send("/api/current", status, "PATCH")).status, 403);
  const changed = await admin.send("/api/current", status, "PATCH");
  assert.equal(changed.status, 200);
  statusTouched = true;
  assert.equal(
    (await db.collection("currentstatuses").findOne({ key: "wardrobe" }))
      .summary,
    marker,
  );
  if (statusBefore)
    await db
      .collection("currentstatuses")
      .replaceOne({ key: "wardrobe", summary: marker }, statusBefore);
  else
    await db
      .collection("currentstatuses")
      .deleteOne({ key: "wardrobe", summary: marker });
  statusTouched = false;
  console.log("PASS: 진행 상태 관리자 DB 저장·일반회원 차단 (원래 상태 복원)");
  assert.equal(
    (await admin.send(`/api/projects/${projectId}`, undefined, "DELETE"))
      .status,
    200,
  );
  assert.equal(
    await db
      .collection("projects")
      .countDocuments({ _id: new mongoose.Types.ObjectId(projectId) }),
    0,
  );
  await db
    .collection("users")
    .updateOne({ email: emails[2] }, { $set: { role: "user" } });
  assert.equal((await admin.send("/api/messages/inbox", {})).status, 403);
  console.log("PASS: 프로젝트 삭제·기존 로그인 세션에 권한 회수 반영");
} catch (e) {
  console.error(
    "검증 실패:",
    e instanceof assert.AssertionError ? e.message : e.code || e.name,
  );
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState === 1) {
    const db = mongoose.connection;
    if (statusTouched) {
      if (statusBefore)
        await db
          .collection("currentstatuses")
          .replaceOne({ key: "wardrobe", summary: marker }, statusBefore);
      else
        await db
          .collection("currentstatuses")
          .deleteOne({ key: "wardrobe", summary: marker });
    }
    await db.collection("projects").deleteMany({ title: marker });
    await db.collection("users").deleteMany({ email: { $in: emails } });
    console.log("검증용 계정·프로젝트 정리 완료. 기존 사용자 데이터 유지.");
  }
  await mongoose.disconnect();
}
