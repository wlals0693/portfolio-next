import { NextResponse } from "next/server";
import { hasDatabase } from "./db";
export class InputError extends Error {}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function text(value: unknown, max: number, required = true) {
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.length > max
  )
    throw new InputError("입력값과 글자 수를 확인해주세요.");
  return value.trim();
}
export function url(value: unknown, required = false) {
  const v = text(value ?? "", 2048, required);
  if (!v) return "";
  try {
    const parsed = new URL(v);
    if (!["https:", "http:"].includes(parsed.protocol)) throw 0;
    return parsed.href;
  } catch {
    throw new InputError("http 또는 https 주소를 입력해주세요.");
  }
}
export function databaseRequired() {
  if (!hasDatabase()) throw new Error("DB_NOT_CONFIGURED");
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  if (error instanceof InputError)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(
    {
      error:
        error instanceof Error && error.message === "DB_NOT_CONFIGURED"
          ? "MongoDB 연결 설정이 필요합니다. 관리자에게 문의해주세요."
          : "저장하지 못했습니다. DB 연결을 확인하고 다시 시도해주세요.",
    },
    { status: 503 },
  );
}
