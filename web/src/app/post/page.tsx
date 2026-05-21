"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ArticleView } from "@/components/content/article-view";
import { findPostBySlug } from "@/lib/client-store";
import type { PublishedPost } from "@/lib/types";

function PostBody() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const [post, setPost] = useState<PublishedPost | null | "loading">("loading");

  useEffect(() => {
    if (!slug) {
      setPost(null);
      return;
    }
    setPost(findPostBySlug(slug));
  }, [slug]);

  if (post === "loading") return <PostSkeleton />;
  if (!post) return <NotFound />;
  return <ArticleView post={post} />;
}

function PostSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
      <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-sm font-medium">Статья не найдена</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Возможно, ссылка устарела или статья была удалена.
      </p>
      <Link
        href="/"
        className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        Вернуться в галерею
      </Link>
    </div>
  );
}

export default function PostPage() {
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
        <Suspense fallback={<PostSkeleton />}>
          <PostBody />
        </Suspense>
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6 text-[11px] text-muted-foreground">
          <span>Sitegrep · Content Agent</span>
          <span className="font-mono">MVP — client-side mock</span>
        </div>
      </footer>
    </>
  );
}
