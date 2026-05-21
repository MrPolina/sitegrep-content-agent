"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Language } from "@/lib/types";

interface Props {
  disabled?: boolean;
  onSubmitted: (jobId: string) => void;
}

export function GenerationForm({ disabled, onSubmitted }: Props) {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<Language>("ru");
  const [repo, setRepo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !repo.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/content/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), language, repo: repo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Не удалось создать job");
        return;
      }
      onSubmitted(data.jobId);
      toast.success("Генерация запущена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = disabled || submitting;
  const examplesRu = [
    "Оптимизация под AI Overviews",
    "Что изменилось в Googlebot в 2026",
    "Back button hijacking: новая спам-политика",
  ];
  const examplesEn = [
    "Optimizing for AI Overviews",
    "What changed in Googlebot in 2026",
    "Back button hijacking: new spam policy",
  ];
  const examples = language === "ru" ? examplesRu : examplesEn;

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">Новая статья</CardTitle>
        <CardDescription className="text-sm">
          Опишите тему — агент проанализирует свежие публикации Google Search
          Central, найдёт content gaps и напишет оригинальную статью.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-xs font-medium">
              Тема
            </Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Например: как оптимизировать сайт под AI Overviews"
              rows={2}
              disabled={isDisabled}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setTopic(ex)}
                  className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Язык</Label>
              <ToggleGroup
                type="single"
                value={language}
                onValueChange={(v) => v && setLanguage(v as Language)}
                disabled={isDisabled}
                variant="outline"
                className="w-full"
              >
                <ToggleGroupItem value="ru" className="flex-1 h-9">
                  RU
                </ToggleGroupItem>
                <ToggleGroupItem value="en" className="flex-1 h-9">
                  EN
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo" className="text-xs font-medium">
                GitHub репозиторий
              </Label>
              <Input
                id="repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="user/seo-content"
                disabled={isDisabled}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Источник:{" "}
              <span className="font-mono">developers.google.com/search/blog</span>
            </p>
            <Button
              type="submit"
              disabled={isDisabled || !topic.trim() || !repo.trim()}
              className="h-9"
            >
              {submitting ? "Запуск…" : "Сгенерировать"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
