# Quiz Builder

Full-stack застосунок для створення квізів з трьома типами запитань: `Boolean`, `Input`, `Checkbox`.
Реалізація тестового завдання _Full-Stack JS Engineer Test Assessment — the Quiz Builder_.

| Пакет       | Стек                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `backend/`  | NestJS 11, TypeScript, Prisma 6, PostgreSQL 16 — `http://localhost:4000`                        |
| `frontend/` | Next.js 15 (App Router), React 19, React Hook Form + Zod, CSS Modules — `http://localhost:3000` |

Пакети незалежні: у кожного свій `package.json`, `node_modules` та конфіги. Кореневого
`package.json` немає — npm-команди запускаються **зсередини** `backend/` або `frontend/`.

Опис архітектури — в [CLAUDE.md](CLAUDE.md), покроковий план робіт — в [PLAN.md](PLAN.md).

---

## Вимоги

- Node.js 20+
- Docker (для PostgreSQL)

## Швидкий старт

```bash
docker compose up -d                       # 1. PostgreSQL 16 на :5432

cd backend
cp .env.example .env                       # 2. змінні оточення
npm install
npx prisma migrate dev                     # 3. схема БД
npm run db:seed                            # 4. два демо-квізи
npm run start:dev                          # 5. API на :4000

cd ../frontend                             # в окремому терміналі
cp .env.local.example .env.local
npm install
npm run dev                                # 6. UI на :3000
```

Відкрити <http://localhost:3000> — спрацює редирект на `/quizzes`.

## Налаштування бази даних

```bash
docker compose up -d
```

Піднімає PostgreSQL 16 на `localhost:5432` (користувач `quiz`, пароль `quiz`, база
`quiz_builder`). Дані зберігаються у томі `quiz-builder-pgdata`

```bash
docker compose ps       # STATUS повинен бути "Up (healthy)"
docker compose down     # зупинити, дані зберегти
docker compose down -v  # зупинити та видалити дані
```

Схема застосовується міграціями Prisma з `backend/`:

```bash
cd backend
npx prisma migrate dev        # створити/застосувати міграції
npx prisma studio             # переглянути дані у браузері
```

## Запуск backend

```bash
cd backend
cp .env.example .env    # DATABASE_URL, PORT, CORS_ORIGIN
npm install
npm run start:dev       # watch-режим на http://localhost:4000
```

Порт и разрешённый CORS-origin читаются из `.env` через `ConfigModule`. Глобального префикса
нет — маршруты начинаются прямо с `/quizzes`.

| Метод    | Путь           | Ответ                                           |
| -------- | -------------- | ----------------------------------------------- |
| `POST`   | `/quizzes`     | `201 { id }`, `400` при ошибке валидации        |
| `GET`    | `/quizzes`     | `200 [{ id, title, questionCount, createdAt }]` |
| `GET`    | `/quizzes/:id` | `200 QuizDetail` или `404`                      |
| `DELETE` | `/quizzes/:id` | `204` или `404`                                 |

Прочие скрипты: `npm run build`, `npm run start:prod`, `npm run lint`, `npm run db:seed`.

## Запуск frontend

```bash
cd frontend
cp .env.local.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                         # http://localhost:3000
```

Бекенд повинен бути запущений — інакше сторінки покажуть помилку завантаження, а форма створення повідомить,
що API недоступен.

| Маршрут        | Що робить                                                                    |
| -------------- | ---------------------------------------------------------------------------- |
| `/`            | редирект на `/quizzes`                                                       |
| `/quizzes`     | список: заголовок, кількість запитань, посилання на деталі, іконка видалення |
| `/create`      | форма створення квізу                                                        |
| `/quizzes/:id` | read-only перегляд запитань та правильних відповідей                         |

Інші скрипти: `npm run build`, `npm run start`, `npm run lint`, `npm run format:check`.

## Створення прикладу квізу

**Через seed-скрипт** — найшвидше, створює два квізи зі всіма трьома типами запитань
(_JavaScript Fundamentals_ — 5 запитань, _Web Basics_ — 3):

```bash
cd backend
npm run db:seed
```

Скрипт ідемпотентний: спочатку чистить таблиці, потім створює заново.

**Через інтерфейс:**

1. Відкрити <http://localhost:3000/quizzes> та натиснути **New quiz** (або перейти на `/create`).
2. Заповнити **Quiz title**.
3. Для першого запитання ввести текст та вибрати **Answer type**:
   - `True / False` — позначити правильний варіант радіокнопкою;
   - `Short answer` — вписати еталонну відповідь;
   - `Multiple choice` — заповнити варіанти та позначити галочками всі вірні (мінімум два
     варіанти, принаймні один вірний). Кнопка **Add option** додає ще.
4. **Add question** — додати наступне запитання, хрестик у куті карточки — видалити.
5. **Create quiz** — після збереження відкриється сторінка створеного квізу.

Видалити квіз можна іконкою кошика на карточці в списку — карточка зникає без перезавантаження
сторінки.

**Через API:**

```bash
curl -X POST http://localhost:4000/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Quiz",
    "questions": [
      { "type": "BOOLEAN", "text": "TypeScript compiles to JavaScript?", "correctBoolean": true },
      { "type": "INPUT", "text": "Which keyword declares a constant?", "correctText": "const" },
      { "type": "CHECKBOX", "text": "Which are JS runtimes?", "options": [
        { "text": "Node.js", "isCorrect": true },
        { "text": "Deno", "isCorrect": true },
        { "text": "Photoshop", "isCorrect": false }
      ] }
    ]
  }'
```

## Валідація

Zod — єдиний джерело правди про форму запиту, схеми продубльовані на обох сторонах
(`backend/src/quizzes/schemas/`, `frontend/src/lib/validation/`) та змінюються разом. Правила:

- заголовок — від 1 до 200 символів, текст запитання — до 500;
- у квізі від 1 до 50 запитань;
- `Multiple choice` — від 2 до 10 варіантів, мінімум один вірний;
- у `Short answer` еталонна відповідь обов'язкова.

Бекенд відхиляє порушення `400`-ю відповіддю з масивом `errors: [{ path, message }]` — фронтенд
показує ці повідомлення під полями.

## Змінні оточення

`.env` не коммітяться, в репозиторії лежать лише шаблони:

| Файл                          | Змінні                                |
| ----------------------------- | ------------------------------------- |
| `backend/.env.example`        | `DATABASE_URL`, `PORT`, `CORS_ORIGIN` |
| `frontend/.env.local.example` | `NEXT_PUBLIC_API_URL`                 |

## Верстка

Mobile-first, один брейкпоінт — 768px. Розміри через `clamp()` / `%` / `minmax()`, токени
(відступи, шрифти, кольори) — в `frontend/src/styles/tokens.css`. Перевірено на 375, 768 та 1440px:
горизонтального скролу немає ні на одній зі сторінок.

## Межі scope

Свідомо не реалізовано — це не частина завдання, а не забуті фічі:

- **аутентифікація** — квізи спільні, користувачів немає;
- **проходження квізу та підрахунок балів** — правильні відповіді зберігаються, але сторінка деталей
  read-only за умовою завдання;
- **пагінація** списку квізів;
- **автотести** — завдання їх не потребує; перевірка ручна (ендпоінти через curl, інтерфейс у
  браузері).
