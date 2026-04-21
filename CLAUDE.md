# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Michelin Guide-inspired app (restaurants and more) — **mobile-first** design.

Frontend lives in `michelin-front/`. No backend yet.

## Commands

All commands run from `michelin-front/`:

```bash
npm run dev      # start dev server
npm run build    # tsc + vite build
npm run lint     # eslint
npm run preview  # preview production build
```

Add shadcn components:
```bash
npx shadcn add <component>
```

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — config is CSS-only in `src/index.css`, no `tailwind.config.js`
- **shadcn/ui** (`style: base-luma`, `baseColor: taupe`) — components land in `src/components/ui/`
- **react-router v7** for routing
- **lucide-react** for icons

## Theme & Design

Theme is Michelin Guide-inspired: deep red primary (`#cb0028`), warm taupe neutrals, light/dark mode.

CSS variables are defined in `src/index.css` under `:root` and `.dark`. Dark mode is toggled via the `dark` class on `<html>` (managed by `useTheme` hook, persisted in `localStorage`).

Fonts: **Figtree** (body/UI, `--font-sans`) and **Geist** available — both variable fonts from `@fontsource-variable`.

## Path Aliases

`@/` maps to `src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

## Mobile-First

Always write Tailwind classes mobile-first (base styles for mobile, `sm:`/`md:`/`lg:` for larger breakpoints).
