# Democracy — Corporation Elections Field Tracking

A web application for tracking voter outreach during Corporation Elections. Agents mark voters they've met house-by-house, and admins monitor division-wide progress.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **MongoDB** (via Prisma)
- **Vercel** (deployment)

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)

## Setup

### 1. Clone and install

```bash
cd democracy
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — your MongoDB Atlas connection string
- `JWT_SECRET` — any random string (min 32 characters)

### 3. Push schema to database

```bash
npx prisma db push
```

### 4. Seed data

```bash
npx prisma db seed
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | admin    | admin123   |
| Agent | agent    | agent123   |

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`)
4. Deploy

Vercel will automatically run `prisma generate` via the `postinstall` script.

After first deploy, seed the database:
```bash
npx prisma db seed
```

## Project Structure

```
democracy/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── app/
│   │   ├── page.tsx        # Login
│   │   ├── agent/          # Agent pages
│   │   ├── admin/          # Admin dashboard
│   │   └── api/            # API routes
│   ├── lib/
│   │   ├── auth.ts         # JWT auth helpers
│   │   └── prisma.ts       # Prisma client
│   └── middleware.ts       # Route protection
└── package.json
```
