# План реализации — Quiz Builder

Тестовое задание: *Full-Stack JS Engineer Test Assessment — The Quiz Builder*.
Приложение для создания кастомных квизов с тремя типами вопросов, списком всех квизов и страницей просмотра.

---

## 1. Стек и решения

| Слой | Технология | Обоснование |
|---|---|---|
| Backend | NestJS 11 + TypeScript | Требование заказчика; модульность, DI, готовые пайпы валидации |
| БД | PostgreSQL 16 (Docker) | Требование заказчика |
| ORM | Prisma 6 | Требование заказчика; типобезопасность + миграции + seed из коробки |
| Frontend | Next.js 15 (App Router) + React 19 | Требование задания |
| Формы | React Hook Form + Zod (`@hookform/resolvers`) | Динамические поля через `useFieldArray`, единая схема валидации |
| Стили | CSS Modules | Требование заказчика (не Tailwind) |
| Качество | ESLint 9 (flat config) + Prettier 3 | Требование задания |

**Ключевое решение:** Zod-схемы описываются один раз в `backend/src/quizzes/schemas/` и физически копируются (или подключаются через relative-import) во frontend. На тестовом задании без монорепо-тулинга выбираем простой путь — дублирование схем в `frontend/src/lib/validation/` с идентичной структурой. Это осознанный trade-off ради отсутствия сложной сборки; в README указывается явно.

---

## 2. Структура репозитория

```
QARoast-test/
├── backend/
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
│   ├── .prettierrc
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 → редирект на /quizzes
│   │   │   ├── globals.css
│   │   │   ├── create/page.tsx          → создание квиза
│   │   │   └── quizzes/
│   │   │       ├── page.tsx             → список квизов
│   │   │       └── [id]/page.tsx        → детали
│   │   ├── components/
│   │   │   ├── quiz-form/
│   │   │   ├── quiz-list/
│   │   │   └── ui/                      → Button, Input, Card, Field
│   │   ├── services/
│   │   │   ├── http.ts                  → обёртка fetch
│   │   │   └── quizzes.ts               → четыре вызова API
│   │   ├── lib/
│   │   │   └── validation/quiz.schema.ts
│   │   └── styles/
│   │       ├── tokens.css               → CSS-переменные, breakpoints
│   │       └── reset.css
│   ├── .env.local.example
│   ├── eslint.config.mjs
│   ├── .prettierrc
│   └── package.json
├── docker-compose.yml                   → только PostgreSQL
├── CLAUDE.md
├── PLAN.md
└── README.md
```

---

## 3. Модель данных

Три типа вопросов имеют разную форму ответа. Выбрана **нормализованная схема** (не JSON-колонка) — читается лучше при код-ревью и даёт валидацию на уровне БД.

```prisma
enum QuestionType {
  BOOLEAN    // True/False radio
  INPUT      // короткий текстовый ответ
  CHECKBOX   // множественный выбор, несколько правильных
}

model Quiz {
  id        String     @id @default(uuid())
  title     String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  questions Question[]
}

model Question {
  id       String       @id @default(uuid())
  quizId   String
  quiz     Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  type     QuestionType
  text     String
  order    Int
  // BOOLEAN: правильный ответ true/false
  correctBoolean Boolean?
  // INPUT: эталонный текстовый ответ
  correctText    String?
  // CHECKBOX: варианты в таблице Option
  options  Option[]

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

`onDelete: Cascade` закрывает требование `DELETE /quizzes/:id` — вопросы и опции удаляются вместе с квизом одним запросом.

---

## 4. API-контракт

Пути — ровно как в задании, **без префикса `/api`**. База: `http://localhost:4000`.

| Метод | Путь | Тело / Ответ |
|---|---|---|
| `POST` | `/quizzes` | `CreateQuizDto` → `201 { id }` |
| `GET` | `/quizzes` | → `200 [{ id, title, questionCount, createdAt }]` |
| `GET` | `/quizzes/:id` | → `200 QuizDetail` \| `404` |
| `DELETE` | `/quizzes/:id` | → `204` \| `404` |

**`CreateQuizDto` (Zod, discriminated union по `type`):**

```ts
const questionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('BOOLEAN'),  text: z.string().min(1).max(500), correctBoolean: z.boolean() }),
  z.object({ type: z.literal('INPUT'),    text: z.string().min(1).max(500), correctText: z.string().min(1).max(500) }),
  z.object({
    type: z.literal('CHECKBOX'),
    text: z.string().min(1).max(500),
    options: z.array(z.object({ text: z.string().min(1), isCorrect: z.boolean() }))
      .min(2).max(10)
      .refine(o => o.some(x => x.isCorrect), 'Хотя бы один вариант должен быть верным'),
  }),
]);

const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  questions: z.array(questionSchema).min(1).max(50),
});
```

`GET /quizzes` считает вопросы через `_count`, а не грузит их целиком:

```ts
prisma.quiz.findMany({
  select: { id: true, title: true, createdAt: true, _count: { select: { questions: true } } },
  orderBy: { createdAt: 'desc' },
});
```

Создание квиза — одна вложенная транзакция Prisma (`create` с `questions: { create: [...] }`), без ручного `$transaction`.

---

## 5. Адаптив и вёрстка

Требование: резиновая вёрстка + два брейкпоинта.

**Подход mobile-first.** Единственный брейкпоинт — `768px`:

```css
/* tokens.css */
:root {
  --bp-desktop: 768px;
  --container-max: 1100px;
  --space-md: clamp(0.75rem, 2vw, 1.25rem);
  --font-h1: clamp(1.5rem, 1rem + 2.5vw, 2.25rem);
}
```

