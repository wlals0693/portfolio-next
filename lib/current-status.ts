import { current } from "./content";
import { connectDB, hasDatabase } from "./db";
import { CurrentStatusModel } from "./models";
export type CurrentStatus = {
  summary: string;
  milestones: { title: string; status: string }[];
};
export const initialStatus: CurrentStatus = {
  summary:
    "기획 및 기술 설계 완료, AI 초기 기술 검증 완료. 현재는 실제 모델 품질 검증과 서비스 개발을 진행하는 단계입니다.",
  milestones: current.milestones,
};
export async function getCurrentStatus(): Promise<CurrentStatus> {
  if (!hasDatabase()) return initialStatus;
  await connectDB();
  const doc = await CurrentStatusModel.findOne({ key: "wardrobe" }).lean();
  if (!doc) return initialStatus;
  return {
    summary: String(doc.summary),
    milestones: doc.milestones.map((m: { title: string; status: string }) => ({
      title: m.title,
      status: m.status,
    })),
  };
}
