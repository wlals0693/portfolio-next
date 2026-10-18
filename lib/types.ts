export type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};
export type Project = {
  id: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  tech: string[];
  features: string[];
  image: string;
  deployUrl: string;
  githubUrl: string;
  videoUrl: string;
  likes: number;
  comments: Comment[];
};
