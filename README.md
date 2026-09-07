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
├── LICENSE
├── README.md
├── url_shortener_frontend/
└── url_shortener_backend/
```

See the frontend and backend READMEs for their detailed structures and workflows.

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

### 3. Start the frontend

Open another terminal from the repository root:

```bash
cd url_shortener_frontend
npm install
npm run dev
```

The frontend runs at the Vite development URL, typically `http://localhost:5173`.

## 📡 API Overview

The backend API is available under `/api`, while public short URLs are served from the backend root.

| Area | Example |
| --- | --- |
| Authentication | `POST /api/auth/login` |
| Current user | `GET /api/user/me` |
| Create short URL | `POST /api/url/create-url` |
| User URLs | `GET /api/url/me` |
| Public redirect | `GET /:shortCode` |
| Admin users | `GET /api/admin/users` |
| Admin URLs | `GET /api/admin/urls` |

For complete endpoint documentation, see the backend README.

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

## 🧪 Testing

The backend includes automated API integration tests using **Jest + Supertest**.

```bash
cd url_shortener_backend
npm test
npm run test:watch
npm run test:coverage
```

The frontend can be checked with:

```bash
cd url_shortener_frontend
npm run lint
npm run build
```

## 🛡️ Security

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
2. Create a feature branch.
3. Make your changes.
4. Run the relevant tests, linting, and builds.
5. Commit your changes with a descriptive message.
6. Push your branch and open a pull request.

## 📄 License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for the complete license text.

---

Built with **React, TypeScript, Express, MongoDB, and Mongoose**.
