import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProjectModel } from "@/lib/models";
import { serializeProject } from "@/lib/projects";
import { text, url, failure, databaseRequired, InputError } from "@/lib/api";
export async function POST(request: Request) {
  try {
    const b = await request.json();
    if (b.password !== "5425")
      return NextResponse.json(
        { error: "관리자 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    databaseRequired();
    const list = (v: unknown) =>
      text(v, 2000)
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
    if (
      !["웹 프로젝트", "프로그램", "기타"].includes(b.category) ||
      !["진행 중", "완료"].includes(b.status)
    )
      throw new InputError("구분과 상태를 확인해주세요.");
    const data = {
      title: text(b.title, 100),
      category: b.category,
      status: b.status,
      summary: text(b.summary, 500),
      tech: list(b.tech),
      features: list(b.features),
      deployUrl: url(b.deployUrl, true),
      githubUrl: url(b.githubUrl),
      videoUrl: url(b.videoUrl),
      image: url(b.image),
    };
    await connectDB();
    const p = await ProjectModel.create(data);
    return NextResponse.json(
      { project: serializeProject(p.toObject()) },
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
