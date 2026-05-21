# Sitegrep — Content Agent

AI-агент для генерации SEO-статей на основе анализа авторитетных источников.
Часть продуктового набора **Sitegrep / COre** (см. [`Agent.md`](Agent.md)).

## Что это

- **Input:** тема + язык (RU/EN) + GitHub-репозиторий для публикации
- **Pipeline:** RSS-индекс Google Search Central → выбор релевантных постов → парсинг страниц → gap-анализ → генерация статьи + hero-image → коммит в GitHub
- **Output:** готовая статья в `posts/<lang>/<slug>.md` + изображение в `images/<slug>.png`

Документация:
- [`PRD.md`](PRD.md) — продуктовые требования
- [`Agent.md`](Agent.md) — контекст проекта Sitegrep
- [`SKILL.md`](SKILL.md) — design system (B/W minimalist, shadcn)

## Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 16 / React 19 / TypeScript / Tailwind v4 / shadcn/ui |
| Backend (планируется) | Go 1.22+ |
| LLM | Anthropic API (Sonnet 4.6 + Haiku 4.5) |
| Image gen | Replicate (Flux Schnell) |
| Publish | GitHub Contents API |

## Структура репозитория

```
.
├── web/                  # Next.js фронтенд (UI + mock API для MVP)
├── backend/              # Go-сервис (будет добавлен)
├── PRD.md                # Product requirements
├── Agent.md              # Контекст Sitegrep
└── SKILL.md              # Design system
```

## Локальный запуск

```bash
cd web
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

В текущем MVP backend pipeline замокан в Next.js API routes
(`web/src/app/api/v1/content/jobs/`).
Реальная интеграция с Anthropic / Replicate / GitHub переедет в Go-сервис.

## Статус MVP

| Компонент | Статус |
|---|---|
| UI (форма, прогресс, превью) | ✅ Готово |
| Mock pipeline | ✅ Готово |
| Реальный crawler (Go) | ⏳ Следующая итерация |
| Anthropic-генерация | ⏳ Следующая итерация |
| Replicate-изображение | ⏳ Следующая итерация |
| GitHub публикация | ⏳ Следующая итерация |
