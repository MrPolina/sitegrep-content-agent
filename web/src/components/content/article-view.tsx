import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PublishedPost } from "@/lib/types";

function formatDate(iso: string, language: "ru" | "en") {
  const d = new Date(iso);
  return d.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleView({ post }: { post: PublishedPost }) {
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-mono text-[10px]">
            {post.language.toUpperCase()}
          </Badge>
          <span>{formatDate(post.publishedAt, post.language)}</span>
          <span>·</span>
          <span className="font-mono">/{post.slug}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">
          {post.metaTitle}
        </h1>
        <p className="text-base text-muted-foreground">{post.metaDescription}</p>
        {post.githubUrl && (
          <div className="pt-1">
            <Button asChild variant="outline" size="sm" className="h-8">
              <a href={post.githubUrl} target="_blank" rel="noopener noreferrer">
                Открыть в GitHub
              </a>
            </Button>
          </div>
        )}
      </header>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={post.imageUrl}
          alt={post.metaTitle}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="space-y-5">{renderMarkdown(post.articleMd)}</div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Closed content gaps
        </h2>
        <ul className="space-y-2">
          {post.gaps.map((g, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground" />
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sources
        </h2>
        <ul className="space-y-3">
          {post.sources.map((s) => (
            <li key={s.url} className="space-y-0.5 text-sm">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {s.title}
              </a>
              <div className="font-mono text-[11px] text-muted-foreground">
                {s.url}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function renderMarkdown(md: string) {
  const blocks = md.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("# ")) {
      // Skip the leading H1 — we render meta_title at the top instead.
      if (i === 0) return null;
      return (
        <h2 key={i} className="mt-4 text-xl font-semibold tracking-tight">
          {trimmed.slice(2)}
        </h2>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-6 text-lg font-medium tracking-tight">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (/^\d+\./.test(trimmed)) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^\d+\.\s*/, ""));
      return (
        <ol key={i} className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          {items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="text-sm leading-relaxed text-foreground/90">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-medium">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
