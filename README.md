# BandFlow

Платформа для музичних гуртів: управління профілем, бронювання виступів, відгуки та галерея.

## Технологічний стек

- **Next.js 16** (App Router, TypeScript)
- **Prisma ORM** + **PostgreSQL** (Neon)
- **NextAuth.js v5** (Google OAuth + email/password)
- **Cloudinary** (зберігання фото)
- **Tailwind CSS v4** + **shadcn/ui**

---

## Передумови

| Інструмент | Мінімальна версія |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| Git | будь-яка |

---

## Розгортання локально

### 1. Клонування репозиторію

```bash
git clone <url-репозиторію>
cd bandflow
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних середовища

Скопіюйте файл прикладу та заповніть значення:

```bash
cp .env.example .env
```

Відкрийте `.env` та вкажіть наступні змінні:

```env
# База даних (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth — секретний ключ сесій (генерується одноразово)
AUTH_SECRET="<згенеруйте командою: openssl rand -base64 32>"

# Google OAuth
GOOGLE_CLIENT_ID="<з Google Cloud Console>"
GOOGLE_CLIENT_SECRET="<з Google Cloud Console>"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<назва хмари>"
CLOUDINARY_API_KEY="<api key>"
CLOUDINARY_API_SECRET="<api secret>"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="<назва unsigned preset>"
```

### 4. Отримання зовнішніх сервісів

#### База даних (Neon PostgreSQL)

1. Зареєструйтесь на [neon.tech](https://neon.tech)
2. Створіть новий проект
3. Скопіюйте рядок підключення з вкладки **Connection Details** (режим **Pooled connection**)
4. Вставте у `DATABASE_URL`

#### Google OAuth

1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com)
2. Створіть новий проект або оберіть існуючий
3. Перейдіть до **APIs & Services → Credentials**
4. Натисніть **Create Credentials → OAuth 2.0 Client ID**
5. Тип: **Web application**
6. Додайте **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (локальна розробка)
   - `https://your-domain.com/api/auth/callback/google` (продакшн)
7. Скопіюйте **Client ID** та **Client Secret**

#### Cloudinary

1. Зареєструйтесь на [cloudinary.com](https://cloudinary.com)
2. На головній сторінці Dashboard скопіюйте **Cloud name**, **API Key**, **API Secret**
3. Перейдіть до **Settings → Upload**
4. Створіть **Upload Preset** з режимом **Unsigned** (назву вкажіть у `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`)

### 5. Застосування міграцій бази даних

```bash
npx prisma migrate deploy
```

> Якщо база даних порожня вперше — можна також використати:
> ```bash
> npx prisma db push
> ```

### 6. Запуск у режимі розробки

```bash
npm run dev
```

Застосунок буде доступний за адресою: [http://localhost:3000](http://localhost:3000)

---

## Збірка та запуск у продакшн-режимі

```bash
npm run build
npm run start
```

---

## Розгортання на Vercel

1. Завантажте репозиторій на GitHub
2. Перейдіть на [vercel.com](https://vercel.com) та натисніть **New Project**
3. Імпортуйте репозиторій
4. У розділі **Environment Variables** додайте всі змінні з `.env` (аналогічно кроку 3)
5. Натисніть **Deploy**

> Після деплою додайте `https://your-project.vercel.app/api/auth/callback/google` до списку дозволених redirect URI у Google Cloud Console.

---

## Корисні команди

```bash
# Переглянути базу даних через браузер
npx prisma studio

# Згенерувати Prisma Client вручну
npx prisma generate

# Скинути базу даних (увага: видаляє всі дані)
node scripts/clear-db.js
```

---

## Структура проекту

```
bandflow/
├── app/              # Next.js App Router (сторінки та layout)
├── components/       # UI-компоненти
├── lib/              # Допоміжні утиліти (prisma client, utils)
├── prisma/           # Схема бази даних та міграції
├── public/           # Статичні файли
├── auth.ts           # Конфігурація NextAuth
└── middleware.ts     # Захист маршрутів
```
