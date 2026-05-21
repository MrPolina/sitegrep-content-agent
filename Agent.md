# COre Project Agent Context

This file is the working context for future agent sessions in this repository.

It should answer three things quickly:

1. What this project is for.
2. How it currently works in reality.
3. Which parts are active, transitional, or legacy.

If product requirements change, update this file first so future work starts from the current truth.

## Project Purpose

COre in this repository is the working foundation of `Sitegrep`:

- a canvas-first SEO audit workspace
- a tool that starts from a site URL or sitemap
- a system that discovers sitemap structure, crawls pages, extracts core SEO metadata, detects basic issues, and renders results visually

The long-term product direction is:

- "Miro for SEO site architecture + audit intelligence"
- repeated crawls via snapshots
- page-level findings from multiple analyzers
- future technical SEO, keyword, and AI recommendation layers

## Current Reality

The repository contains three parallel layers:

### 1. Active product shell: Next.js app at repo root

This is the part that currently drives the user-facing experience:

- dashboard
- new project flow
- crawl progress UI
- project workspace
- canvas/table/details UI
- local state persistence through `zustand`

Important current behavior:

- the frontend still runs analysis through Next.js API routes
- analysis jobs are stored as JSON files in a temp directory
- project results are persisted in browser `localStorage`
- this means the current UX is useful for product iteration, but persistence is still local and not production-grade

### 2. Rewrite target: Go backend in `backend/`

This is the intended stable backend direction for long-running crawl work:

- sitemap discovery
- concurrent page crawling
- async analysis jobs
- progress polling
- typed domain model for `Project`, `Snapshot`, `Page`, `CrawlResult`, `AuditIssue`

This backend is not yet the sole runtime used by the Next.js UI, but it represents the intended architecture for production evolution.

### 3. Legacy prototype: Python platform in `src/audit_platform/`

This is an earlier FastAPI + SQLAlchemy prototype that still documents prior thinking:

- projects
- audit runs
- sitemap discovery orchestration
- agent registry
- simple HTML dashboard

Treat it as reference material, not the main implementation path.

## What The User Can Do Today

From the current Next.js app flow:

1. Open the dashboard.
2. Create a new sitemap intelligence project.
3. Submit a website URL or load a demo project.
4. Run sitemap discovery and page crawling.
5. Poll job progress from frontend.
6. Store the final project in local browser storage.
7. Open a project workspace and inspect results on the canvas.

## Current Functional Slice

The implemented Phase 1 slice is:

- discover sitemap from `robots.txt` or common sitemap locations
- parse sitemap indexes and nested sitemap sources
- collect URLs
- crawl pages
- extract:
  - title
  - meta description
  - canonical
  - status code
- detect core metadata issues:
  - missing title
  - title too short
  - title too long
  - missing description
  - description too short
  - description too long
  - missing canonical
  - duplicate title
  - duplicate description
- build page nodes for visual canvas layout

Modules that exist in the domain/UI but are not implemented yet:

- keywords
- technical audits
- AI recommendations

These are currently modeled as `coming-soon` tabs rather than finished capabilities.

## Architecture Overview

### Frontend

