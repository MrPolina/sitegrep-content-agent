"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { PostCard } from "./post-card";
import type { Language, PublishedPost } from "@/lib/types";
import { loadAllPosts, getSeedPosts } from "@/lib/client-store";

type Filter = "all" | Language;

export function Gallery() {
  // Initialize with seed posts so SSG output has content; rehydrate from
  // localStorage on mount.
  const [posts, setPosts] = useState<PublishedPost[]>(() =>
    [...getSeedPosts()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  );
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const refresh = () => setPosts(loadAllPosts());
    refresh();
    const handler = () => refresh();
    window.addEventListener("sitegrep:posts:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("sitegrep:posts:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.language === filter)),
    [posts, filter]
  );

  const counts = useMemo(
    () => ({
      all: posts.length,
      ru: posts.filter((p) => p.language === "ru").length,
      en: posts.filter((p) => p.language === "en").length,
    }),
    [posts]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v) => v && setFilter(v as Filter)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="all" className="h-8 px-3 text-xs">
            Все
            <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
              {counts.all}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem value="ru" className="h-8 px-3 text-xs">
            RU
            <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
              {counts.ru}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem value="en" className="h-8 px-3 text-xs">
            EN
            <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
              {counts.en}
            </span>
          </ToggleGroupItem>
        </ToggleGroup>

        <Button asChild size="sm" className="h-8">
          <Link href="/generate">Новая статья</Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-sm font-medium">Статей пока нет</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Запустите генерацию — статьи будут появляться здесь автоматически после
        публикации.
      </p>
      <Button asChild size="sm" className="mt-2 h-8">
        <Link href="/generate">Сгенерировать первую</Link>
      </Button>
    </div>
  );
}
