import { connectDB, hasDatabase } from "./db";
import { ProjectModel } from "./models";
import type { Project } from "./types";
import seeds from "@/data/projects.json";
export function serializeProject(doc: Record<string, any>): Project {
  return {
    id: String(doc._id),
    title: doc.title,
    category: doc.category,
    status: doc.status,
    summary: doc.summary,
    tech: doc.tech || [],
    features: doc.features || [],
    image: doc.image || "",
    deployUrl: doc.deployUrl || "",
    githubUrl: doc.githubUrl || "",
    videoUrl: doc.videoUrl || "",
    likes: doc.likes || 0,
    comments: (doc.comments || []).map((c: Record<string, any>) => ({
      id: String(c._id),
      name: c.name,
      content: c.content,
      createdAt: new Date(c.createdAt).toISOString(),
    })),
  };
}
export async function getProjects(): Promise<{
  projects: Project[];
  connected: boolean;
}> {
  if (!hasDatabase())
    return {
      projects: seeds.map((p, i) => ({
        ...p,
        id: `preview-${i}`,
        likes: 0,
        comments: [],
      })),
      connected: false,
    };
  await connectDB();
  const docs = await ProjectModel.find().sort({ createdAt: -1 }).lean();
  return { projects: docs.map((d) => serializeProject(d)), connected: true };
}
