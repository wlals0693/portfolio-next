import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { ProjectModel } from "@/lib/models";
import { serializeProject } from "@/lib/projects";
import { text, failure, databaseRequired, InputError } from "@/lib/api";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    databaseRequired();
    const { id } = await params;
    if (!isValidObjectId(id)) throw new InputError("잘못된 프로젝트입니다.");
    const b = await request.json();
    const comment = { name: text(b.name, 40), content: text(b.content, 1000) };
    await connectDB();
    const p = await ProjectModel.findByIdAndUpdate(
      id,
      { $push: { comments: { $each: [comment], $slice: -100 } } },
      { new: true, runValidators: true },
    ).lean();
    if (!p)
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 },
      );
    return NextResponse.json(
      { comments: serializeProject(p).comments },
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
