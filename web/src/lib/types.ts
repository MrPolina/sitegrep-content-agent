export type Language = "ru" | "en";

export type JobStatus = "pending" | "running" | "succeeded" | "failed";

export type JobStep =
  | "fetch-index"
  | "pick-relevant"
  | "crawl-pages"
  | "extract-content"
  | "generate-article"
  | "generate-image"
  | "publish-github";

export interface JobStepState {
  id: JobStep;
  label: string;
  status: "pending" | "running" | "done" | "failed";
}

export interface JobSource {
  title: string;
  url: string;
}

export interface JobResult {
  slug: string;
  language: Language;
  metaTitle: string;
  metaDescription: string;
  articleMd: string;
  imageUrl: string;
  gaps: string[];
  sources: JobSource[];
  githubUrl: string | null;
}

export interface Job {
  id: string;
  topic: string;
  language: Language;
  repo: string;
  status: JobStatus;
  progress: number;
  steps: JobStepState[];
  result: JobResult | null;
  error: string | null;
  createdAt: string;
}

export interface CreateJobRequest {
  topic: string;
  language: Language;
  repo: string;
}
