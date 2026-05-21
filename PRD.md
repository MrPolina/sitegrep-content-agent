# PRD: AI SEO Content Agent (MVP)

**Версия:** 0.2 (MVP / hackathon build)
**Дата:** 2026-05-21
**Автор:** —
**Статус:** Draft

---

## 1. Контекст и проблема

Инструмент входит в продуктовый набор **Sitegrep / COre** (см. `Agent.md`):
- основной продукт — canvas-first SEO-аудит-воркспейс
- параллельно командой разрабатывается **SEO-аудит агент** (другой участник)
- этот документ описывает **второй инструмент набора** — агента генерации блоговых статей

Архитектура подчиняется текущему репозиторию:
- **Frontend:** Next.js 15 / React 19 / TypeScript / Tailwind / shadcn/ui / zustand
- **Backend:** Go-сервис в `backend/` (целевой runtime)
- **Домен-модель:** `Project → Snapshot → Page → Finding` — переиспользуется

**Проблема:**
SEO-командам нужно регулярно публиковать экспертные статьи, которые:
- ранжируются (покрывают тему лучше топа выдачи)
- опираются на свежие, авторитетные источники
- не являются пересказом (E-E-A-T, оригинальность)

Существующие AI-райтеры генерируют общий текст без анализа реального контентного ландшафта и без выявления **content gaps** — что и есть главная ценность.

---

## 2. Цель MVP

End-to-end агент, который:
1. Принимает на входе: **тему**, **язык** (RU/EN), опционально источник
2. Парсит свежие авторитетные публикации (не RSS-snippet, а **полный контент страниц**)
3. Находит content gaps
4. Генерирует оригинальную статью на выбранном языке
5. Генерирует hero-изображение
6. Публикует результат в GitHub-репозиторий

**Не цель MVP:** мульти-агентная оркестрация, brand voice memory, internal linking, человеческие чекпоинты.

---

## 3. Целевая аудитория

- **Primary:** SEO-специалисты и контент-маркетологи — «AI-стажёр», пишущий черновики по свежим авторитетным данным
- **Secondary:** Агентства / владельцы блогов в быстро обновляющихся нишах

---

## 4. Источник контента (MVP)

**Стартовый источник:** Google Search Central Blog
`https://developers.google.com/search/blog/feed.xml`

**Логика работы с источником:**
1. RSS используется **только как индекс** (получить список последних URL и заголовков)
2. По выбранным URL агент **переходит на сами страницы** и собирает полный контент
3. Парсинг страницы: HTTP-GET → HTML → content extraction (readability) → чистый текст + структура (H1-H3)
4. Это **не Jina-прокси** — наш собственный Go-краулер (переиспользуем `backend/internal/crawler`)

**Почему этот источник:**
- максимальная авторитетность для SEO-тематики (= Google)
- всегда свежий контент
- бесплатно, без API-ключей
- демо-темы прямо из последних постов

**Ограничение MVP:** один источник (Google blog), тематика SEO. Произвольные источники — в v0.2.

---

## 5. Языки

**MVP поддерживает RU и EN:**
- Параметр `language: "ru" | "en"` в API/CLI
- Источник всегда английский (Google blog)
- Статья генерируется на выбранном языке
- При `ru`: meta_title/description/article — на русском; slug — латиница-транслит
- При `en`: всё на английском; slug — kebab-case

**Промпт ветвится** по языку: явная инструкция «пиши строго на русском / strictly in English», иначе тон, structure, FAQ — идентичные.

---

## 6. Пользовательский поток

### CLI (для скриптов / cron):
```bash
content-agent generate \
  --topic "Оптимизация под AI Overviews" \
  --language ru \
  --repo user/seo-content
```

### Web (Next.js form в той же оболочке Sitegrep):
1. User открывает раздел **«Content Generation»** в существующем dashboard
2. Заполняет форму: topic, language (RU/EN), GitHub repo (preset из настроек проекта)
3. Submit → создаётся **content-generation job** (та же job-инфраструктура, что и у аудита)
4. UI поллит статус через `GET /api/v1/content/jobs/{jobId}`
5. По завершении показывается превью статьи + ссылка на коммит в GitHub

