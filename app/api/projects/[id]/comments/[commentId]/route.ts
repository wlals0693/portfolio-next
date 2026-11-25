import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { requireUser } from "@/lib/permissions";
import { ProjectModel } from "@/lib/models";
import { failure, text, HttpError } from "@/lib/api";
import { serializeProject } from "@/lib/projects";
type Context = { params: Promise<{ id: string; commentId: string }> };
async function change(request: Request, { params }: Context, remove: boolean) {
  try {
    const user = await requireUser(request);
    const { id, commentId } = await params;
    if (!isValidObjectId(id) || !isValidObjectId(commentId))
      throw new HttpError(404, "댓글을 찾을 수 없습니다.");
    // IDOR 방어: 댓글 id와 작성자 id를 하나의 DB 갱신 조건으로 묶습니다.
    // 관리자는 삭제만 가능하고, 다른 사람의 글을 대신 수정하지 않습니다.
    const selector: Record<string, unknown> = { _id: commentId };
    if (!(remove && user.role === "admin")) selector.authorId = user.id;
    const filter = { _id: id, comments: { $elemMatch: selector } };
    const update = remove
      ? { $pull: { comments: { _id: commentId } } }
      : {
          $set: {
            "comments.$.content": text((await request.json()).content, 1000),
          },
        };
    const project = await ProjectModel.findOneAndUpdate(filter, update, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
    if (!project)
      throw new HttpError(404, "댓글이 없거나 변경 권한이 없습니다.");
    return NextResponse.json({ comments: serializeProject(project).comments });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(r: Request, c: Context) {
  return change(r, c, false);
}
export async function DELETE(r: Request, c: Context) {
  return change(r, c, true);
}
