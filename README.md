# URL Shortener

A modern full-stack URL shortener built with **React, TypeScript, Express, MongoDB, and Mongoose**. Create short links, manage your URLs, track clicks, and securely authenticate with JWT-based sessions.

This monorepo contains a React frontend and a Node.js/Express backend designed to work together as a complete URL-shortening application.

## ✨ Features

### 🔗 URL Shortening

- Create short URLs from long HTTP/HTTPS URLs
- Generate unique short codes
- Redirect short links to their original destinations
- Track click counts
- Enable or disable shortened URLs
- Delete shortened URLs
- View URLs belonging to the authenticated user

### 🔐 Authentication & Security

- User registration and login
- JWT access-token authentication
- Refresh-token authentication flow
- HTTP-only refresh-token cookies
- Persistent sessions with hashed refresh tokens
- Session metadata including IP, user agent, activity, revocation, and expiration
- User/admin role-based authorization
- Password hashing with bcryptjs
- Zod request validation
- Authentication and API rate limiting
- Configurable CORS
- Centralized API error handling
- Structured request logging with Winston
- MongoDB TTL cleanup for expired sessions

### 🖥️ Frontend

- React 19 + TypeScript
- Vite development environment
- TanStack Query for server-state management
- React Hook Form + Zod validation
- React Router for application routing
- Tailwind CSS for styling
- Responsive dashboard experience
- Auth/session restoration across page refreshes
- URL creation and management UI

### 🧪 Backend Testing

- Jest test runner
- Supertest API integration testing
- Authentication, URL, redirect, validation, authorization, and security coverage

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│ React + TypeScript + Vite    │
│ TanStack Query               │
│ React Hook Form + Zod        │
│ React Router + Tailwind CSS  │
└──────────────┬───────────────┘
               │ HTTP / JSON
               │ JWT + Cookies
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│                              │
│ Node.js + Express 5          │
│ TypeScript                   │
│ Controllers / Services       │
│ JWT Authentication           │
│ Validation / Middleware      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│                              │
│ Users / URLs / Sessions      │
│ Mongoose ODM                 │
└──────────────────────────────┘
```

## 📁 Project Structure

```text
url_shortener/
├── url_shortener_frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── url_shortener_backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── tests/
│   │   └── integration/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── README.md
```

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| **React 19** | UI library |
| **TypeScript** | Type-safe frontend development |
| **Vite** | Development server and build tooling |
| **TanStack Query** | Server-state and API data management |
| **React Router** | Client-side routing |
| **React Hook Form** | Form management |
| **Zod** | Client-side validation |
| **Tailwind CSS** | Styling |
| **shadcn** | UI component tooling |

### Backend

| Technology | Purpose |
| --- | --- |
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API framework |
| **TypeScript** | Type-safe backend development |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM |
| **jsonwebtoken** | JWT authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation |
| **Winston** | Application logging |
| **cookie-parser** | Cookie handling |
| **CORS** | Cross-origin request handling |
| **Jest** | Test runner |
| **Supertest** | API integration testing |
| **tsx** | Development TypeScript runner |
| **tsup** | Production bundling |

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- **Node.js 20+** recommended
- **npm**
- **MongoDB** locally or through MongoDB Atlas

### 1. Clone the repository

```bash
git clone https://github.com/iamsyedbilal/url_shortener.git
cd url_shortener
```

### 2. Start the backend

```bash
cd url_shortener_backend
npm install
```

Create `url_shortener_backend/.env`:

```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=url_shortener
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

Then start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:8000
```

### 3. Start the frontend

Open another terminal from the repository root:

```bash
cd url_shortener_frontend
npm install
npm run dev
```

The frontend runs at the Vite development URL, typically:

```text
http://localhost:5173
```

> The frontend expects the backend API to be running and configured for the frontend origin.

### 4. Production builds

Backend:

```bash
cd url_shortener_backend
npm run build
npm start
```

Frontend:

```bash
cd url_shortener_frontend
npm run build
npm run preview
```

## 📡 API Overview

The backend API is available under `/api`.

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register a user |
| `POST` | `/api/auth/login` | Public | Login and receive an access token |
| `POST` | `/api/auth/refresh-token` | Refresh cookie | Refresh the access token |
| `POST` | `/api/auth/logout` | Refresh cookie | Logout and revoke the refresh-token session |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user/me` | User | Get the current user's profile |
| `GET` | `/api/user/all-user` | Admin | Get all users |