### Backend pipeline (Go):
```
1. fetch RSS index → top 15 entries (title + URL)
2. relevance picker (Claude Haiku) → выбрать 3 индекса
3. crawl 3 URLs (внутренний crawler) → HTML
4. content extraction (readability) → clean text + headings
5. article generator (Claude Sonnet 4.6) → JSON { gaps, article_md, meta, image_prompt }
6. image generator (Replicate Flux) → PNG bytes
7. GitHub publisher → PUT posts/<slug>.md + images/<slug>.png
8. return job result → frontend
```

**Время выполнения:** ~40-60 секунд на статью.

---

## 7. Функциональные требования

### FR-1. Индекс источника
- Парсинг RSS-фида (15 последних записей: title, link, pubDate)
- Fail-fast при недоступности с понятным сообщением

### FR-2. Релевантность
- Быстрый LLM-вызов (Claude Haiku 4.5) выбирает 3 наиболее релевантных URL
- Output: JSON массив индексов

### FR-3. Парсинг страницы (ключевое отличие от v0.1)
- **HTTP-запрос на сам URL** (не RSS-description, не Jina-прокси)
- Респектим robots.txt и rate limits
- User-Agent: `Sitegrep-ContentAgent/0.2 (+https://sitegrep.io/bot)`
- Парсинг HTML → извлечение основного контента:
  - использовать **go-readability** или **goquery** + кастомные селекторы
  - убрать nav/footer/sidebar/ads
  - сохранить структуру: H1, H2, H3, параграфы, code blocks
- Cap по длине: до 15k символов на источник
- Параллельная загрузка 3 страниц (goroutines + errgroup)
- Кэширование на URL+ETag (sqlite/Redis опционально)

### FR-4. Gap-анализ и генерация статьи
- Один вызов Claude Sonnet 4.6 со структурированным промптом
- Промпт ветвится по `language`:
  - `ru`: «Пиши на русском языке, экспертно, без канцелярита»
  - `en`: «Write in English, expert tone, no fluff»
- Output JSON (строгая схема):
  ```json
  {
    "gaps": ["...", "..."],
    "article_md": "# ...",
    "meta_title": "...",
    "meta_description": "...",
    "slug": "...",
    "image_prompt": "..."
  }
  ```
- Требования к статье:
  - Длина: 1500-2000 слов
  - Структура: H1 → intro → 4-6 H2 (с H3 где уместно) → FAQ (3-5 Q&A) → conclusion
  - Markdown
  - Закрывает минимум 3 явно перечисленных content gaps

### FR-5. Генерация изображения
- Hero-image через Flux Schnell (Replicate API)
- Aspect ratio 16:9, PNG
- Image prompt **всегда на английском** (независимо от языка статьи) — модели лучше работают с английскими промптами
- Стиль: "modern flat tech illustration, clean, no text"

### FR-6. Публикация в GitHub
- REST Contents API (`PUT /repos/{repo}/contents/{path}`)
- Аутентификация: fine-grained PAT, `Contents: read & write`
- Два файла на статью:
  - `posts/<lang>/<slug>.md` — статья с YAML frontmatter
  - `images/<slug>.png` — изображение
- В MD относительный путь: `![hero](../../images/<slug>.png)`
- Поддержка update (если slug уже есть — передаём sha)

### FR-7. Конфигурация (env)
- `ANTHROPIC_API_KEY`
- `REPLICATE_API_TOKEN`
- `GH_TOKEN`
- `GH_REPO` (формат `user/repo`)
- `GH_BRANCH` (default: `main`)
- `CONTENT_AGENT_PORT` (default: `8081`)

### FR-8. API контракты
**Frontend → Backend:**
```
POST /api/v1/content/jobs
Body: { topic: string, language: "ru" | "en", repo?: string }
→ 202 Accepted { jobId: string }

GET /api/v1/content/jobs/{jobId}
→ 200 { status: "pending" | "running" | "succeeded" | "failed",
        progress: number,    // 0..100
        result?: { slug, githubUrl, gaps, sources },
        error?: string }
```

Совместимо с существующей job-моделью audit-агента — UI переиспользует тот же `JobsPoller`.

---

## 8. Нефункциональные требования

- **Время выполнения:** ≤ 90 секунд от submit до коммита в GitHub
- **Стоимость одного запуска:** ≤ $0.10 (Sonnet + Haiku + Flux)
- **Concurrency:** до 5 параллельных job (ограничение по Replicate)
- **Stateless backend:** job-state в памяти + опц. persistence в SQLite/Postgres (как существующий audit-pipeline)
- **Observability:** структурные логи (zap/slog), trace_id на job