- **Резиновость** — `clamp()` для типографики и отступов, `max-width` + `margin-inline: auto` для контейнера, `minmax()` в grid. Никаких фиксированных ширин в px.
- **Мобильный (< 768px)** — одна колонка, карточки квизов на всю ширину, тач-таргеты ≥ 44px, кнопки формы `width: 100%`, вопросы в форме — вертикальный стек.
- **Десктоп (≥ 768px)** — список квизов `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, форма в две колонки (текст вопроса + настройки ответа), кнопки по контенту.
- Проверка на 375px и 1440px перед сдачей.

---

## 6. Seed

`backend/prisma/seed.ts` — идемпотентный (сначала `deleteMany`, затем создание), заполняет **два** квиза, покрывающих все три типа вопросов:

1. **«JavaScript Fundamentals»** — 5 вопросов: 2 × BOOLEAN, 1 × INPUT, 2 × CHECKBOX.
2. **«Web Basics»** — 3 вопроса: по одному каждого типа.

Запуск: `npm run db:seed` (прописан в `prisma.seed` в `package.json`).

---

## 7. Порядок работ

### Этап 1 — Инфраструктура
1. `docker-compose.yml` с PostgreSQL 16, healthcheck, volume.
2. `.gitignore` в корне: `node_modules`, `.env`, `.next`, `dist`.
3. Корневой `README.md` с инструкцией запуска.

### Этап 2 — Backend
4. `nest new backend`, чистка шаблона (убрать `app.controller/service`).
5. Prisma: `schema.prisma`, первая миграция, `PrismaService` с `onModuleInit`.
6. `ZodValidationPipe` + Zod-схемы + выведенные типы DTO.
7. `QuizzesService` — четыре метода, `NotFoundException` на отсутствующий id.
8. `QuizzesController` — четыре роута, `@HttpCode(204)` на delete.
9. Глобально: CORS для `localhost:3000`, `ConfigModule`. Глобальный префикс **не ставим** — пути должны совпадать с заданием буквально.
10. `seed.ts` + прогон.
11. ESLint + Prettier, `npm run lint` без ошибок.

### Этап 3 — Frontend
12. `create-next-app` (TS, App Router, без Tailwind), чистка шаблона.
13. `tokens.css`, `reset.css`, подключение в `layout.tsx`.
14. Примитивы UI: `Button`, `TextInput`, `Field`, `Card` — каждый со своим `.module.css`.
15. `services/http.ts` + `services/quizzes.ts` — обёртка `fetch` с базовым URL из `NEXT_PUBLIC_API_URL` и обработкой ошибок.
16. Страница `/quizzes` — Server Component, `cache: 'no-store'`, empty-state. Каждая карточка: заголовок + число вопросов, ссылка на детали, **иконка удаления** (inline SVG «корзина», `aria-label`) — Client Component, по клику `DELETE /quizzes/:id` и `router.refresh()`, чтобы элемент исчез со страницы.
17. Страница `/create` — RHF + `zodResolver`, `useFieldArray` для вопросов (add/remove), вложенный `useFieldArray` для опций CHECKBOX, переключение типа вопроса перерисовывает блок ответа. После успешного `POST /quizzes` — редирект на `/quizzes/:id`.
18. Страница `/quizzes/[id]` — Server Component, read-only рендер (не для прохождения — только структура), `notFound()` на 404.
19. Состояния: loading, error, пустой список.
20. ESLint + Prettier.

### Этап 4 — Отделка
21. Проверка адаптива на 375 / 768 / 1440.
22. `.env.example` в обоих пакетах, `.env` — в `.gitignore`.
23. Корневой `README.md` — три обязательных по заданию раздела:
    - **Set up database** — `docker compose up -d`, `.env`, `prisma migrate dev`
    - **Start backend and frontend** — команды и порты
    - **Create sample quiz** — `npm run db:seed` и/или ручной сценарий через `/create`
24. Финальный прогон `lint` + `build` в обоих пакетах.

---

## 8. Критерии готовности

Прямое соответствие пунктам задания:

- [ ] `docker compose up -d` поднимает PostgreSQL
- [ ] Все 4 эндпоинта отвечают по путям `/quizzes*` без префикса, включая 404 и 204
- [ ] Валидация отклоняет пустой title, квиз без вопросов, CHECKBOX без верных опций
- [ ] Seed создаёт два квиза со всеми тремя типами вопросов
- [ ] `/create` — форма с title и динамическим add/remove вопросов, все 3 типа, submit на `POST /quizzes`
- [ ] `/quizzes` — title + число вопросов, ссылка на детали, иконка удаления убирает квиз из БД и со страницы
- [ ] `/quizzes/:id` — title и вопросы в read-only виде
- [ ] Вёрстка не ломается на 375px и 1440px, нет горизонтального скролла
- [ ] `npm run lint` и `npm run build` проходят в `/backend` и `/frontend`
- [ ] `.env` не в репозитории, `.env.example` — в репозитории
- [ ] README покрывает: запуск frontend/backend, настройку БД, создание sample quiz
- [ ] В корне репозитория ровно две директории пакетов: `/frontend` и `/backend`

---

## 9. Осознанные упрощения

Фиксируются в README, чтобы не выглядели как недоработки:

- **Нет авторизации** — задание её не требует.
- **Нет прохождения квиза** — правильные ответы хранятся, но UI прохождения не входит в scope.
- **Zod-схемы продублированы** между пакетами вместо общего workspace-пакета — упрощает сборку на объёме тестового.
- **Тесты** — не требуются заданием; при наличии времени добавляются e2e на `QuizzesController` через `supertest`.
