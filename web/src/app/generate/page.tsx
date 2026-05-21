"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { GenerationForm } from "@/components/content/generation-form";
import { JobProgress } from "@/components/content/job-progress";
import { JobResultPanel } from "@/components/content/job-result";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types";

export default function GeneratePage() {
  const [job, setJob] = useState<Job | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const isActive = job?.status === "pending" || job?.status === "running";
  const isDone = job?.status === "succeeded" && job.result;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-14">
        <div className="space-y-2 pb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Генерация SEO-статей
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Агент анализирует свежие авторитетные публикации по теме, находит
            content gaps и пишет оригинальную статью на русском или английском.
            Результат публикуется в указанный GitHub-репозиторий.
          </p>
        </div>

        <div className="space-y-6">
          <GenerationForm
            disabled={isActive}
            onStart={(cancel) => {
              cancelRef.current?.();
              cancelRef.current = cancel;
            }}
            onJobUpdate={setJob}
          />

          {job && <JobProgress job={job} />}

          {isDone && job.result && <JobResultPanel result={job.result} />}

          {isDone && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  cancelRef.current?.();
                  cancelRef.current = null;
                  setJob(null);
                }}
                className="h-8 text-xs text-muted-foreground"
              >
                Сгенерировать ещё одну статью
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6 text-[11px] text-muted-foreground">
          <span>Sitegrep · Content Agent</span>
          <span className="font-mono">MVP — client-side mock</span>
        </div>
      </footer>
    </>
  );
}
