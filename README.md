# Expense Tracker API

A production-deployed REST API for personal expense management, featuring JWT authentication, per-user data isolation, request validation, pagination, filtering, and MongoDB aggregation.

**Live URL:** https://13.239.84.60.nip.io

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Query Parameters](#query-parameters)
- [Getting Started](#getting-started)
- [Docker](#docker)
- [Deployment](#deployment)
- [Performance](#performance)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

- **JWT Authentication**: register, login, and protected routes using HttpOnly cookies
- **bcrypt Password Hashing**: plain-text passwords are never stored
- **Per-user Data Isolation**: users can only access their own expenses
- **Zod Validation**: request body validation on all write endpoints
- **Pagination**: `?page=1&limit=10` on list endpoints
- **Filtering**: by category, date range, and amount range
- **Sorting**: ascending or descending on any field (e.g. `?sort=-amount`)
- **Aggregation Summary**: total spent, transaction count, and per-category breakdown
- **Rate Limiting**: 5 requests / 15 min on auth routes, 200 requests / 15 min on all others
- **Centralized Error Handling**: `AppError` + `catchAsync` pattern, no scattered try/catch blocks
- **Production Deployment**: AWS EC2 with Nginx reverse proxy, Let's Encrypt HTTPS, and PM2 process manager

---

## Tech Stack

| Layer            | Technology                          |
| :--------------- | :---------------------------------- |
| Runtime          | Node.js 20                          |
| Framework        | Express                             |
| Database         | MongoDB Atlas + Mongoose            |
| Authentication   | JWT + bcrypt                        |
| Validation       | Zod                                 |
| Rate Limiting    | express-rate-limit                  |
| Deployment       | AWS EC2, Nginx, PM2, Let's Encrypt  |
| Containerization | Docker                              |

---

## API Reference

**Base URL:** `https://13.239.84.60.nip.io`

### Auth

| Method | Endpoint                   | Description                    | Auth |
| :----- | :------------------------- | :----------------------------- | :--- |
| POST   | `/users/auth/register`     | Register a new user            | No   |
| POST   | `/users/auth/login`        | Login and receive a JWT cookie | No   |
| GET    | `/users/auth/me`           | Get the current user           | Yes  |
| PATCH  | `/users/auth/me`           | Update username                | Yes  |
| GET    | `/users/auth/findAllUsers` | List users (paginated)         | Yes  |

### Expenses

All expense endpoints require authentication.

| Method | Endpoint                | Description                                |
| :----- | :---------------------- | :----------------------------------------- |
| POST   | `/api/expenses`         | Create an expense                          |
| GET    | `/api/expenses`         | List your expenses (pagination, filtering) |
| GET    | `/api/expenses/summary` | Aggregated spending summary                |
| GET    | `/api/expenses/:id`     | Get one expense (ownership checked)        |
| PATCH  | `/api/expenses/:id`     | Update an expense                          |
| DELETE | `/api/expenses/:id`     | Delete an expense                          |

### System

| Method | Endpoint  | Description  |
| :----- | :-------- | :----------- |
| GET    | `/status` | Health check |

---

## Query Parameters

### `GET /api/expenses`

| Parameter                  | Description                                   | Example                          |
| :------------------------- | :-------------------------------------------- | :------------------------------- |
| `page`                     | Page number (default `1`)                     | `?page=2`                        |
| `limit`                    | Items per page (default `10`, max `100`)      | `?limit=25`                      |
| `category`                 | Filter by category                            | `?category=Food`                 |
| `from`, `to`               | Filter by date range                          | `?from=2026-10-01&to=2026-10-31` |
| `minAmount`, `maxAmount`   | Filter by amount range                        | `?minAmount=100&maxAmount=500`   |
| `sort`                     | Sort field; prefix `-` for descending         | `?sort=-amount`, `?sort=date`    |

### `GET /api/expenses/summary`

| Parameter | Description                          | Example           |
| :-------- | :----------------------------------- | :---------------- |
| `month`   | Optional; restrict to a given month  | `?month=2026-10`  |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB connection string (MongoDB Atlas or local)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/expense-tracker-api.git
cd expense-tracker-api

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
NODE_ENV=development
```

> `.env` is listed in `.gitignore` and must never be committed.

### Run

```bash
npm run dev
```

---

## Docker

```bash
# Build the image
docker build -t expense-api .

# Run the container
docker run -p 4000:3000 --env-file .env expense-api
```

The API will be available at `http://localhost:4000`.

---

## Deployment

The production setup runs on AWS EC2 behind Nginx with HTTPS from Let's Encrypt, and PM2 keeps the Node process alive.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

---

## Performance

Benchmarked with [autocannon](https://github.com/mcollina/autocannon) at 100 concurrent connections:

| Endpoint                        | Requests/sec        | p50  | p99   |
| :------------------------------ | :------------------ | :--- | :---- |
| `/status` (stateless)           | ~9,500              | 6 ms | 49 ms |
| `/api/expenses` (auth + DB)     | ~97 (rate-limited)  | n/a  | n/a   |

Infrastructure: AWS EC2 free tier with MongoDB Atlas M0. The `/api/expenses` figure is capped by the rate limiter rather than by server capacity.

---

## Project Structure

```
.
├── server.js
└── src/
    ├── app.js
    ├── config/          # Database connection
    ├── controllers/     # Route logic
    ├── middlewares/     # Auth, validation, rate limiting, error handling
    ├── models/          # Mongoose schemas
    ├── routes/          # Route definitions
    ├── utils/           # AppError, catchAsync
    └── validators/      # Zod schemas
```

---

## License

MIT