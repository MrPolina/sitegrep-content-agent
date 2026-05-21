import type { Job, JobStep, JobStepState, Language } from "./types";

const STEP_LABELS: Record<JobStep, string> = {
  "fetch-index": "Получение RSS-индекса",
  "pick-relevant": "Выбор релевантных постов",
  "crawl-pages": "Загрузка страниц",
  "extract-content": "Извлечение контента",
  "generate-article": "Генерация статьи",
  "generate-image": "Генерация изображения",
  "publish-github": "Публикация в GitHub",
};

const STEP_ORDER: JobStep[] = [
  "fetch-index",
  "pick-relevant",
  "crawl-pages",
  "extract-content",
  "generate-article",
  "generate-image",
  "publish-github",
];

const initialSteps = (): JobStepState[] =>
  STEP_ORDER.map((id) => ({ id, label: STEP_LABELS[id], status: "pending" }));

type Store = Map<string, Job>;

const globalKey = "__sitegrep_content_jobs__";
const g = globalThis as unknown as { [globalKey]?: Store };
if (!g[globalKey]) g[globalKey] = new Map();
const store: Store = g[globalKey]!;

export function createJob(input: {
  topic: string;
  language: Language;
  repo: string;
}): Job {
  const id = crypto.randomUUID();
  const job: Job = {
    id,
    topic: input.topic,
    language: input.language,
    repo: input.repo,
    status: "pending",
    progress: 0,
    steps: initialSteps(),
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
  };
  store.set(id, job);
  // Fake async pipeline — advance the job over time.
  startMockPipeline(id);
  return job;
}

export function getJob(id: string): Job | null {
  return store.get(id) ?? null;
}

function transliterate(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .split("")
    .map((c) => (map[c] !== undefined ? map[c] : c))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function startMockPipeline(id: string) {
  const timings: Array<[JobStep, number]> = [
    ["fetch-index", 800],
    ["pick-relevant", 1500],
    ["crawl-pages", 2000],
    ["extract-content", 1200],
    ["generate-article", 4000],
    ["generate-image", 2500],
    ["publish-github", 1000],
  ];

  let stepIdx = 0;
  const tick = () => {
    const job = store.get(id);
    if (!job) return;
    if (stepIdx >= timings.length) {
      job.status = "succeeded";
      job.progress = 100;
      job.result = buildMockResult(job);
      store.set(id, job);
      return;
    }
    const [step, delay] = timings[stepIdx];
    // Mark current step running
    job.status = "running";
    job.steps = job.steps.map((s) =>
      s.id === step ? { ...s, status: "running" } : s
    );
    store.set(id, job);

    setTimeout(() => {
      const j = store.get(id);
      if (!j) return;
      j.steps = j.steps.map((s) =>
        s.id === step ? { ...s, status: "done" } : s
      );
      stepIdx += 1;
      j.progress = Math.round((stepIdx / timings.length) * 100);
      store.set(id, j);
      tick();
    }, delay);
  };

  tick();
}

function buildMockResult(job: Job) {
  const slug = transliterate(job.topic) || "article";
  const isRu = job.language === "ru";

  const sources = [
    {
      title: "A new resource for optimizing for generative AI in Google Search",
      url: "https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing",
    },
    {
      title:
        "Inside Googlebot: demystifying crawling, fetching, and the bytes we process",
      url: "https://developers.google.com/search/blog/2026/03/crawler-blog-post",
    },
    {
      title: "Google's February 2026 Discover Core Update",
      url: "https://developers.google.com/search/blog/2026/02/discover-core-update",
    },
  ];

  const gapsRu = [
    "Конкретные примеры разметки контента под AI Overviews",
    "Чек-лист для аудита существующих страниц перед оптимизацией",
    "Edge-кейсы: что делать, если страница не индексируется неделями",
    "Метрики, по которым можно оценить успех в первые 30 дней",
  ];
  const gapsEn = [
    "Concrete markup examples for AI Overviews optimization",
    "Audit checklist for existing pages before re-optimization",
    "Edge cases: what to do when a page is not indexed for weeks",
    "Metrics to measure success within the first 30 days",
  ];

  const articleRu = `# ${job.topic}

В мае 2026 года Google опубликовал ряд материалов, которые меняют подход к оптимизации контента под генеративный поиск. В этой статье разберём ключевые изменения и дадим практический план действий для SEO-специалистов.

## Что изменилось в подходе Google

Согласно свежим публикациям Google Search Central, классические факторы ранжирования никуда не делись — но к ним добавились новые сигналы качества, связанные с пригодностью контента для генеративных ответов.

## Практические шаги по оптимизации

1. Аудит существующих страниц по новой методологии
2. Структурирование контента в формате «вопрос → краткий ответ → расширение»
3. Усиление E-E-A-T через явное указание авторства и источников

## Часто задаваемые вопросы

**Нужно ли переписывать старые статьи?**
Только те, что теряют трафик. Свежий аудит покажет, какие именно.

**Как быстро увидеть результат?**
Первые сдвиги — через 2–4 недели после внедрения изменений.

## Заключение

Изменения Google в 2026 году — не повод паниковать, а возможность пересобрать контент-стратегию вокруг реальной пользы для читателя.`;

  const articleEn = `# ${job.topic}

In May 2026, Google published a series of materials that shift the approach to optimizing content for generative search. In this article, we break down the key changes and provide a practical action plan for SEO professionals.

## What has changed in Google's approach

According to recent Google Search Central publications, classic ranking factors haven't gone anywhere — but new quality signals related to content suitability for generative answers have been added.

## Practical optimization steps

1. Audit existing pages using the new methodology
2. Structure content in the "question → brief answer → expansion" format
3. Strengthen E-E-A-T through explicit authorship and source attribution

## Frequently Asked Questions

**Do I need to rewrite old articles?**
Only those that are losing traffic. A fresh audit will show which ones.

**How quickly will I see results?**
First shifts — within 2–4 weeks after implementing changes.

## Conclusion

Google's 2026 changes are not a reason to panic, but an opportunity to rebuild content strategy around real reader value.`;

  return {
    slug,
    language: job.language,
    metaTitle: isRu
      ? `${job.topic}: полный гайд 2026`
      : `${job.topic}: complete 2026 guide`,
    metaDescription: isRu
      ? `Как адаптировать контент под изменения Google в 2026 году — практические шаги и чек-листы.`
      : `How to adapt content to Google's 2026 changes — practical steps and checklists.`,
    articleMd: isRu ? articleRu : articleEn,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop",
    gaps: isRu ? gapsRu : gapsEn,
    sources,
    githubUrl: `https://github.com/${job.repo}/blob/main/posts/${job.language}/${slug}.md`,
  };
}
