# URL Shortener Backend

A RESTful URL shortening backend built with **Node.js, Express 5, TypeScript, and MongoDB**. The API provides user authentication, JWT-based access and refresh tokens, session persistence, and authenticated URL management with short-code redirects.

## ✨ Features

- 🔐 **User authentication** — register and log in with email/password.
- 🎟️ **JWT authentication** — short-lived access tokens and refresh tokens stored in an HTTP-only cookie.
- 🔄 **Refresh token flow** — refresh access tokens without requiring the user to log in again.
- 🧾 **Session management** — refresh tokens are stored as hashed session records with IP, user-agent, last-used, revocation, and expiration metadata.
- 🔗 **URL shortening** — authenticated users can create short URLs for valid HTTP/HTTPS destinations.
- 🚀 **Short URL redirects** — resolve a short code and redirect directly to the original URL.
- 📊 **Click tracking** — each URL keeps a click counter.
- ⛔ **URL disabling** — temporarily disable a short URL without deleting it.
- 🗑️ **URL deletion** — users can delete their own shortened URLs.
- 👤 **User endpoints** — retrieve the current user's profile and admin-only user listings.
- 🛡️ **Role-based authorization** — supports `user` and `admin` roles.
- ✅ **Request validation** — Zod validates authentication and URL payloads.
- 🍪 **Secure cookie handling** — refresh tokens use HTTP-only cookies with production-aware security settings.
- 📝 **Structured error handling & logging** — centralized error handling with Winston request logging.
- 🌐 **CORS support** — configurable origins with credentials enabled.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API framework |
| **TypeScript** | Type-safe application development |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Access and refresh token authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation |
| **Winston** | Application logging |
| **cookie-parser** | HTTP cookie parsing |
| **CORS** | Cross-origin request handling |
| **tsx** | TypeScript development runner |
| **tsup** | Production bundling |

## 📁 Project Structure

```text
url_shortener_backend/
├── src/
│   ├── controllers/       # HTTP request/response handlers
│   ├── db/                # MongoDB connection
│   ├── middlewares/       # Authentication, authorization, and error handling
│   ├── models/             # Mongoose models
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   ├── utils/              # JWT, cookies, logging, API helpers, etc.
│   ├── validators/         # Zod validation schemas
│   ├── app.ts              # Express application configuration
│   └── index.ts             # Application entry point
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** 20+ recommended
- **npm**
- **MongoDB** (local instance or MongoDB Atlas)

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

> **Security:** Never commit real secrets or production credentials to Git. Use strong, randomly generated values for the JWT secrets.

The application connects to MongoDB using `MONGO_URI/DB_NAME` and defaults to port `8000` when `PORT` is not provided.

### 4. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:8000
```

### 5. Build for production

```bash
npm run build
```

The compiled application is generated in `dist/`.

Start the production build with:

```bash
npm start
```

## 🔐 Authentication Flow

The backend uses a two-token authentication model:

1. **Register** with username, email, password, and password confirmation.
2. **Login** with email and password.
3. The API returns an **access token** in the JSON response.
4. The **refresh token** is stored in an HTTP-only cookie named `refreshToken`.
5. Authenticated API requests send the access token as:

```http
Authorization: Bearer <access-token>
```

6. When the access token expires, call `/api/auth/refresh-token` to obtain a new access token.
7. Logout invalidates the refresh-token session and clears the refresh-token cookie.

Access tokens are configured to expire after **15 minutes**, while refresh-token cookies are configured for **7 days**.

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
| `POST` | `/api/auth/logout` | Refresh cookie | Log out and revoke the refresh-token session |

#### Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "bilal",
  "email": "bilal@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "bilal@example.com",
  "password": "password123"
}
```

The response contains the authenticated user and access token. The refresh token is set as an HTTP-only cookie.

### User

All user routes below require a valid access token.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user/me` | User | Get the authenticated user's profile |
| `GET` | `/api/user/all-user` | Admin | Get all users |

Example authorization header:

```http
Authorization: Bearer <access-token>
```

### URLs

All URL-management routes except the redirect require a valid access token.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/url/create-url` | User | Create a short URL |
| `GET` | `/api/url/me` | User | Get URLs belonging to the authenticated user |
| `PATCH` | `/api/url/:id/disable` | User | Disable a user's URL |
| `DELETE` | `/api/url/:id` | User | Delete a user's URL |
| `GET` | `/api/url/:shortCode` | No | Redirect to the original URL |

#### Create a short URL

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

The URL must be a valid HTTP or HTTPS URL.

#### Redirect

```http
GET /api/url/:shortCode
```

A valid short code redirects the requester to its original URL and increments the URL's click count.

## 🗃️ Data Models

### User

Users contain:

- `username`
- `email`
- `passwordHash`
- `role` (`user` or `admin`)
- `createdAt`
- `updatedAt`

Passwords are stored as hashes rather than plain text.

### URL

Each shortened URL contains:

- `originalUrl`
- `shortCode`
- `userId`
- `clickCount`
- `isActive`
- `createdAt`
- `updatedAt`

Short codes and user references are indexed for efficient lookups.

### Session

Sessions contain:

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

Expired sessions are automatically removed by MongoDB's TTL index on `expiresAt`.

## 🛡️ Security

The backend includes several security-oriented practices:

- Password hashing with `bcryptjs`.
- Short-lived access tokens to limit the impact of token exposure.
- Refresh tokens stored in HTTP-only cookies.
- Refresh-token hashes stored in the database rather than raw refresh tokens.
- Authentication middleware for protected routes.
- Role-based authorization for admin-only operations.
- Zod validation for incoming authentication and URL payloads.
- HTTP/HTTPS validation for destination URLs.
- Configurable CORS origins.
- Request-body size limits of 16 KB.
- Centralized error handling.

## 🧪 Testing

A test script has not been configured yet. The current `package.json` contains a placeholder test command:

```bash
npm test
```

Testing can be added with a framework such as Jest or Vitest and an API testing library such as Supertest.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with `tsx watch` |
| `npm run build` | Build the TypeScript application with `tsup` |
| `npm start` | Start the compiled application from `dist/` |
| `npm test` | Placeholder test command |

## 🌍 CORS Configuration

By default, the API allows requests from:

```text
http://localhost:5173
```

To configure one or more origins, set `CORS_ORIGIN` as a comma-separated list:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

Credentials are enabled so the refresh-token cookie can be sent by the frontend.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run the build to verify TypeScript compilation:

```bash
npm run build
```

5. Commit your changes:

```bash
git commit -m "feat: your change"
```

6. Push the branch and open a pull request.

## 📄 License

No license file is currently defined for this backend repository. Add a `LICENSE` file if you intend to distribute the project under an open-source license.

---

Built with **TypeScript, Express, MongoDB, and Mongoose**.
