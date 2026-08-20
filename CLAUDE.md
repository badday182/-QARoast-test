# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Quiz Builder** — a full-stack application for creating custom quizzes. Implementation of the
*Full-Stack JS Engineer Test Assessment* task. Users create quizzes with three question types,
browse a list of all quizzes, and open a read-only detail view.

The step-by-step build order and its checklist live in [PLAN.md](PLAN.md). This file describes
*what the project is*; PLAN.md describes *what is left to do*.

## Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | NestJS 11 + TypeScript | Modules, DI, ready-made validation pipes |
| Database | PostgreSQL 16 (Docker) | Required |
| ORM | Prisma 6 | Type safety, migrations, built-in seed hook |
| Frontend | Next.js 15 (App Router) + React 19 | Required |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) | `useFieldArray` for dynamic questions, one schema for validation |
| Styling | CSS Modules | Required — no Tailwind, no styled-components |
| Tooling | ESLint 9 (flat config) + Prettier 3 | Required |

TypeScript everywhere: no `.js` source files, no `any` outside narrowly-scoped casts.

## Layout

Two independent packages, no monorepo tooling — each has its own `package.json`, `node_modules`,
ESLint config and lifecycle. There is no root `package.json`. Always run npm commands from inside
`backend/` or `frontend/`, never from the repo root.

```text
QARoast-test/
├── backend/                          → http://localhost:4000
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── common/
│   │   │   ├── pipes/zod-validation.pipe.ts
│   │   │   └── filters/prisma-exception.filter.ts
│   │   └── quizzes/
│   │       ├── quizzes.module.ts
│   │       ├── quizzes.controller.ts
│   │       ├── quizzes.service.ts
│   │       ├── schemas/quiz.schema.ts
│   │       └── dto/quiz.dto.ts
│   ├── .env.example
│   ├── eslint.config.mjs
│   └── .prettierrc
├── frontend/                         → http://localhost:3000
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              → redirect to /quizzes
│   │   │   ├── globals.css
│   │   │   ├── create/page.tsx       → quiz creation
│   │   │   └── quizzes/
│   │   │       ├── page.tsx          → quiz list
│   │   │       └── [id]/page.tsx     → quiz detail
│   │   ├── components/
│   │   │   ├── quiz-form/
│   │   │   ├── quiz-list/
│   │   │   └── ui/                   → Button, TextInput, Field, Card
│   │   ├── services/
│   │   │   ├── http.ts               → fetch wrapper
│   │   │   └── quizzes.ts            → the four API calls
│   │   ├── lib/validation/quiz.schema.ts
│   │   └── styles/
│   │       ├── tokens.css
│   │       └── reset.css
│   ├── .env.local.example
│   ├── eslint.config.mjs
│   └── .prettierrc
├── docker-compose.yml                → PostgreSQL 16 only
├── CLAUDE.md
├── PLAN.md
└── README.md
```

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

`Quiz` → `Question` → `Option`, all cascading on delete. The three question types have different
answer shapes; the schema is **normalized** rather than a JSON column — it reads better in review
and lets the database enforce structure.

```prisma
enum QuestionType {
  BOOLEAN    // True/False radio
  INPUT      // short text answer
  CHECKBOX   // multiple choice, several correct
}

model Quiz {
  id        String     @id @default(uuid())
  title     String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  questions Question[]
}

model Question {
  id             String       @id @default(uuid())
  quizId         String
  quiz           Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  type           QuestionType
  text           String
  order          Int
  correctBoolean Boolean?     // BOOLEAN only
  correctText    String?      // INPUT only
  options        Option[]     // CHECKBOX only

  @@index([quizId])
}

model Option {
  id         String   @id @default(uuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text       String
  isCorrect  Boolean  @default(false)
  order      Int

  @@index([questionId])
}
```

Rules that follow from this:

- Exactly one answer field is populated per question; the others stay `null`/empty.
- `onDelete: Cascade` is what makes `DELETE /quizzes/:id` a single statement — don't delete
  children manually.
- Ordering is explicit via `order`. Always sort by it when reading; never rely on insertion order.
- Adding a question type means touching the Prisma enum, the Zod discriminated union, the form's
  answer editor and the detail-page renderer **together** — missing one produces a silently
  broken type.

## API

Four endpoints, mounted at the root — **no global prefix**, because the assessment specifies these
exact paths. Do not add `/api`.

| Method | Path | Returns |
|---|---|---|
| POST | `/quizzes` | `201 { id }` |
| GET | `/quizzes` | `200 [{ id, title, questionCount, createdAt }]` |
| GET | `/quizzes/:id` | `200 QuizDetail` or `404` |
| DELETE | `/quizzes/:id` | `204` or `404` |

`GET /quizzes` counts through Prisma `_count` — never load full question rows just to count them:

