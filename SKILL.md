---
name: minimalist-bw-ui-designer
description: Use this skill when redesigning or creating UI for this repository. It enforces the project's shadcn create preset (`bIkfFpI`) design system, exact primitive sizing, grayscale token usage, and canvas-oriented product language.
---

# Minimalist B/W UI Designer

Use this skill for any UI work in this repository.

## Goal

Create interfaces that feel like the `shadcn/ui create` preview:

- monochrome
- compact
- highly readable
- primitive-first
- calm around dense information

## Workflow

1. Start from the reference:
   - `https://ui.shadcn.com/create?preset=bIkfFpI&item=preview&pointer=true&template=next-monorepo&rtl=true`
2. Inspect existing `components/ui` primitives before styling feature code.
3. Reuse shared tokens from `app/globals.css`.
4. Compose UI from stock primitives before writing custom shells.
5. Before inventing a pattern, check shadcn MCP examples or registry items.

## Visual System

### Palette

- Use the OKLCH tokens in `app/globals.css`
- Backgrounds: `background`, `card`, `muted`
- Text: `foreground`, `muted-foreground`
- Borders: `border`, `input`
- Avoid raw hex colors in feature components

### Typography

- Headings: `Geist`
- UI text and body: `Geist`
- Code and dense machine values: `Geist Mono`
- Prefer `text-sm` / `text-base` and `font-medium` over heavy type styling

### Shapes

- Inputs and buttons: `rounded-md`
- Panels and cards: `rounded-xl`
- Avoid oversized custom radii

### Density

- Controls should generally be `h-9`
- Compact controls can use `h-8`
- Cards should use stock `Card` spacing before custom padding
- Prefer one clear CTA per area

## Product Guidance

- The canvas is the hero, so supporting UI must stay quiet.
- Filters and details should feel like studio tools.
- Page nodes should surface SEO state without looking like alerts everywhere.
- Progress UIs should look operational, not playful.

## Do Not

- Do not use gradients for primary actions.
- Do not rely on raw hex colors, oversized radii, or custom drop shadows.
- Do not over-segment layouts with too many nested boxes.
- Do not mix preset primitives with a second custom design language.
