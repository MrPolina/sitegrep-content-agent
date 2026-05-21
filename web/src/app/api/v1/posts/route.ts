import { NextResponse } from "next/server";
import { listPosts } from "@/lib/job-store";

export async function GET() {
  return NextResponse.json({ posts: listPosts() });
}
