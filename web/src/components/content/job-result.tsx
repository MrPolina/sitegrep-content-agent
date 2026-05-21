"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { JobResult } from "@/lib/types";

interface Props {
  result: JobResult;
}

export function JobResultPanel({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const copyMd = async () => {
    await navigator.clipboard.writeText(result.articleMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              {result.metaTitle}
            </CardTitle>
            <CardDescription className="text-sm">
              {result.metaDescription}
            </CardDescription>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="outline" className="font-mono text-[10px]">
                {result.language.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                /{result.slug}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={copyMd}
            >
              {copied ? "Скопировано" : "Copy MD"}
            </Button>
            {result.githubUrl && (
              <Button size="sm" className="h-8" asChild>
                <a
                  href={result.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Открыть в GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList className="h-9">
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
            <TabsTrigger value="markdown" className="text-xs">
              Markdown
            </TabsTrigger>
            <TabsTrigger value="meta" className="text-xs">
              Sources & gaps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4 space-y-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src={result.imageUrl}
                alt="hero"
                fill
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover"
              />
            </div>
            <article className="prose-content space-y-3 text-sm leading-relaxed">
              {renderMarkdown(result.articleMd)}
            </article>
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
              {result.articleMd}
            </pre>
          </TabsContent>

          <TabsContent value="meta" className="mt-4 space-y-5">
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Closed content gaps
              </h3>
              <ul className="space-y-1.5">
                {result.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </section>
            <Separator />
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sources
              </h3>
              <ul className="space-y-1.5">
                {result.sources.map((s) => (
                  <li key={s.url} className="text-sm">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Lightweight markdown renderer for preview only (headings + paragraphs + bold).
function renderMarkdown(md: string) {
  const blocks = md.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={i} className="text-xl font-semibold tracking-tight">
          {trimmed.slice(2)}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-4 text-base font-medium">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (/^\d+\./.test(trimmed)) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^\d+\.\s*/, ""));
      return (
        <ol key={i} className="list-decimal space-y-1 pl-5 text-sm">
          {items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="text-sm text-foreground/90">
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
