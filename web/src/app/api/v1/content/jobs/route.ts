import { NextResponse } from "next/server";
import { createJob } from "@/lib/job-store";
import type { CreateJobRequest } from "@/lib/types";

export async function POST(req: Request) {
  let body: CreateJobRequest;
  try {
    body = (await req.json()) as CreateJobRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  const language = body.language;
  const repo = body.repo?.trim();

  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }
  if (language !== "ru" && language !== "en") {
    return NextResponse.json(
      { error: "language must be 'ru' or 'en'" },
      { status: 400 }
    );
  }
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return NextResponse.json(
      { error: "repo must be in 'user/repo' format" },
      { status: 400 }
    );
  }

  const job = createJob({ topic, language, repo });
  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
