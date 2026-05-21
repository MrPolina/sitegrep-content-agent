"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Job, JobStepState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  job: Job;
}

function StepIcon({ status }: { status: JobStepState["status"] }) {
  if (status === "done") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.5 5L4 7.5L8.5 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "running") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full border border-foreground">
        <div className="size-2 rounded-full bg-foreground animate-pulse" />
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-destructive text-background">
        ×
      </div>
    );
  }
  return <div className="size-5 rounded-full border border-border" />;
}

export function JobProgress({ job }: Props) {
  const statusLabel: Record<Job["status"], string> = {
    pending: "Подготовка",
    running: "Выполняется",
    succeeded: "Готово",
    failed: "Ошибка",
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-medium">
              Прогресс генерации
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              <span className="font-mono text-xs">{job.id.slice(0, 8)}</span>
              {" · "}
              {job.topic}
            </CardDescription>
          </div>
          <Badge
            variant={job.status === "succeeded" ? "default" : "outline"}
            className="font-mono text-[10px]"
          >
            {statusLabel[job.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Этапы пайплайна</span>
            <span className="font-mono">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-1.5" />
        </div>

        <ol className="space-y-2.5">
          {job.steps.map((step) => (
            <li key={step.id} className="flex items-center gap-3">
              <StepIcon status={step.status} />
              <span
                className={cn(
                  "text-sm",
                  step.status === "done" && "text-foreground",
                  step.status === "running" && "text-foreground font-medium",
                  step.status === "pending" && "text-muted-foreground",
                  step.status === "failed" && "text-destructive"
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        {job.error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {job.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
