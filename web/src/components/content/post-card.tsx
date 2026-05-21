import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PublishedPost } from "@/lib/types";

function formatDate(iso: string, language: "ru" | "en") {
  const d = new Date(iso);
  return d.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function readingLabel(min: number, language: "ru" | "en") {
  return language === "ru" ? `${min} мин чтения` : `${min} min read`;
}

export function PostCard({ post }: { post: PublishedPost }) {
  return (
    <Link
      href={{ pathname: "/post", query: { slug: post.slug } }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={post.imageUrl}
          alt={post.metaTitle}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute left-3 top-3">
          <Badge
            variant="outline"
            className="bg-background/90 font-mono text-[10px] backdrop-blur"
          >
            {post.language.toUpperCase()}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
          {post.metaTitle}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {post.metaDescription}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={20}
              height={20}
              className="size-5 shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-[11px] text-foreground">
              {post.author.name}
            </span>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {readingLabel(post.readingTimeMin, post.language)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-mono">/{post.slug}</span>
          <span>{formatDate(post.publishedAt, post.language)}</span>
        </div>
      </div>
    </Link>
  );
}
