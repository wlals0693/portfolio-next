import { auth } from "@/auth";
import { UserModel } from "@/lib/models";
import { connectDB } from "@/lib/db";
import { HttpError } from "@/lib/api";
export async function requireUser(request?: Request) {
  if (request) {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new HttpError(403, "허용되지 않은 요청입니다.");
  }
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, "로그인이 필요합니다.");
  // 세션 값만 믿지 않고 실제 계정과 현재 권한도 확인합니다.
  await connectDB();
  const user = await UserModel.findById(session.user.id)
    .select("name email role")
    .lean();
  if (!user) throw new HttpError(401, "다시 로그인해주세요.");
  return {
    id: String(user._id),
    name: String(user.name),
    role: user.role as "user" | "admin",
  };
}
export async function requireAdmin(request?: Request) {
  const user = await requireUser(request);
  if (user.role !== "admin")
    throw new HttpError(403, "관리자 권한이 필요합니다.");
  return user;
}
