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
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
          {post.metaTitle}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {post.metaDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-muted-foreground">
          <span className="font-mono">/{post.slug}</span>
          <span>{formatDate(post.publishedAt, post.language)}</span>
        </div>
      </div>
    </Link>
  );
}
