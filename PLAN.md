# План реализации — Quiz Builder

Пошаговый чек-лист. Описание архитектуры, схема БД, контракт API и правила вёрстки — в
[CLAUDE.md](CLAUDE.md).

---

## Этап 1 — Инфраструктура ✅

- [x] `docker-compose.yml` с PostgreSQL 16 (healthcheck, named volume)
- [x] Корневой `.gitignore`: `node_modules`, `.env`, `.env.local`, `.next`, `dist`
- [x] Заглушка корневого `README.md`
- [x] Проверено: контейнер поднимается, healthcheck зелёный, подключение к БД работает

## Этап 2 — Backend ✅

- [x] `nest new backend`, вычистить шаблон (удалить `app.controller.ts` / `app.service.ts`)
- [x] Установить и настроить Prisma, описать `schema.prisma`
- [x] Первая миграция: `npx prisma migrate dev --name init`
- [x] `PrismaService` с `onModuleInit` + `PrismaModule`
- [x] `ZodValidationPipe` в `common/pipes/`
- [x] Zod-схемы в `quizzes/schemas/`, DTO-типы через `z.infer`
- [x] `QuizzesService` — четыре метода, `NotFoundException` на несуществующий id
- [x] `QuizzesController` — четыре роута, `@HttpCode(204)` на delete
- [x] `main.ts`: CORS для `localhost:3000`, `ConfigModule`, порт из `.env`, **без глобального префикса**
- [x] `prisma/seed.ts` + скрипт `db:seed`, прогнать
- [x] Ручная проверка всех эндпоинтов (включая 404 и 204)
- [x] ESLint + Prettier, `npm run lint` без ошибок
- [x] `.env.example`

## Этап 3 — Frontend

- [x] `create-next-app` (TypeScript, App Router, **без** Tailwind), вычистить шаблон
- [x] `styles/reset.css` + `styles/tokens.css`, подключить в `layout.tsx`
- [x] UI-примитивы: `Button`, `TextInput`, `Field`, `Card` — каждый со своим `.module.css`
- [x] `services/http.ts` + `services/quizzes.ts`
- [x] `app/page.tsx` — редирект на `/quizzes`
- [x] Страница `/quizzes` — Server Component, `cache: 'no-store'`, empty-state
- [x] Карточка квиза: заголовок, число вопросов, ссылка на детали
- [x] Иконка удаления (inline SVG, `aria-label`) — Client Component, `DELETE` + `router.refresh()`
- [x] Страница `/create` — RHF + `zodResolver`, `useFieldArray` для вопросов (add/remove)
- [x] Редактор ответа для трёх типов; вложенный `useFieldArray` для опций CHECKBOX
- [x] Сабмит на `POST /quizzes` + редирект на `/quizzes/:id`
- [x] Страница `/quizzes/[id]` — read-only рендер трёх типов, `notFound()` на 404
- [x] Состояния: loading, ошибка запроса, пустой список
- [x] ESLint + Prettier, `npm run lint` без ошибок
- [x] `.env.local.example`

## Этап 4 — Отделка ✅

- [x] Проверка вёрстки на 375 / 768 / 1440 — нет горизонтального скролла
- [x] Проверить, что `.env` не попал в индекс git
- [x] README: настройка БД → запуск backend → запуск frontend → создание sample quiz
- [x] Зафиксировать в README границы scope (см. CLAUDE.md → Scope boundaries)
- [x] Финальный прогон `npm run lint` и `npm run build` в обоих пакетах

---

## Приёмка ✅

Соответствие пунктам задания:

- [x] `docker compose up -d` поднимает PostgreSQL
- [x] Четыре эндпоинта по путям `/quizzes*` без префикса, включая 404 и 204
- [x] Валидация отклоняет пустой title, квиз без вопросов, CHECKBOX без верных опций
- [x] Seed создаёт два квиза со всеми тремя типами вопросов
- [x] `/create` — title + динамический add/remove вопросов, три типа, сабмит на `POST /quizzes`
- [x] `/quizzes` — title и число вопросов, ссылка на детали, иконка удаления убирает квиз из БД и со страницы
- [x] `/quizzes/:id` — title и вопросы в read-only виде
- [x] Вёрстка резиновая, корректна на мобилке и десктопе
- [x] `npm run lint` и `npm run build` проходят в `/backend` и `/frontend`
- [x] `.env` не в репозитории, `.env.example` — в репозитории
- [x] README покрывает запуск frontend/backend, настройку БД и создание sample quiz
- [x] В корне ровно две директории пакетов: `/frontend` и `/backend`
