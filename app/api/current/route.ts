import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { text, failure, InputError } from "@/lib/api";
import { CurrentStatusModel } from "@/lib/models";
import { revalidatePath } from "next/cache";
export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const b = await request.json();
    const summary = text(b.summary, 500);
    if (
      !Array.isArray(b.milestones) ||
      !b.milestones.length ||
      b.milestones.length > 20
    )
      throw new InputError("개발 단계는 1~20개여야 합니다.");
    const milestones = b.milestones.map(
      (m: { title: unknown; status: unknown }) => {
        if (!["완료", "진행 과제", "예정"].includes(String(m.status)))
          throw new InputError("단계 상태를 확인해주세요.");
        return { title: text(m.title, 150), status: m.status };
      },
    );
    await CurrentStatusModel.findOneAndUpdate(
      { key: "wardrobe" },
      { $set: { summary, milestones } },
      { upsert: true, runValidators: true },
    );
    revalidatePath("/current");
    return NextResponse.json({ summary, milestones });
  } catch (e) {
    return failure(e);
  }
}
