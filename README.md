# HR Portal — Frontend

Incubyte assessment: React UI for HR managers and employee self-service attendance. Built with Vite, Tailwind CSS, and Vitest.

**Companion repo:** [hr-backend](https://github.com/rishabhjha-1/hr-backend)

## Stack

- React 19, TypeScript, Vite, Tailwind CSS

## Features

| Tab | Purpose |
|-----|---------|
| **Employees** | CRUD, search, pagination |
| **Attendance** | HR view and mark attendance for any employee |
| **My device** | Employees check in/out with work email |
| **Payroll** | Pay derived from attendance + annual salary |
| **Insights** | Salary breakdown by country and job title |

## Quick start

### 1. Start the backend

Follow [hr-backend README](https://github.com/rishabhjha-1/hr-backend) to run Postgres and the API on port `3000`.

### 2. Frontend setup

```bash
pnpm install
pnpm dev
```

UI runs at `http://localhost:5173` (proxies `/api` to the backend).

### Docker (this repo)

1. Start backend + Postgres from [hr-backend](https://github.com/rishabhjha-1/hr-backend):

```bash
docker compose up --build
```

2. Seed the database (`pnpm db:seed` in hr-backend), then start the UI:

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080` (proxies `/api` to backend on your machine)

### Full stack (monorepo)

If you have both folders under one parent project, use the root `docker-compose.yml` there for postgres + backend + frontend in one command.

## Tests

```bash
pnpm test
```

## Build

```bash
pnpm build
```

Serve the `dist/` folder with any static host; proxy `/api` to the backend (see `nginx.conf` in the monorepo Docker setup).

## Architecture

See [`artifacts/planning.md`](artifacts/planning.md) for design notes, TDD approach, and trade-offs.
