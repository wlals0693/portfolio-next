import { text, url, InputError } from "./api";
export function projectInput(b: Record<string, unknown>) {
  const list = (v: unknown) =>
    text(v, 2000)
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  if (
    !["웹 프로젝트", "프로그램", "기타"].includes(String(b.category)) ||
    !["진행 중", "완료"].includes(String(b.status))
  )
    throw new InputError("구분과 상태를 확인해주세요.");
  return {
    title: text(b.title, 100),
    category: b.category,
    status: b.status,
    summary: text(b.summary, 500),
    tech: list(b.tech),
    features: list(b.features),
    deployUrl: url(b.deployUrl),
    githubUrl: url(b.githubUrl),
    videoUrl: url(b.videoUrl),
    image: url(b.image),
  };
}
