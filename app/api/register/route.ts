import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { text, InputError, failure } from "@/lib/api";
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return NextResponse.json(
        { error: "허용되지 않은 요청입니다." },
        { status: 403 },
      );
    const body = await request.json();
    const name = text(body.name, 40);
    const email = text(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new InputError("이메일 주소를 확인해주세요.");
    if (password.length < 10 || Buffer.byteLength(password) > 72)
      throw new InputError(
        "비밀번호는 10자 이상, UTF-8 기준 72바이트 이하여야 합니다.",
      );
    await connectDB();
    await UserModel.init();
    // role 등 요청의 다른 값은 사용하지 않습니다. 모든 가입자는 user입니다.
    await UserModel.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "user",
    });
    return NextResponse.json(
      { message: "가입되었습니다. 로그인해주세요." },
      { status: 201 },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    )
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 },
      );
    return failure(error);
  }
}
