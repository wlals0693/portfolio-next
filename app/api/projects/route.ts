import { NextResponse } from "next/server";
import { ProjectModel } from "@/lib/models";
import { serializeProject } from "@/lib/projects";
import { failure } from "@/lib/api";
import { requireAdmin } from "@/lib/permissions";
import { projectInput } from "@/lib/project-input";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const data = projectInput(await request.json());
    const p = await ProjectModel.create(data);
    return NextResponse.json(
      { project: serializeProject(p.toObject()) },
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
