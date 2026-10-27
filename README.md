# 🚀 Smart ToDoList с AI-приоритезацией (Google Gemini API)

Веб-приложение для управления задачами с **авторизацией через Neon Auth**, базой данных **Neon PostgreSQL**, фронтендом на **Vercel** и **AI-приоритезацией через Google Gemini API**.

🌐 **Production URL:** [https://ai-todolist-app.vercel.app](https://ai-todolist-app.vercel.app)  
📦 **GitHub Repository:** [https://github.com/Russell2204/ai-todolist-app](https://github.com/Russell2204/ai-todolist-app)

---

## 🔐 Архитектура безопасности и API-ключей

> [!IMPORTANT]
> **API-ключи Google Gemini больше не сохраняются в браузере (`localStorage`).**
> У каждого пользователя свой ключ, который сохраняется в защищенной таблице `user_settings` в базе данных **Neon PostgreSQL** и привязан к его `user_id`. Все вызовы Gemini API происходят через серверные эндпоинты Next.js с авторизацией по сессии Neon Auth.

---

## ✨ Ключевые возможности

1. **👤 Регистрация и Вход (Neon Auth):**
   - Безопасная аутентификация по Email и паролю (сессионные куки).
   - При регистрации аккаунта автоматически создается персональное рабочее пространство и предустанавливаются стартовые задачи в Neon DB.
   - Выход из аккаунта (Sign Out).

2. **🗄 Облачная база данных Neon PostgreSQL:**
   - Таблица `tasks`: хранит задачи, чек-листы, дедлайны, квадранты Эйзенхауэра и AI-оценки конкретного пользователя.
   - Таблица `user_settings`: хранит персональный Google Gemini API ключ пользователя и выбранную модель.

3. **✨ Smart Auto-fill (Интеллектуальный NLP-ввод):**
   - Введите задачу естественным языком: *"Подготовить квартальный отчет к пятнице до 17:00, собрать графики"*.
   - Gemini автоматически выделит дедлайн, приоритет (`CRITICAL`/`HIGH`/`MEDIUM`/`LOW`), квадрант матрицы, оценку времени (`estimatedMinutes`) и теги.

4. **🪄 «Разобрать с AI» (Magic Re-prioritize):**
   - Пакетный анализ активных задач пользователя с вычислением индекса важности `aiScore` (1–100) и пояснения `aiReasoning`.
   - Мгновенное сохранение обновленных приоритетов в базу данных Neon.
   - Защита от частых запросов (30 секунд кулдаун).

5. **🧩 Декомпозиция задач («Разбить на шаги»):**
   - Генерация 3–5 конкретных шагов для чек-листа в один клик с записью подзадач в базу Neon.

6. **🎯 Матрица Эйзенхауэра (2x2 Grid) и Классический список:**
   - Q1: Сделать первым (Важно & Срочно)
   - Q2: Запланировать (Важно & Не срочно)
   - Q3: Делегировать (Не важно & Срочно)
   - Q4: Устранить (Не важно & Не срочно)
   - Фильтры («Все», «Активные», «Завершенные»), поиск и теги.

7. **☁️ Развертывание через CLI:**
   - Подключение и управление Neon через `neon.cmd` (проект `smart-ai-todolist`).
   - Развертывание фронтенда через `vercel.cmd` (проект `smart-ai-todolist`).

---

## 🛠 Технологический стек

- **Фронтенд:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19, TypeScript)
- **Стилизация:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Хостинг фронтенда:** [Vercel](https://vercel.com/) (Production: `smart-ai-todolist.vercel.app`)
- **База данных:** [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **Аутентификация:** [Neon Auth](https://neon.tech/docs/guides/neon-auth) (`@neondatabase/auth`)
- **AI SDK:** Официальный `@google/genai` с поддержкой `responseSchema` и моделей `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-2.0-flash`.

---

## 🚀 Запуск локально

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите сервер разработки:
   ```bash
   npm run dev
   ```
   Откройте [http://localhost:3000](http://localhost:3000).

3. Переменные окружения в `.env.local`:
   ```env
   DATABASE_URL="postgresql://neondb_owner:...@ep-muddy-bar-ba35o4yx-pooler.c-8.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://neondb_owner:...@ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
   NEON_BRANCH=main
   NEON_AUTH_BASE_URL="https://ep-muddy-bar-ba35o4yx.neonauth.c-8.eu-central-1.aws.neon.tech/neondb/auth"
   NEON_AUTH_COOKIE_SECRET="nFV9ICScC+Fz0/C9qSLMrlajFSHReunq2W9QrIO7nxo="
   ```
