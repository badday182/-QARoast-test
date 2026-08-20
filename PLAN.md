# План реализации — Quiz Builder

Пошаговый чек-лист. Описание архитектуры, схема БД, контракт API и правила вёрстки — в
[CLAUDE.md](CLAUDE.md).

---

## Этап 1 — Инфраструктура

- [ ] `docker-compose.yml` с PostgreSQL 16 (healthcheck, named volume)
- [ ] Корневой `.gitignore`: `node_modules`, `.env`, `.env.local`, `.next`, `dist`
- [ ] Заглушка корневого `README.md`

## Этап 2 — Backend

- [ ] `nest new backend`, вычистить шаблон (удалить `app.controller.ts` / `app.service.ts`)
- [ ] Установить и настроить Prisma, описать `schema.prisma`
- [ ] Первая миграция: `npx prisma migrate dev --name init`
- [ ] `PrismaService` с `onModuleInit` + `PrismaModule`
- [ ] `ZodValidationPipe` в `common/pipes/`
- [ ] Zod-схемы в `quizzes/schemas/`, DTO-типы через `z.infer`
- [ ] `QuizzesService` — четыре метода, `NotFoundException` на несуществующий id
- [ ] `QuizzesController` — четыре роута, `@HttpCode(204)` на delete
- [ ] `main.ts`: CORS для `localhost:3000`, `ConfigModule`, порт из `.env`, **без глобального префикса**
- [ ] `prisma/seed.ts` + скрипт `db:seed`, прогнать
- [ ] Ручная проверка всех эндпоинтов (включая 404 и 204)
- [ ] ESLint + Prettier, `npm run lint` без ошибок
- [ ] `.env.example`

## Этап 3 — Frontend

- [ ] `create-next-app` (TypeScript, App Router, **без** Tailwind), вычистить шаблон
- [ ] `styles/reset.css` + `styles/tokens.css`, подключить в `layout.tsx`
- [ ] UI-примитивы: `Button`, `TextInput`, `Field`, `Card` — каждый со своим `.module.css`
- [ ] `services/http.ts` + `services/quizzes.ts`
- [ ] `app/page.tsx` — редирект на `/quizzes`
- [ ] Страница `/quizzes` — Server Component, `cache: 'no-store'`, empty-state
- [ ] Карточка квиза: заголовок, число вопросов, ссылка на детали
- [ ] Иконка удаления (inline SVG, `aria-label`) — Client Component, `DELETE` + `router.refresh()`
- [ ] Страница `/create` — RHF + `zodResolver`, `useFieldArray` для вопросов (add/remove)
- [ ] Редактор ответа для трёх типов; вложенный `useFieldArray` для опций CHECKBOX
- [ ] Сабмит на `POST /quizzes` + редирект на `/quizzes/:id`
- [ ] Страница `/quizzes/[id]` — read-only рендер трёх типов, `notFound()` на 404
- [ ] Состояния: loading, ошибка запроса, пустой список
- [ ] ESLint + Prettier, `npm run lint` без ошибок
- [ ] `.env.local.example`

## Этап 4 — Отделка

- [ ] Проверка вёрстки на 375 / 768 / 1440 — нет горизонтального скролла
- [ ] Проверить, что `.env` не попал в индекс git
- [ ] README: настройка БД → запуск backend → запуск frontend → создание sample quiz
- [ ] Зафиксировать в README границы scope (см. CLAUDE.md → Scope boundaries)
- [ ] Финальный прогон `npm run lint` и `npm run build` в обоих пакетах

---

## Приёмка

Соответствие пунктам задания:

- [ ] `docker compose up -d` поднимает PostgreSQL
- [ ] Четыре эндпоинта по путям `/quizzes*` без префикса, включая 404 и 204
- [ ] Валидация отклоняет пустой title, квиз без вопросов, CHECKBOX без верных опций
- [ ] Seed создаёт два квиза со всеми тремя типами вопросов
- [ ] `/create` — title + динамический add/remove вопросов, три типа, сабмит на `POST /quizzes`
- [ ] `/quizzes` — title и число вопросов, ссылка на детали, иконка удаления убирает квиз из БД и со страницы
- [ ] `/quizzes/:id` — title и вопросы в read-only виде
- [ ] Вёрстка резиновая, корректна на мобилке и десктопе
- [ ] `npm run lint` и `npm run build` проходят в `/backend` и `/frontend`
- [ ] `.env` не в репозитории, `.env.example` — в репозитории
- [ ] README покрывает запуск frontend/backend, настройку БД и создание sample quiz
- [ ] В корне ровно две директории пакетов: `/frontend` и `/backend`