### URLs

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/url/create-url` | User | Create a short URL |
| `GET` | `/api/url/me` | User | Get the current user's URLs |
| `PATCH` | `/api/url/:id/disable` | User | Disable a URL |
| `DELETE` | `/api/url/:id` | User | Delete a URL |
| `GET` | `/:shortCode` | Public | Redirect to the original URL |

### Admin

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | Admin | List users |
| `GET` | `/api/admin/urls` | Admin | List URLs |
| `PATCH` | `/api/admin/urls/:id/disable` | Admin | Disable a URL |
| `DELETE` | `/api/admin/urls/:id` | Admin | Delete a URL |

## 🔐 Authentication Flow

The application uses short-lived access tokens together with refresh-token sessions.

1. Register an account.
2. Login with email and password.
3. The backend returns an access token.
4. The refresh token is stored in an HTTP-only `refreshToken` cookie.
5. Protected requests use `Authorization: Bearer <access-token>`.
6. When the access token expires, the frontend can refresh the session using the refresh-token endpoint.
7. Refresh tokens are stored as hashes in persistent session records.
8. Logout revokes the session and clears the refresh-token cookie.

Access tokens currently expire after **15 minutes**, while refresh-token cookies are configured for **7 days**.

## 🔗 URL Shortening Flow

```text
User enters long URL
        │
        ▼
Frontend validates input
        │
        ▼
POST /api/url/create-url
        │
        ▼
Backend generates short code
        │
        ▼
URL stored in MongoDB
        │
        ▼
Short URL returned to frontend
        │
        ▼
User opens /:shortCode
        │
        ▼
Backend resolves short code
        │
        ├── Active → redirect + increment clicks
        │
        └── Disabled → 410 response
```

## 🗃️ Data Models

### User

- `username`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

### URL

- `originalUrl`
- `shortCode`
- `userId`
- `clickCount`
- `isActive`
- `createdAt`
- `updatedAt`

### Session

- `user`
- `sessionId`
- `refreshTokenHash`
- `ip`
- `userAgent`
- `lastUsedAt`
- `revokedAt`
- `expiresAt`
- `createdAt`
- `updatedAt`

Expired sessions are automatically cleaned up through MongoDB's TTL index on `expiresAt`.

## 🛡️ Security

Security is an important part of the project architecture:

- Passwords are hashed with `bcryptjs`.
- Access tokens are short-lived.
- Refresh tokens use HTTP-only cookies.
- Refresh-token hashes are stored instead of raw refresh tokens.
- Protected routes use authentication middleware.
- Admin operations use role-based authorization.
- Authentication and URL payloads are validated with Zod.
- Destination URLs are restricted to HTTP/HTTPS.
- CORS is configurable.
- Request-body size is limited.
- Authentication/API rate limiting is enabled.
- Errors are handled centrally.
- Requests are logged with Winston.

## 🧪 Testing

The backend includes automated API integration tests using **Jest + Supertest**.

Run the backend test suite:

```bash
cd url_shortener_backend
npm test
```

Watch tests during development:

```bash
npm run test:watch
```

Generate coverage:

```bash
npm run test:coverage
```

The test suite covers areas including authentication, users, URL management, redirects, validation, authorization, refresh-token flows, and security behavior.

## 📜 Scripts

### Frontend

Run from `url_shortener_frontend`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the frontend |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

### Backend

Run from `url_shortener_backend`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with file watching |
| `npm run build` | Build the TypeScript backend with tsup |
| `npm start` | Start the compiled backend |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage |

## 🌐 CORS

Configure one or more frontend origins in the backend `.env` file:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

Credentials are enabled so the refresh-token cookie can be used by the frontend.

## 🗺️ Roadmap

Potential future improvements include:

- URL analytics and click history
- Detailed click analytics by date
- Custom short codes
- URL expiration
- QR code generation
- API documentation with OpenAPI/Swagger
- Production deployment
- Docker support
- Improved admin dashboard

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run the relevant checks:

```bash
cd url_shortener_backend
npm test
npm run build

cd ../url_shortener_frontend
npm run lint
npm run build
```

5. Commit your changes:

```bash
git commit -m "feat: your change"
```

6. Push your branch and open a pull request.

## 📄 License

No license file is currently defined. Add a `LICENSE` file if you intend to distribute this project under an open-source license.

---

Built with **React, TypeScript, Express, MongoDB, and Mongoose**.
