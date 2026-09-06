# URL Shortener

A full-stack URL shortener project focused on building a clean, secure, tested, and scalable backend API for creating and managing short links.

The repository currently contains the backend application in [`url_shortener_backend`](./url_shortener_backend), built with **Node.js, Express 5, TypeScript, MongoDB, and Mongoose**.

## ✨ Features

- 🔗 Create short URLs from long HTTP/HTTPS URLs
- 🚀 Redirect short codes to their original URLs
- 📊 Track URL click counts
- ⛔ Disable shortened URLs
- 🗑️ Delete shortened URLs
- 👤 User registration and login
- 🔐 JWT access-token authentication
- 🔄 Refresh-token authentication flow
- 🍪 HTTP-only refresh-token cookies
- 🧾 Persistent session records with refresh-token hashes
- 🛡️ User/admin role-based authorization
- 👤 Authenticated user profile endpoint
- 👥 Admin-only user listing
- ✅ Zod request validation
- 🔒 Password hashing with bcryptjs
- 📝 Winston request logging
- 🌐 Configurable CORS
- ⚠️ Centralized API error handling
- 🗄️ MongoDB TTL cleanup for expired sessions
- 🧪 Automated API integration testing with Jest and Supertest

## 🏗️ Project Structure

```text
url_shortener/
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
└── README.md
```

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API framework |
| **TypeScript** | Type-safe development |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM |
| **jsonwebtoken** | JWT authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation |
| **Winston** | Application logging |
| **cookie-parser** | Cookie handling |
| **CORS** | Cross-origin request handling |
| **Jest** | Test runner and assertions |
| **Supertest** | HTTP/API integration testing |
| **tsx** | Development TypeScript runner |
| **tsup** | Production bundling |

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** recommended
- **npm**
- **MongoDB** locally or through MongoDB Atlas

### 1. Clone the repository

```bash
git clone https://github.com/iamsyedbilal/url_shortener.git
cd url_shortener/url_shortener_backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `url_shortener_backend`:

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

> Never commit real secrets or production credentials to the repository. Use strong, randomly generated JWT secrets.

### 4. Run the development server

```bash
npm run dev
```

The backend runs on `http://localhost:8000`.

### 5. Build for production

```bash
npm run build
npm start
```

## 📡 API Overview

Base URL: `http://localhost:8000`

### Authentication

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register a user |
| `POST` | `/api/auth/login` | Public | Login and receive an access token |
| `POST` | `/api/auth/refresh-token` | Refresh cookie | Refresh the access token |
| `POST` | `/api/auth/logout` | Refresh cookie | Logout and revoke the refresh-token session |

### Users

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user/me` | User | Get the current user's profile |
| `GET` | `/api/user/all-user` | Admin | Get all users |

### URLs

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/url/create-url` | User | Create a short URL |
| `GET` | `/api/url/me` | User | Get the current user's URLs |
| `PATCH` | `/api/url/:id/disable` | User | Disable a URL |
| `DELETE` | `/api/url/:id` | User | Delete a URL |
| `GET` | `/api/url/:shortCode` | Public | Redirect to the original URL |

### Admin

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | Admin | List users |
| `GET` | `/api/admin/urls` | Admin | List URLs |
| `PATCH` | `/api/admin/urls/:id/disable` | Admin | Disable a URL |
| `DELETE` | `/api/admin/urls/:id` | Admin | Delete a URL |

## 🔐 Authentication

The backend uses access and refresh tokens.

1. Register an account.
2. Login with email and password.
3. The API returns a short-lived access token.
4. The refresh token is stored in an HTTP-only `refreshToken` cookie.
5. Send the access token with protected requests using `Authorization: Bearer <access-token>`.
6. When the access token expires, call `POST /api/auth/refresh-token`.
7. Logout revokes the refresh-token session and clears the cookie.

Access tokens currently expire after **15 minutes** and refresh-token cookies are configured for **7 days**.

## 🔗 URL Management

Create a short URL with:

```http
POST /api/url/create-url
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "originalUrl": "https://example.com/some/long/path"
}
```

The destination must be a valid HTTP or HTTPS URL. A public request to `GET /api/url/:shortCode` resolves the short code, updates the click count, and redirects to the original URL.

## 🗃️ Data Models

### User

- `username`
- `email`
- `passwordHash`
- `role` — `user` or `admin`
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

Expired sessions are automatically cleaned up through a MongoDB TTL index on `expiresAt`.

## 🛡️ Security

- Password hashing with bcryptjs
- Short-lived JWT access tokens
- HTTP-only refresh-token cookies
- Hashed refresh tokens in the database
- Authentication middleware for protected routes
- Role-based authorization for admin routes
- Zod validation for incoming data
- HTTP/HTTPS destination validation
- Configurable CORS
- 16 KB JSON and URL-encoded request-body limits
- Centralized error handling
- Structured request logging
- Authentication and API rate limiting

## 🧪 Testing

The backend has automated API integration tests using **Jest + Supertest**.

Current test status:

- **16 test suites passed**
- **151 tests passed**
- **0 failed tests**
- **96.37% statement coverage**
- **96.35% line coverage**
- **98.21% function coverage**
- **82% branch coverage**

Run the full test suite with:

```bash
npm test
```

Watch tests during development:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run test:coverage
```

The integration tests exercise the API through HTTP requests, covering authentication, users, URL management, redirects, admin authorization, validation, error handling, refresh-token flows, and security-related behavior.

## 📚 Documentation

The backend README contains the detailed developer documentation for:

- Setup and environment configuration
- Available scripts
- Authentication and refresh-token flow
- API endpoint reference and request examples
- Data models
- Security architecture
- CORS configuration
- Testing and coverage

Formal OpenAPI/Swagger documentation is not currently required. It can be added later if the API needs an interactive API reference or external consumers.

## 📜 Backend Scripts

Run these commands from `url_shortener_backend`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with file watching |
| `npm run build` | Build the TypeScript backend with tsup |
| `npm start` | Start the compiled backend |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage |

## 🌐 CORS

Configure one or more frontend origins with:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

Credentials are enabled so the refresh-token cookie can be used by a frontend application.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run the tests and production build:

```bash
npm test
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

Built with **TypeScript, Express, MongoDB, and Mongoose**.
