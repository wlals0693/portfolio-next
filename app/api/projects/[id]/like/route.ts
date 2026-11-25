import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidObjectId } from "mongoose";
import { randomUUID } from "node:crypto";
import { connectDB } from "@/lib/db";
import { ProjectModel } from "@/lib/models";
import { failure, databaseRequired, InputError } from "@/lib/api";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    databaseRequired();
    const { id } = await params;
    if (!isValidObjectId(id)) throw new InputError("잘못된 프로젝트입니다.");
    await connectDB();
    const jar = await cookies();
    const visitor = jar.get("portfolio-visitor")?.value || randomUUID();
    const p = await ProjectModel.findOneAndUpdate(
      { _id: id, likedBy: { $ne: visitor } },
      { $inc: { likes: 1 }, $addToSet: { likedBy: visitor } },
      { returnDocument: "after" },
    ).lean();
    const existing = p || (await ProjectModel.findById(id).lean());
    if (!existing)
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 },
      );
    const res = NextResponse.json({ likes: existing.likes, liked: true });
    res.cookies.set("portfolio-visitor", visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 31536000,
      path: "/",
    });
    return res;
  } catch (e) {
    return failure(e);
  }
}
