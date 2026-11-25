import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { ProjectModel } from "@/lib/models";
import { serializeProject } from "@/lib/projects";
import { failure, HttpError } from "@/lib/api";
import { requireAdmin } from "@/lib/permissions";
import { projectInput } from "@/lib/project-input";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    if (!isValidObjectId(id))
      throw new HttpError(404, "프로젝트를 찾을 수 없습니다.");
    const data = projectInput(await request.json());
    const p = await ProjectModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true },
    ).lean();
    if (!p) throw new HttpError(404, "프로젝트를 찾을 수 없습니다.");
    return NextResponse.json({ project: serializeProject(p) });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    if (!isValidObjectId(id))
      throw new HttpError(404, "프로젝트를 찾을 수 없습니다.");
    const p = await ProjectModel.findByIdAndDelete(id);
    if (!p) throw new HttpError(404, "프로젝트를 찾을 수 없습니다.");
    return NextResponse.json({ message: "프로젝트를 삭제했습니다." });
  } catch (e) {
    return failure(e);
  }
}
