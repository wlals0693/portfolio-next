import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MessageModel } from "@/lib/models";
import { text, failure, databaseRequired, InputError } from "@/lib/api";
export async function POST(request: Request) {
  try {
    databaseRequired();
    const b = await request.json();
    const data = {
      name: text(b.name, 40),
      email: text(b.email, 254),
      content: text(b.content, 1000),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      throw new InputError("이메일 주소를 확인해주세요.");
    await connectDB();
    await MessageModel.create(data);
    return NextResponse.json(
      { message: "메시지가 전달되었습니다. 방문해주셔서 감사합니다!" },
      { status: 201 },
    );
  } catch (e) {
    return failure(e);
  }
}
