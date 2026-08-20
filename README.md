# Quiz Builder

Full-stack приложение для создания квизов с тремя типами вопросов: `Boolean`, `Input`, `Checkbox`.
Реализация тестового задания *Full-Stack JS Engineer Test Assessment — the Quiz Builder*.

| Пакет | Стек |
|---|---|
| `backend/` | NestJS 11, TypeScript, Prisma 6, PostgreSQL 16 — `http://localhost:4000` |
| `frontend/` | Next.js 15 (App Router), React 19, React Hook Form + Zod, CSS Modules — `http://localhost:3000` |

Пакеты независимы: у каждого свой `package.json`, `node_modules` и конфиги. Корневого
`package.json` нет — npm-команды запускаются **изнутри** `backend/` или `frontend/`.

Описание архитектуры — в [CLAUDE.md](CLAUDE.md), пошаговый план работ — в [PLAN.md](PLAN.md).

---

## Требования

- Node.js 20+
- Docker (для PostgreSQL)

## Быстрый старт

```bash
docker compose up -d                       # 1. PostgreSQL 16 на :5432

cd backend
cp .env.example .env                       # 2. переменные окружения
npm install
npx prisma migrate dev                     # 3. схема БД
npm run db:seed                            # 4. два демо-квиза
npm run start:dev                          # 5. API на :4000

cd ../frontend                             # в отдельном терминале
cp .env.local.example .env.local
npm install
npm run dev                                # 6. UI на :3000
```

Открыть <http://localhost:3000> — сработает редирект на `/quizzes`.

## Настройка базы данных

```bash
docker compose up -d
```

Поднимает PostgreSQL 16 на `localhost:5432` (пользователь `quiz`, пароль `quiz`, база
`quiz_builder`). Данные хранятся в томе `quiz-builder-pgdata` и переживают перезапуск контейнера.

```bash
docker compose ps       # STATUS должен быть "Up (healthy)"
docker compose down     # остановить, данные сохранить
docker compose down -v  # остановить и удалить данные
```

Схема применяется миграциями Prisma из `backend/`:

```bash
cd backend
npx prisma migrate dev        # создать/применить миграции
npx prisma studio             # посмотреть данные в браузере
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

| Метод | Путь | Ответ |
|---|---|---|
| `POST` | `/quizzes` | `201 { id }`, `400` при ошибке валидации |
| `GET` | `/quizzes` | `200 [{ id, title, questionCount, createdAt }]` |
| `GET` | `/quizzes/:id` | `200 QuizDetail` или `404` |
| `DELETE` | `/quizzes/:id` | `204` или `404` |

Прочие скрипты: `npm run build`, `npm run start:prod`, `npm run lint`, `npm run db:seed`.

## Запуск frontend

```bash
cd frontend
cp .env.local.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                         # http://localhost:3000
```

Бэкенд должен быть запущен — иначе страницы покажут ошибку загрузки, а форма создания сообщит,
что API недоступен.

| Маршрут | Что делает |
|---|---|
| `/` | редирект на `/quizzes` |
| `/quizzes` | список: заголовок, число вопросов, ссылка на детали, иконка удаления |
| `/create` | форма создания квиза |
| `/quizzes/:id` | read-only просмотр вопросов и правильных ответов |

Прочие скрипты: `npm run build`, `npm run start`, `npm run lint`, `npm run format:check`.

## Создание примера квиза

**Через seed-скрипт** — быстрее всего, создаёт два квиза со всеми тремя типами вопросов
(*JavaScript Fundamentals* — 5 вопросов, *Web Basics* — 3):

```bash
cd backend
npm run db:seed
```

Скрипт идемпотентен: сначала чистит таблицы, потом создаёт заново.

**Через интерфейс:**

1. Открыть <http://localhost:3000/quizzes> и нажать **New quiz** (или перейти на `/create`).
2. Заполнить **Quiz title**.
3. Для первого вопроса ввести текст и выбрать **Answer type**:
   - `True / False` — отметить правильный вариант радиокнопкой;
   - `Short answer` — вписать эталонный ответ;
   - `Multiple choice` — заполнить варианты и отметить галочками все верные (минимум два
     варианта, хотя бы один верный). Кнопка **Add option** добавляет ещё.
4. **Add question** — добавить следующий вопрос, крестик в углу карточки — удалить.
5. **Create quiz** — после сохранения откроется страница созданного квиза.

Удалить квиз можно иконкой корзины на карточке в списке — карточка исчезает без перезагрузки
страницы.

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

## Валидация

Zod — единственный источник правды о форме запроса, схемы продублированы на обеих сторонах
(`backend/src/quizzes/schemas/`, `frontend/src/lib/validation/`) и меняются вместе. Правила:

- заголовок — от 1 до 200 символов, текст вопроса — до 500;
- в квизе от 1 до 50 вопросов;
- `Multiple choice` — от 2 до 10 вариантов, минимум один верный;
- у `Short answer` эталонный ответ обязателен.

Бэкенд отклоняет нарушения `400`-м ответом с массивом `errors: [{ path, message }]` — фронтенд
показывает эти сообщения под полями.

## Переменные окружения

`.env` не коммитятся, в репозитории лежат только шаблоны:

| Файл | Переменные |
|---|---|
| `backend/.env.example` | `DATABASE_URL`, `PORT`, `CORS_ORIGIN` |
| `frontend/.env.local.example` | `NEXT_PUBLIC_API_URL` |

## Вёрстка

Mobile-first, один брейкпоинт — 768px. Размеры через `clamp()` / `%` / `minmax()`, токены
(отступы, шрифты, цвета) — в `frontend/src/styles/tokens.css`. Проверено на 375, 768 и 1440px:
горизонтального скролла нет ни на одной из страниц.

## Границы scope

Сознательно не реализовано — это не часть задания, а не забытые фичи:

- **аутентификация** — квизы общие, пользователей нет;
- **прохождение квиза и подсчёт баллов** — правильные ответы хранятся, но страница деталей
  read-only по условию задания;
- **пагинация** списка квизов;
- **автотесты** — задание их не требует; проверка ручная (эндпоинты через curl, интерфейс в
  браузере).