Main stack:

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind`
- `shadcn/ui`
- `@xyflow/react`
- `zustand`

Important frontend locations:

- `app/`
  - routing and API routes
- `features/sitemap/components/`
  - project creation, workspace, canvas, table, filters, detail panel
- `features/projects/store/projects-store.ts`
  - local project persistence and selected-node UI state
- `types/domain.ts`
  - frontend domain contracts
- `services/sitemap/`
  - sitemap parsing, crawl orchestration, issue detection, analysis building

### Current Next.js analysis flow

Relevant files:

- `app/api/sitemap-jobs/start/route.ts`
- `app/api/sitemap-jobs/status/[jobId]/route.ts`
- `services/sitemap/analysis-jobs.ts`
- `services/sitemap/analyze-sitemap.ts`

Flow:

1. User submits a URL in `ProjectCreationForm`.
2. Frontend calls `POST /api/sitemap-jobs/start`.
3. Server creates a temp-file-backed job record.
4. `analyzeSitemap()` performs sitemap discovery and page analysis.
5. Frontend polls `GET /api/sitemap-jobs/status/{jobId}`.
6. On completion, result is inserted into the persisted `zustand` store.
7. Workspace opens from local project state.

### Go backend

Main folders:

- `backend/cmd/api`
- `backend/internal/api`
- `backend/internal/app`
- `backend/internal/config`
- `backend/internal/crawler`
- `backend/internal/domain`
- `backend/internal/jobs`
- `backend/internal/sitemap`

Current Go API:

- `GET /healthz`
- `POST /api/v1/analysis/jobs`
- `GET /api/v1/analysis/jobs/{jobId}`

Go service responsibilities today:

- create async analysis jobs
- discover sitemap sources
- crawl discovered pages concurrently
- compute progress updates
- build project + snapshot + page result payload

### Python prototype

Main folders:

- `src/audit_platform/api.py`
- `src/audit_platform/services/`
- `src/audit_platform/models.py`
- `src/audit_platform/ui/`

Use this codebase for historical understanding only unless explicitly reviving it.

## Domain Model Direction

The core domain is snapshot-based.

Primary entities:

- `Project`
- `Snapshot`
- `Page`
- `CrawlResult`
- `AuditIssue`

Design intent:

- every crawl should produce a snapshot
- findings should attach to pages within a snapshot
- future analyzers should append structured findings rather than mutate one opaque audit blob

Recommended mental model:

- `Project` is the container
- `Snapshot` is the crawl instance
- `Page` is the atomic unit of analysis
- `Finding` modules will grow around each page over time

## UX And Visual Rules

The UI currently follows `shadcn/ui create` as visual source of truth.

Key rules to preserve:

- prefer existing primitives in `components/ui`
- keep the canvas as the hero surface
- avoid decorative styling that competes with workspace readability
- preserve consistency between board, table, and details views
- prefer token-driven styling from `app/globals.css`

When editing UI:

- inspect `components/ui` first
- reuse preset patterns before inventing new ones
- keep supporting chrome quiet so the site graph remains the focal point

## Source Of Truth By Area

When working in this repo, assume:

- product direction and target architecture:
  - `README.md`
  - `docs/prd-go-microservices-architecture.md`
- current active UX:
  - root `app/`, `features/`, `services/`, `types/`
- target backend runtime:
  - `backend/`
- legacy reference:
  - `src/audit_platform/`

If documents and code disagree, trust the code first and then update the docs.

## Practical Constraints

Current known constraints:

- the repo is not currently operating as a single production-ready deployed system
- frontend persistence is local browser storage
- Next.js analysis jobs use temp-file storage
- Go backend exists in parallel and is the intended migration target
- Python code is legacy reference, not active direction

This means new work should usually be explicit about which track it belongs to:

- improve current Next.js MVP behavior
- move capability toward Go backend
- preserve or ignore Python legacy code

## Recommended Working Rules For Future Sessions

When continuing work on COre:

1. First decide whether the task belongs to:
   - current UI/MVP flow
   - Go rewrite
   - documentation/product architecture
2. Avoid duplicating backend logic across Next.js and Go unless the task is intentionally transitional.
3. Prefer the snapshot/page/finding model for new analysis features.
4. Treat `keywords`, `technical`, and `ai-recommendations` as planned modules, not yet completed features.
5. Update this file whenever a major requirement, architecture decision, or ownership boundary changes.

## Immediate Development Priorities

Based on the repository state, the most sensible near-term priorities are:

- keep the current Next.js workspace usable for product iteration
- progressively move crawl execution and durable job handling toward Go
- keep domain contracts aligned between frontend and Go backend
- extend page-level findings in a modular way
- preserve snapshot semantics for future recrawls and comparisons

## How To Maintain This File

Update this file when any of the following changes:

- project purpose or product framing
- active runtime path
- user flow
- domain model
- source-of-truth architecture
- migration status between Next.js and Go
- implementation status of major modules

Keep the file practical.

It is not meant to be marketing copy.
It is meant to help the next agent understand the real state of the project in a few minutes.
