import { PageTitle } from "@/components/shared";
import Projects from "@/components/projects";
import { getProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";
export const metadata = { title: "Personal Project" };
export default async function Page() {
  let data;
  let error = false;
  try {
    data = await getProjects();
  } catch {
    data = { projects: [], connected: false };
    error = true;
  }
  return (
    <div className="container">
      <PageTitle
        number="01"
        title="Personal Project"
        description="개인적으로 진행한 프로젝트들을 설명합니다."
      />
      <Projects
        initial={data.projects}
        connected={data.connected}
        error={error}
      />
    </div>
  );
}
