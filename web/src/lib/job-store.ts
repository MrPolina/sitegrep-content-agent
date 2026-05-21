import type {
  Job,
  JobResult,
  JobStep,
  JobStepState,
  Language,
  PublishedPost,
} from "./types";

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

type JobsStore = Map<string, Job>;
type PostsStore = Map<string, PublishedPost>;

const jobsKey = "__sitegrep_content_jobs__";
const postsKey = "__sitegrep_content_posts__";
const g = globalThis as unknown as {
  [jobsKey]?: JobsStore;
  [postsKey]?: PostsStore;
};
if (!g[jobsKey]) g[jobsKey] = new Map();
if (!g[postsKey]) g[postsKey] = new Map();
const jobsStore: JobsStore = g[jobsKey]!;
const postsStore: PostsStore = g[postsKey]!;

const IMAGES = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop",
  "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1200&h=675&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&fit=crop",
];

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
  jobsStore.set(id, job);
  startMockPipeline(id);
  return job;
}

export function getJob(id: string): Job | null {
  return jobsStore.get(id) ?? null;
}

export function listPosts(): PublishedPost[] {
  return [...postsStore.values()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function getPostBySlug(slug: string): PublishedPost | null {
  return postsStore.get(slug) ?? null;
}

function publishPost(job: Job, result: JobResult) {
  const post: PublishedPost = {
    ...result,
    topic: job.topic,
    publishedAt: new Date().toISOString(),
    repo: job.repo,
  };
  postsStore.set(post.slug, post);
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

function pickImage(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return IMAGES[h % IMAGES.length];
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
    const job = jobsStore.get(id);
    if (!job) return;
    if (stepIdx >= timings.length) {
      job.status = "succeeded";
      job.progress = 100;
      const result = buildMockResult(job);
      job.result = result;
      jobsStore.set(id, job);
      publishPost(job, result);
      return;
    }
    const [step, delay] = timings[stepIdx];
    job.status = "running";
    job.steps = job.steps.map((s) =>
      s.id === step ? { ...s, status: "running" } : s
    );
    jobsStore.set(id, job);

    setTimeout(() => {
      const j = jobsStore.get(id);
      if (!j) return;
      j.steps = j.steps.map((s) =>
        s.id === step ? { ...s, status: "done" } : s
      );
      stepIdx += 1;
      j.progress = Math.round((stepIdx / timings.length) * 100);
      jobsStore.set(id, j);
      tick();
    }, delay);
  };

  tick();
}

const SOURCES = [
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

const GAPS_RU = [
  "Конкретные примеры разметки контента под AI Overviews",
  "Чек-лист для аудита существующих страниц перед оптимизацией",
  "Edge-кейсы: что делать, если страница не индексируется неделями",
  "Метрики, по которым можно оценить успех в первые 30 дней",
];

const GAPS_EN = [
  "Concrete markup examples for AI Overviews optimization",
  "Audit checklist for existing pages before re-optimization",
  "Edge cases: what to do when a page is not indexed for weeks",
  "Metrics to measure success within the first 30 days",
];

function articleRu(topic: string) {
  return `# ${topic}

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
}

function articleEn(topic: string) {
  return `# ${topic}

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
}

function buildMockResult(job: Job): JobResult {
  const slug = transliterate(job.topic) || "article";
  const isRu = job.language === "ru";

  return {
    slug,
    language: job.language,
    metaTitle: isRu
      ? `${job.topic}: полный гайд 2026`
      : `${job.topic}: complete 2026 guide`,
    metaDescription: isRu
      ? `Как адаптировать контент под изменения Google в 2026 году — практические шаги и чек-листы.`
      : `How to adapt content to Google's 2026 changes — practical steps and checklists.`,
    articleMd: isRu ? articleRu(job.topic) : articleEn(job.topic),
    imageUrl: pickImage(slug + job.language),
    gaps: isRu ? GAPS_RU : GAPS_EN,
    sources: SOURCES,
    githubUrl: `https://github.com/${job.repo}/blob/main/posts/${job.language}/${slug}.md`,
  };
}

function seedPosts(store: PostsStore) {
  const now = Date.now();
  const seeds: Array<{
    topic: string;
    language: Language;
    daysAgo: number;
  }> = [
    { topic: "Оптимизация под AI Overviews", language: "ru", daysAgo: 1 },
    { topic: "Optimizing for AI Overviews", language: "en", daysAgo: 2 },
    {
      topic: "Что изменилось в Googlebot в 2026",
      language: "ru",
      daysAgo: 4,
    },
    {
      topic: "Back button hijacking: новая спам-политика",
      language: "ru",
      daysAgo: 7,
    },
    {
      topic: "What changed in Googlebot in 2026",
      language: "en",
      daysAgo: 10,
    },
    {
      topic: "Discover Core Update February 2026",
      language: "en",
      daysAgo: 14,
    },
  ];
  for (const s of seeds) {
    const job: Job = {
      id: "seed-" + transliterate(s.topic),
      topic: s.topic,
      language: s.language,
      repo: "MrPolina/seo-content",
      status: "succeeded",
      progress: 100,
      steps: initialSteps().map((st) => ({ ...st, status: "done" })),
      result: null,
      error: null,
      createdAt: new Date(now - s.daysAgo * 86400_000).toISOString(),
    };
    const result = buildMockResult(job);
    const post: PublishedPost = {
      ...result,
      topic: job.topic,
      publishedAt: job.createdAt,
      repo: job.repo,
    };
    store.set(post.slug, post);
  }
}

// Seed once on module init, after all function/const declarations are evaluated.
if (postsStore.size === 0) seedPosts(postsStore);
