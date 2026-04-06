# expressjs-api-getting-started

A TypeScript Express.js REST API starter template demonstrating:

- Helmet, CORS, Morgan middleware
- Request ID tracking
- JWT authentication (sign + verify)
- Input validation with `express-validator`
- In-memory caching with `node-cache`
- Rate limiting (global + per-route)
- Centralized structured error handling
- Role-based access control (admin/user)
- Winston logging

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Server starts on `http://localhost:3000`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| POST | /api/auth/login | No | Get JWT token |
| GET | /api/products | No | List products (cached) |
| GET | /api/products/:id | No | Get product (cached) |
| POST | /api/products | JWT | Create product |
| PUT | /api/products/:id | JWT | Update product |
| DELETE | /api/products/:id | JWT (admin) | Delete product |

## Test Credentials

```json
{ "email": "user@example.com", "password": "password123" }
{ "email": "admin@example.com", "password": "admin123" }
```
