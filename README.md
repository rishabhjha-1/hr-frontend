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

### Full stack with Docker

From the monorepo root (parent folder with `docker-compose.yml`):

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`

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
