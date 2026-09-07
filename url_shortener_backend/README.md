# URL Shortener Backend

A production-minded REST API for the URL Shortener application, built with **Node.js, Express 5, TypeScript, MongoDB, and Mongoose**. The backend handles authentication, session management, URL shortening, redirects, click tracking, validation, authorization, logging, and security middleware.

## ✨ Features

- 🔐 **User authentication** — register and log in with email/password.
- 🎟️ **JWT authentication** — short-lived access tokens with refresh tokens stored in HTTP-only cookies.
- 🔄 **Refresh-token rotation** — refresh sessions are persisted and managed server-side.
- 🧾 **Session management** — track sessions with IP address, user-agent, last activity, revocation, and expiration metadata.
- 🔗 **URL shortening** — create short URLs for HTTP/HTTPS destinations.
- 🚀 **Short URL redirects** — resolve a short code and redirect to the original URL.
- 📊 **Click tracking** — increment click counts when short URLs are used.
- ⛔ **URL disabling** — disable a shortened URL without deleting its record.
- 🗑️ **URL deletion** — delete URLs belonging to the authenticated user.
- 👤 **User endpoints** — retrieve the current profile and admin-only user listings.
- 🛡️ **Role-based authorization** — supports `user` and `admin` roles.
- ✅ **Zod validation** — validate authentication and URL request payloads.
- 🧹 **MongoDB sanitization** — protect against NoSQL injection through request data.
- 🛡️ **Security middleware** — Helmet, rate limiting, compression, CORS, and request-size limits.
- 📝 **Centralized error handling & logging** — structured errors and Winston logging.
- 🗄️ **MongoDB TTL cleanup** — expired sessions are automatically removed through a TTL index.
- 🧪 **Automated API integration testing** — Jest and Supertest coverage for backend behavior.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API framework |
| **TypeScript** | Type-safe development |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM and schema management |
| **jsonwebtoken** | Access and refresh token handling |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation |
| **express-rate-limit** | Authentication/API rate limiting |
| **Helmet** | HTTP security headers |
| **Mongo sanitize** | NoSQL injection protection |
| **Winston** | Application logging |
| **cookie-parser** | HTTP cookie handling |
| **CORS** | Cross-origin request handling |
| **compression** | Response compression |
| **Jest** | Automated testing |
| **Supertest** | HTTP/API integration testing |
| **tsx** | TypeScript development runner |
| **tsup** | Production bundling |

## 📁 Project Structure

```text
url_shortener_backend/
├── src/
│   ├── controllers/       # HTTP request/response handlers
│   ├── db/                # MongoDB connection and database setup
│   ├── middlewares/       # Authentication, authorization, rate limiting, errors
│   ├── models/            # Mongoose models
│   ├── routes/            # Express route definitions
│   ├── services/          # Application/business logic
│   ├── utils/             # JWT, cookies, logging, and shared helpers
│   ├── validators/        # Zod schemas
│   ├── test/              # Jest/Supertest integration tests and test setup
│   ├── app.ts             # Express application configuration
│   └── index.ts            # Server entry point
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** recommended
- **npm**
- **MongoDB** local instance or MongoDB Atlas

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

# Optional: comma-separated frontend origins
CORS_ORIGIN=http://localhost:5173
```

For tests, configure the corresponding values in `.env.test`, including a test MongoDB connection and JWT secrets.

> **Security:** Never commit real secrets or production credentials. Use strong, randomly generated JWT secrets.

### 4. Start the development server

```bash
npm run dev
```

The API runs on `http://localhost:8000` by default.

### 5. Build for production

```bash
npm run build
npm start
```

The production bundle is generated in `dist/`.

## 🔐 Authentication & Sessions

The backend uses an access-token + refresh-token architecture:

1. Register or log in with email/password.
2. The API returns a short-lived access token.
3. The refresh token is stored in an HTTP-only `refreshToken` cookie.
4. Protected requests send the access token using:

```http
Authorization: Bearer <access-token>
```

5. When the access token expires, the client calls `/api/auth/refresh-token`.
6. The backend validates the refresh-token session and issues a new access token.
7. Logout revokes the session and clears the refresh-token cookie.

Refresh sessions are stored as hashes rather than raw refresh tokens and include activity/revocation metadata.

## 📡 API Reference

Base URL:

```text
http://localhost:8000
```

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Log in and receive an access token |
| `POST` | `/api/auth/refresh-token` | Refresh cookie | Refresh the access token |
| `POST` | `/api/auth/logout` | Refresh cookie | Revoke the current session and log out |

### User

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user/me` | User | Get the authenticated user's profile |
| `GET` | `/api/user/all-user` | Admin | Get all users |

### URLs

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/url/create-url` | User | Create a short URL |
| `GET` | `/api/url/me` | User | Get the authenticated user's URLs |
| `PATCH` | `/api/url/:id/disable` | User | Disable a URL |
| `DELETE` | `/api/url/:id` | User | Delete a URL |
| `GET` | `/:shortCode` | No | Redirect to the original URL |

> **Important:** Public short URLs are served from the backend root. A generated URL looks like `http://localhost:8000/abc123`, not `/api/url/abc123`.

### Create a short URL

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

### Redirect

```http
GET /:shortCode
```

A valid short code redirects to its original destination and increments the click counter. Disabled URLs return an appropriate error instead of redirecting.

## 🗃️ Data Models

### User

- `username`
- `email`
- `passwordHash`
- `role` (`user` or `admin`)
- `createdAt`
- `updatedAt`

Passwords are stored as bcrypt hashes.

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

MongoDB's TTL index automatically removes expired sessions.

## 🛡️ Security

The backend applies multiple layers of protection:

- Password hashing with `bcryptjs`.
- Short-lived access tokens.
- HTTP-only refresh-token cookies.
- Hashed refresh tokens in persistent sessions.
- Authentication and role-based authorization middleware.
- Zod request validation.
- Authentication and refresh rate limiting.
- Helmet security headers.
- MongoDB request sanitization.
- Configurable CORS with credentials.
- 16 KB request-body limits.
- Centralized error handling.
- Structured application logging.

## 🧪 Testing

The backend uses **Jest** with **Supertest** for API integration testing.

Run the complete test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run test:coverage
```

Tests use a dedicated test environment and should not point at a production database.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with `tsx watch` |
| `npm run build` | Build the TypeScript application with `tsup` |
| `npm start` | Start the compiled production application |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage reporting |

## 🌍 CORS Configuration

Configure frontend origins with a comma-separated `CORS_ORIGIN` value:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

Credentials are enabled so the browser can send the HTTP-only refresh-token cookie.

## 🔄 Request Flow

```text
React Frontend
      │
      │ HTTP + Bearer access token
      ▼
Express API
      │
      ├── Middleware
      │   ├── CORS
      │   ├── Helmet
      │   ├── Rate limiting
      │   ├── Authentication
      │   └── Validation
      │
      ├── Controllers
      │
      ├── Services
      │
      ▼
   MongoDB
      │
      └── Users / URLs / Sessions
```

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run the build and test suite:

```bash
npm run build
npm test
```

5. Commit your changes:

```bash
git commit -m "feat: your change"
```

6. Push the branch and open a pull request.

## 📄 License

No license file is currently defined for this project. Add a `LICENSE` file if you intend to distribute it under an open-source license.

---

Built with **TypeScript, Express, MongoDB, and Mongoose**.