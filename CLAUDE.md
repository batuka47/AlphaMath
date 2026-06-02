# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview the production build locally
```

No test runner is configured. Playwright is listed as a dev dependency but has no script entry.

## Architecture

**AlphaMath** is a Mongolian math exam practice SPA — a React 19 + Vite app that lets students practice past ЭЕШ (Элсэлтийн Ерөнхий Шалгалт, national university entrance exam) math papers from 2006–2024.

### Tech stack

- **React 19** with React Router v7, **Tailwind CSS v4** (Vite plugin, no config file needed)
- **Supabase** — auth (email/OAuth) + two database tables: `test_results` and `bookmarks`
- **KaTeX** + **html-react-parser** for math rendering (dual-path, see below)
- Deployed on both Vercel (`vercel.json`) and Firebase Hosting (`firebase.json`)

### Data layer (`src/datas/`)

All question data is static JS. Each year/variant is its own file: `src/datas/years/task{YEAR}{VARIANT}.js` (e.g. `task2014A.js`). The shape is:

```js
{
  id: "8",           // 0-indexed offset from 2006 (yearIndex = year - 2006)
  variant: "A",
  scoring: { section1: [{from, to, points}], section2Points: 5 },
  problem: [{ id, text, labelA, labelB, labelC, labelD, labelE, answer, img? }],
  secondProblem?: [{ id, text, problem, a?, b?, c?, ... }]  // open-ended section
}
```

`src/datas/Task.jsx` is the master index — it imports every year file and exports a function that filters out stubs (< 5 questions). `src/datas/Taskbefore.jsx` is an older snapshot kept for reference.

### Routing and page flow

```
/EYSH                       → year/variant picker (EYSH.jsx)
/EYSH/:year                 → EYSHTest.jsx  (e.g. /EYSH/2014-A)
/EYSH/:year/Result          → Result.jsx    (receives state via React Router location.state)
```

`year` param is always `{YYYY}-{VARIANT}`. `yearIndex = parseInt(yearPart) - 2006` maps to `task.id`.

### Scoring system

- **2014+ format** (≥ 36 questions): Q1–8 = 1 pt, Q9–28 = 2 pt, Q29–36 = 3 pt (total 72)
- **Pre-2014 format**: flat 3 pt per question
- `secondProblem` questions each earn 5 pt
- Scoring logic lives in both `EYSHTest.jsx` and `Result.jsx` (duplicated helpers)

### Math rendering (`src/components/Test.jsx`)

`safeParse()` picks a rendering path based on content:
- String contains `$...$` → **KaTeX** (LaTeX delimiters from newer parsed files)
- String contains `<` → **html-react-parser** with MathML custom replacer (older files)
- Plain text → rendered as-is

`injectMathCSS()` is called once on mount to force MathML elements to `display: inline`.

### Auth and user features

`src/lib/AuthContext.jsx` wraps Supabase auth in a React context. `useAuth()` returns `{ user, loading }`. Protected pages (`/history`, `/bookmarks`) redirect to `/auth` when `user` is null.

Supabase tables:
- `test_results` — written once when navigating to `/Result` if the user is logged in
- `bookmarks` — read/written during a test; `question_id`, `year`, `variant`, `user_id`

Test session is auto-saved to `localStorage` under key `alphamath_test_{year}` so users can resume.

### Brand colors

- Orange: `#E75234` (primary action / accent)
- Blue: `#2760A6` (section headings)
- Peach: `#F5DAC6` (hero backgrounds, subtle fills)

### `scripts/` directory

One-time data extraction utilities (Python + Node.js) used to parse PDF exam papers into JS objects. Not part of the app build — not imported anywhere.