```ts
prisma.quiz.findMany({
  select: { id: true, title: true, createdAt: true, _count: { select: { questions: true } } },
  orderBy: { createdAt: 'desc' },
});
```

Quiz creation is a single nested `create` (`questions: { create: [...] }`) so a partial quiz can
never be persisted — no manual `$transaction` needed.

## Validation

Zod is the single source of truth for request shape, on both sides.

- Backend: schemas in `backend/src/quizzes/schemas/`, applied through the custom
  `ZodValidationPipe`. DTO types are derived with `z.infer` — never hand-written.
- Frontend: mirrored schemas in `frontend/src/lib/validation/`, fed to RHF via `zodResolver`.

```ts
const questionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('BOOLEAN'), text: z.string().min(1).max(500), correctBoolean: z.boolean() }),
  z.object({ type: z.literal('INPUT'),   text: z.string().min(1).max(500), correctText: z.string().min(1).max(500) }),
  z.object({
    type: z.literal('CHECKBOX'),
    text: z.string().min(1).max(500),
    options: z.array(z.object({ text: z.string().min(1), isCorrect: z.boolean() }))
      .min(2).max(10)
      .refine((o) => o.some((x) => x.isCorrect), 'At least one option must be correct'),
  }),
]);

const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  questions: z.array(questionSchema).min(1).max(50),
});
```

The two copies are deliberately duplicated rather than extracted into a shared package — a
workspace package is not worth the build complexity at this size. **When you change one, change
the other in the same edit.** Do not introduce a shared package without being asked.

## Frontend conventions

Three routes, fixed by the assessment — keep these paths exactly:

| Route | Purpose |
|---|---|
| `/create` | quiz creation form (**not** `/quizzes/create`) |
| `/quizzes` | list with title, question count, detail link, delete icon |
| `/quizzes/[id]` | read-only detail view (structure only, not for solving) |

- Server Components fetch data by default. Add `'use client'` only for interactivity —
  the creation form, the delete icon.
- Data fetching goes through `src/services/`, never a raw `fetch` in a page.
- Dynamic question lists use RHF `useFieldArray`; CHECKBOX options use a nested `useFieldArray`
  keyed by the question's field id.
- Deleting from the list calls `DELETE /quizzes/:id` then `router.refresh()`, so the card
  disappears without a full page reload.
- Each component owns a sibling `*.module.css`. No shared global stylesheet beyond
  `styles/reset.css` and `styles/tokens.css`.

## Styling rules

Mobile-first and fluid, with a **single breakpoint at 768px**.

```css
/* styles/tokens.css */
:root {
  --bp-desktop: 768px;
  --container-max: 1100px;
  --space-md: clamp(0.75rem, 2vw, 1.25rem);
  --font-h1: clamp(1.5rem, 1rem + 2.5vw, 2.25rem);
}
```

- Sizing comes from `clamp()`, `%`, `minmax()` and `max-width` — avoid fixed `px` widths.
- Tokens (spacing, type scale, colors, breakpoint) live in `styles/tokens.css`. Add new tokens
  there rather than hardcoding values inside modules.
- Mobile (< 768px): single column, full-width cards, form buttons `width: 100%`, touch targets
  ≥ 44px.
- Desktop (≥ 768px): list as `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`,
  form in two columns (question text + answer settings), buttons sized to content.
- Verify at 375px and 1440px. The page must never scroll horizontally.

## Seed data

`backend/prisma/seed.ts` is idempotent (`deleteMany` first, then create) and must keep covering all
three question types — it is the fastest way to check the UI:

1. **JavaScript Fundamentals** — 5 questions: 2 × BOOLEAN, 1 × INPUT, 2 × CHECKBOX.
2. **Web Basics** — 3 questions: one of each type.

Wired through the `prisma.seed` key in `backend/package.json`, run via `npm run db:seed`.

## Environment

Never commit `.env`. Each package ships a committed `.env.example`.

```text
backend/.env         DATABASE_URL, PORT, CORS_ORIGIN
frontend/.env.local  NEXT_PUBLIC_API_URL
```

## Scope boundaries

Deliberately out of scope — documented in the README so they don't read as omissions. Do not add
them speculatively:

- **No authentication** — not part of the assessment.
- **No quiz-taking flow or scoring** — correct answers are stored, but the detail page is
  read-only by requirement.
- **No pagination** on the quiz list.
- **No tests required.** If time allows, add e2e coverage of `QuizzesController` via `supertest`.

## Working notes

- Run `npm run lint` in the touched package before considering a change done.
- After editing `schema.prisma`, always create a migration — do not use `prisma db push`.
- The root `README.md` is a graded deliverable. It must always explain how to set up the database,
  start backend and frontend, and create a sample quiz. Update it whenever those steps change.