---

## 9. Out of scope (MVP)

| Возможность | Причина |
|---|---|
| Произвольные источники | v0.2 |
| Keyword research / SERP-анализ | требует платных API |
| Internal linking | сложно, нужна карта сайта |
| Plagiarism / AI-detection | внешние API, удорожание |
| Brand voice memory | нужна история |
| Schema.org JSON-LD | postprocess в v0.2 |
| Multi-agent оркестрация | один LLM-вызов проще |
| Human-in-the-loop | замедлит демо |
| Cannibalization check | нужен Search Console |
| Языки кроме RU/EN | v0.3 |

---

## 10. Архитектура и tech stack

### Frontend — Next.js (в существующем app/)
- `app/content/page.tsx` — страница инструмента (форма + список генераций)
- `features/content/components/`
  - `ContentGenerationForm.tsx` (topic, language toggle RU/EN, repo input)
  - `ContentJobProgress.tsx` (поллинг прогресса, переиспользует логику аудита)
  - `ContentResultPreview.tsx` (превью MD + изображение + ссылка на GitHub)
- `features/content/store/content-store.ts` (zustand — история генераций локально)
- `services/content/api.ts` (клиент к backend)
- `types/content.ts` (контракты)

Стек идентичен существующему: React 19, TypeScript, Tailwind, shadcn/ui.

### Backend — Go (в существующем backend/)
Новый модуль `backend/internal/content/`:

```
backend/
├── cmd/api/                      (существующий, добавляются routes)
└── internal/
    ├── content/
    │   ├── handler.go            HTTP-хендлеры /api/v1/content/jobs
    │   ├── service.go            оркестрация пайплайна
    │   ├── pipeline.go           последовательность шагов (с прогрессом)
    │   ├── extractor.go          HTML → clean text (go-readability)
    │   ├── llm.go                клиент Anthropic (picker + generator)
    │   ├── image.go              клиент Replicate (Flux)
    │   ├── github.go             Contents API PUT
    │   ├── rss.go                парсинг RSS-индекса
    │   └── prompts/
    │       ├── picker.go         промпт для выбора релевантных
    │       └── article.go        промпт генератора (с веткой ru/en)
    ├── crawler/                  (существующий — переиспользуется для FR-3)
    ├── jobs/                     (существующий — переиспользуется для job-state)
    └── domain/
        └── content.go            ContentJob, ContentResult, Gap
```

**Зависимости Go:**
- `github.com/go-shiori/go-readability` — content extraction
- `github.com/PuerkitoBio/goquery` — fallback HTML-парсинг
- `github.com/mmcdole/gofeed` — RSS-парсинг
- `golang.org/x/sync/errgroup` — параллельный crawl
- `github.com/google/go-github/v62` — GitHub Contents API (или прямой REST)
- HTTP client для Anthropic / Replicate — нативный `net/http`

### Pipeline (Go-псевдокод)
```go
func (s *Service) Run(ctx context.Context, job *Job) error {
    // 1. RSS index
    items, err := s.rss.FetchTop(ctx, feedURL, 15)

    // 2. Relevance picker (Haiku)
    idxs, err := s.llm.PickRelevant(ctx, job.Topic, items)
    picked := selectByIdxs(items, idxs)
    s.jobs.Progress(job.ID, 20)

    // 3. Crawl pages (parallel)
    g, gctx := errgroup.WithContext(ctx)
    pages := make([]Page, len(picked))
    for i, p := range picked {
        i, p := i, p
        g.Go(func() error {
            html, err := s.crawler.Fetch(gctx, p.URL)
            if err != nil { return err }
            // 4. Extract clean content
            pages[i], err = s.extractor.Extract(html)
            return err
        })
    }
    if err := g.Wait(); err != nil { return err }
    s.jobs.Progress(job.ID, 50)

    // 5. Article generation (Sonnet)
    article, err := s.llm.GenerateArticle(ctx, job.Topic, job.Language, pages)
    s.jobs.Progress(job.ID, 75)

    // 6. Image
    img, err := s.image.Generate(ctx, article.ImagePrompt)
    s.jobs.Progress(job.ID, 90)

    // 7. Publish to GitHub
    url, err := s.github.Publish(ctx, job.Repo, article, img, job.Language)

    s.jobs.Complete(job.ID, &Result{
        Slug: article.Slug, GithubURL: url,
        Gaps: article.Gaps, Sources: pickedURLs(picked),
    })
    return nil
}
```

