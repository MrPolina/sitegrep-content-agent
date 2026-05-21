import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ArticleView } from "@/components/content/article-view";
import { getPostBySlug } from "@/lib/job-store";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:py-14">
        <div className="pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden>←</span>
            <span>Назад в галерею</span>
          </Link>
        </div>
        <ArticleView post={post} />
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6 text-[11px] text-muted-foreground">
          <span>Sitegrep · Content Agent</span>
          <span className="font-mono">MVP — mock pipeline</span>
        </div>
      </footer>
    </>
  );
}
