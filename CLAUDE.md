# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Quiz Builder** — a full-stack application for creating custom quizzes. Implementation of the
*Full-Stack JS Engineer Test Assessment* task. Users create quizzes with three question types,
browse a list of all quizzes, and open a read-only detail view.

Implementation plan and scope decisions live in [PLAN.md](PLAN.md).

## Layout

Two independent packages, no monorepo tooling — each has its own `package.json`, `node_modules`,
ESLint config and lifecycle. There is no root `package.json`.

```
backend/     NestJS + Prisma + PostgreSQL   → http://localhost:4000
frontend/    Next.js App Router             → http://localhost:3000
docker-compose.yml   PostgreSQL 16 only
```

Always run npm commands from inside `backend/` or `frontend/`, never from the repo root.

## Stack

- **TypeScript everywhere.** No `.js` source files, no `any` outside of narrowly-scoped casts.
- **Backend:** NestJS 11, Prisma 6, PostgreSQL 16.
- **Frontend:** Next.js 15 (App Router), React 19, React Hook Form + Zod.
- **Styling:** CSS Modules only. Tailwind, styled-components and global class soup are out.
- **Tooling:** ESLint 9 flat config + Prettier 3, configured separately per package.

## Commands

```bash
# database
docker compose up -d                # start PostgreSQL
docker compose down -v              # stop and wipe data

# backend/
npm run start:dev                   # watch mode on :4000
npm run build
npm run lint
npx prisma migrate dev --name <n>   # create + apply a migration
npx prisma generate                 # regenerate client after schema edits
npm run db:seed                     # reset and seed demo quizzes
npx prisma studio                   # inspect data

# frontend/
npm run dev                         # :3000
npm run build
npm run lint
```

First-time setup: `docker compose up -d` → `cd backend && npx prisma migrate dev && npm run db:seed`
→ `npm run start:dev` → in another shell `cd frontend && npm run dev`.

## Data model

`Quiz` → `Question` → `Option`, all cascading on delete. Question shape depends on `type`:

| `QuestionType` | Answer stored in |
|---|---|
| `BOOLEAN` | `correctBoolean` |
| `INPUT` | `correctText` |
| `CHECKBOX` | `Option[]` rows with `isCorrect` |

Only one of these fields is populated per question — the others stay `null`/empty. When adding a
question type, update the Prisma enum, the Zod discriminated union, the form's answer editor, and
the detail-page renderer together; missing one produces a silently broken type.

Question and option ordering is explicit via the `order` column. Always sort by it when reading —
never rely on insertion order from the database.

## API

Four endpoints, mounted at the root — **no global prefix**, because the assessment specifies these
exact paths. Do not add `/api`.

| Method | Path | Returns |
|---|---|---|
| POST | `/quizzes` | `201 { id }` |
| GET | `/quizzes` | `200 [{ id, title, questionCount, createdAt }]` |
| GET | `/quizzes/:id` | `200 QuizDetail` or `404` |
| DELETE | `/quizzes/:id` | `204` or `404` |

`GET /quizzes` must use Prisma `_count` for `questionCount` — do not load full question rows just
to count them. Quiz creation happens in a single nested `create` call so a partial quiz can never
be persisted.

## Validation

Zod is the single source of truth for request shape, on both sides.

- Backend: schemas in `backend/src/quizzes/schemas/`, applied through the custom
  `ZodValidationPipe`. DTO types are derived with `z.infer` — never hand-written.
- Frontend: mirrored schemas in `frontend/src/lib/validation/`, fed to RHF via `zodResolver`.

These two copies are deliberately duplicated rather than extracted into a shared package. **When
you change one, change the other in the same edit.** Do not introduce a workspace package to
deduplicate them without being asked.

## Frontend conventions

Three routes, fixed by the assessment — keep these paths exactly:

| Route | Purpose |
|---|---|
| `/create` | quiz creation form (**not** `/quizzes/create`) |
| `/quizzes` | list with title, question count, detail link, delete icon |
| `/quizzes/[id]` | read-only detail view |

- Server Components fetch data by default. Add `'use client'` only for interactivity —
  the creation form, the delete icon.
- Data fetching goes through `src/services/`, never a raw `fetch` in a page.
- Dynamic question lists use RHF `useFieldArray`; CHECKBOX options use a nested `useFieldArray`
  keyed by the question's field id.
- Each component owns a sibling `*.module.css`. No shared global stylesheet beyond
  `styles/reset.css` and `styles/tokens.css`.

## Styling rules

Mobile-first, fluid, with a single breakpoint at `768px`.

- Layout sizing comes from `clamp()`, `%`, `minmax()` and `max-width` — avoid fixed `px` widths.
- Design tokens (spacing, type scale, colors, breakpoint) live in `styles/tokens.css` as CSS
  custom properties. Add new tokens there rather than hardcoding values in modules.
- Verify at 375px and 1440px. The page must never scroll horizontally.
- Touch targets stay at 44px minimum on mobile.

## Environment

Never commit `.env`. Each package ships a committed `.env.example`.

```
backend/.env         DATABASE_URL, PORT, CORS_ORIGIN
frontend/.env.local  NEXT_PUBLIC_API_URL
```

## Working notes

- Run `npm run lint` in the touched package before considering a change done.
- After editing `schema.prisma`, always create a migration — do not use `prisma db push`.
- Keep `prisma/seed.ts` covering all three question types; it is the fastest way to check the UI.
- The root `README.md` is a graded deliverable. It must always explain how to set up the database,
  start backend and frontend, and create a sample quiz. Update it whenever those steps change.
- Out of scope by design: authentication, quiz-taking flow, scoring, pagination. Do not add them
  speculatively.