### Архитектурная диаграмма
```
┌──────────────────────────────────────────────────────────┐
│ Next.js app (existing dashboard shell)                   │
│  └─ /content                                             │
│      ├─ ContentGenerationForm   (topic, lang, repo)      │
│      ├─ ContentJobProgress       (polls Go API)          │
│      └─ ContentResultPreview     (md + image + GH link)  │
└────────────────────────┬─────────────────────────────────┘
                         │  POST /api/v1/content/jobs
                         │  GET  /api/v1/content/jobs/{id}
                         ▼
┌──────────────────────────────────────────────────────────┐
│ Go backend  (backend/)                                   │
│                                                          │
│  internal/content/handler.go                             │
│        │                                                 │
│        ▼                                                 │
│  internal/content/pipeline.go                            │
│    │                                                     │
│    ├─▶ rss.go (RSS-индекс, gofeed)                       │
│    ├─▶ llm.go (Anthropic picker — Haiku)                 │
│    ├─▶ crawler/  (parallel HTTP GET, existing)           │
│    ├─▶ extractor.go (go-readability → clean text)        │
│    ├─▶ llm.go (Anthropic generator — Sonnet)             │
│    ├─▶ image.go (Replicate Flux)                         │
│    └─▶ github.go (Contents API PUT)                      │
│                                                          │
│  internal/jobs/ (existing — job-state, progress)         │
└────────────────────────┬─────────────────────────────────┘
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
   Anthropic API    Replicate API    GitHub REST API
```

---

## 11. Структура output в GitHub

```
seo-content/
├── posts/
│   ├── ru/
│   │   ├── ai-overviews-optimizatsiya.md
│   │   └── googlebot-crawling-2026.md
│   └── en/
│       ├── ai-overviews-optimization.md
│       └── googlebot-crawling-2026.md
└── images/
    ├── ai-overviews-optimizatsiya.png
    └── ai-overviews-optimization.png
```

### Формат `posts/<lang>/<slug>.md`
```markdown
---
title: "Оптимизация под AI Overviews: полный гайд 2026"
description: "Как адаптировать контент..."
slug: ai-overviews-optimizatsiya
language: ru
sources:
  - "https://developers.google.com/search/blog/2026/05/..."
  - "https://developers.google.com/search/blog/2026/03/..."
gaps_covered:
  - "Конкретные примеры разметки..."
  - "Чек-лист для проверки..."
generated_at: "2026-05-21T18:00:00Z"
---

![hero](../../images/ai-overviews-optimizatsiya.png)

# Заголовок

[1500-2000 слов]
```

---

## 12. Метрики успеха MVP

**Демо-метрики:**
- ✅ End-to-end pipeline проходит за ≤ 90 секунд
- ✅ Сгенерированы статьи на 3 разные темы, по одной на каждом языке (3 RU + 3 EN = 6 для презентации)
- ✅ Все статьи и изображения доступны в GitHub repo
- ✅ Frontmatter содержит реальные URL источников и gaps_covered
- ✅ Текст идиоматичный (русский — без англицизмов и кальки; английский — без translation-artifacts)
- ✅ Hero-image релевантна теме

**Продуктовые метрики (v0.2+):**
- Доля статей, принятых редактором без правок (> 70%)
- Время на одну публикацию vs. ручной процесс (~10x)
- Позиции в выдаче через 30/60/90 дней

---

## 13. Риски и mitigations

| Риск | Митигейшн |
|---|---|
| Сайт-источник блокирует scraping | Респектим robots.txt, User-Agent, rate-limit; fallback на RSS-description |
| go-readability криво извлекает контент с Google blog | Кастомные CSS-селекторы для devsite-разметки в `extractor.go` |
| LLM возвращает невалидный JSON | Strip markdown-обёртки + один retry со «return STRICT JSON only» |
| Replicate slow / down | Skip image step, опубликовать без hero |
| GitHub PAT с недостаточными правами | Чек-лист в README; явная 403-ошибка в job result |
| Кириллица в slug | Транслит на бэкенде (`github.com/mozillazg/go-unidecode`) |
| Промпт даёт «AI-канцелярит» | Главная инвестиция времени — тюнинг промпта (15+ мин) |

---

## 14. Интеграция с SEO-аудит агентом (v0.2+)

Точки стыковки в рамках общего Sitegrep:
1. **Аудит выявляет thin content** → URL передаётся в content-agent в **refresh-mode** → агент переписывает с учётом свежих источников
2. **Аудит находит content gaps на сайте** → список тем → content-agent пакетно генерирует
3. **Аудит даёт internal linking opportunities** → content-agent учитывает при генерации
4. **Общий shared context** (в существующем job/snapshot-сторадже): проект клиента, brand voice, sitemap, история

Технически — оба агента живут в одном Go-сервисе, делят `internal/jobs`, `internal/crawler`, `internal/domain`.

---

## 15. Roadmap

**v0.2:**
- Произвольные источники: URL списком, sitemap, RSS любого блога
- Языки: DE, ES, FR
- Schema.org JSON-LD автогенерация
- Pull Request вместо direct commit (опция)
- Cannibalization check через существующий sitemap-индекс

**v0.3:**
- Content cluster mode (pillar + supporting)
- Refresh-mode: на вход URL клиентского сайта → агент обновляет статью
- Human-in-the-loop: утверждение брифа перед генерацией
- Превью статьи в canvas-воркспейсе Sitegrep (как новый «node type»)

**v0.4:**
- Multi-agent pipeline (researcher → outliner → writer → editor → visualizer)
- Brand voice memory (few-shot из предыдущих статей)
- Интеграция с CMS клиента (WordPress, Webflow) — публикация туда вместо GitHub

---

## 16. Открытые вопросы

1. Использовать ли существующий `internal/crawler` напрямую или сделать тонкую обёртку для content-use-case (другие требования к timeout, User-Agent, robots-policy)?
2. Хранить ли historу генераций в БД (как `Snapshot` в audit-pipeline) или достаточно GitHub-коммитов?
3. Стоит ли создавать PR вместо direct push даже в MVP — для аудита изменений редактором?
4. Нужно ли логировать стоимость каждого запуска (для будущих биллинг-метрик)?
5. Где хранить GitHub PAT — env на бэкенде (single tenant) или зашифрованный per-project (multi-tenant — v0.2+)?

---

## Приложение A. Демо-сценарии

Темы, релевантные текущему фиду Google Search Central (май 2026):

| # | RU | EN |
|---|---|---|
| 1 | Оптимизация под AI Overviews и генеративный поиск | Optimizing for AI Overviews and generative search |
| 2 | Как изменилось поведение Googlebot в 2026 | What changed in Googlebot crawling in 2026 |
| 3 | Back button hijacking: новая спам-политика | Back button hijacking: new spam policy |

CLI-команды для демо:
```bash
content-agent generate --topic "Оптимизация под AI Overviews" --language ru
content-agent generate --topic "Optimizing for AI Overviews" --language en
```

## Приложение B. Tech stack summary

| Слой | Технология | Назначение |
|---|---|---|
| Frontend | Next.js 15 / React 19 / TS | UI инструмента в существующей оболочке |
| Frontend UI | Tailwind + shadcn/ui | дизайн-консистентность с audit-агентом |
| Frontend state | zustand | история генераций локально |
| Backend | Go 1.22+ | сервис в существующем `backend/` |
| HTTP framework | стандартный `net/http` + chi/gin (как в existing) | соответствие текущей конвенции |
| RSS | `github.com/mmcdole/gofeed` | парсинг индекса |
| Content extraction | `github.com/go-shiori/go-readability` | HTML → clean text |
| HTML fallback | `github.com/PuerkitoBio/goquery` | кастомные селекторы |
| Concurrency | `golang.org/x/sync/errgroup` | parallel crawl |
| LLM | Anthropic API (Sonnet 4.6 + Haiku 4.5) | gap-анализ + генерация |
| Image gen | Replicate API (Flux Schnell) | hero-image |
| GitHub | `github.com/google/go-github/v62` или прямой REST | Contents API |
| Transliteration | `github.com/mozillazg/go-unidecode` | RU → latin slug |
| Job state | existing `internal/jobs` | переиспользование audit-инфры |
