# URL Shortener — Frontend

A modern, responsive React frontend for the URL Shortener application. It provides a clean interface for creating short URLs, managing authenticated sessions, and interacting with the Express API through a type-safe client-side architecture.

> This directory contains the frontend application. The backend API lives in [`url_shortener_backend`](../url_shortener_backend).

## ✨ Features

- 🔗 Create short URLs from long links
- ⚡ Fast client-side data fetching and caching with TanStack Query
- 🔐 Authentication-aware application flow
- ♻️ Session restoration using the backend authentication API
- 📝 Form handling and validation with React Hook Form + Zod
- 🧭 Client-side routing with React Router
- 🎨 Responsive UI built with Tailwind CSS
- 🧩 Reusable UI components and utility classes
- 🚀 Production builds powered by Vite

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│      React Frontend          │
│                              │
│ React Router                 │
│ React Hook Form + Zod        │
│ TanStack Query               │
│ Tailwind CSS                 │
└──────────────┬───────────────┘
               │ HTTP
               ▼
┌──────────────────────────────┐
│      Express Backend         │
│                              │
│ Authentication               │
│ URL Shortening               │
│ Session Management           │
└──────────────┬───────────────┘
               │
               ▼
          ┌──────────┐
          │ MongoDB  │
          └──────────┘
```

The frontend is intentionally separated from the backend so it can evolve independently while communicating through the backend's HTTP API.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| React 19 | UI library |
| TypeScript | Type-safe application development |
| Vite | Development server and build tooling |
| React Router | Client-side routing |
| TanStack Query | Server state, caching, mutations, and synchronization |
| React Hook Form | Form state management |
| Zod | Runtime validation and form schemas |
| Tailwind CSS | Styling and responsive design |
| shadcn tooling | UI/component workflow |
| Lucide React / Hugeicons | Icons |
| Inter | Application typography |

## 📁 Project Structure

```text
url_shortener_frontend/
├── public/                 # Static assets
├── src/
│   ├── app/                # Application-level setup
│   ├── components/         # Shared UI components
│   ├── features/           # Feature-specific modules
│   │   └── auth/           # Authentication UI, hooks, and services
│   ├── routes/             # Route/page components
│   ├── lib/                # Shared utilities and API/client helpers
│   ├── App.tsx             # Application root
│   └── main.tsx            # Frontend entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> The exact contents of `src/` may grow as new product features are added. The structure above describes the current architectural responsibilities rather than requiring every directory to exist permanently.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- The URL Shortener backend running locally or a deployed API endpoint
- MongoDB available to the backend

### 1. Clone the repository

```bash
git clone https://github.com/iamsyedbilal/url_shortener.git
cd url_shortener/url_shortener_frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend

Start the backend from the sibling directory:

```bash
cd ../url_shortener_backend
npm install
npm run dev
```

Then return to the frontend directory:

```bash
cd ../url_shortener_frontend
```

The frontend expects the backend API to be available according to the API/client configuration in the source code.

### 4. Start the frontend

```bash
npm run dev
```

Vite will start the development server and print the local URL in the terminal.

## 🔐 Authentication & Session Flow

Authentication is handled by the backend API. The frontend keeps the authenticated user state in sync with the API and uses TanStack Query for server-state management.

The general flow is:

```text
User opens application
        │
        ▼
Fetch current user
        │
        ├── Session exists ──► Restore authenticated UI
        │
        └── No session ──────► Show public/auth UI
```

Access-token state is handled by the frontend API/auth layer, while the refresh session is maintained by the backend using an HTTP-only cookie. This allows a browser refresh to restore the user's authenticated state without treating an in-memory access token as the source of truth.

## 🔗 URL Shortening Flow

```text
User enters URL
      │
      ▼
React Hook Form
      │
      ▼
Zod validation
      │
      ▼
Create URL mutation
      │
      ▼
Express API
      │
      ▼
Short URL returned
      │
      ▼
UI displays generated link
```

The URL form accepts normal web addresses and can add `https://` when a protocol is omitted.

## 📡 Backend API

The frontend communicates with the Express backend for application data and authentication.

Main API areas include:

- **Authentication** — signup, signin, verification, refresh, logout, and current-user state
- **Users** — authenticated user information
- **URLs** — create and manage shortened URLs
- **Public redirects** — short URLs resolve through the backend root route

For complete endpoint documentation, see the backend README:

[`url_shortener_backend/README.md`](../url_shortener_backend/README.md)

## 📦 Scripts

Run these commands from `url_shortener_frontend`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## 🧪 Code Quality

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

The production build runs TypeScript compilation before generating the Vite bundle, helping catch type errors before deployment.

## 🌐 Deployment

The frontend is a Vite application and can be deployed to most static hosting platforms.

Typical deployment steps are:

```bash
npm install
npm run build
```

Deploy the generated `dist/` directory using your hosting provider's Vite/static-site configuration.

When deploying separately from the backend, make sure the frontend's API configuration points to the deployed backend and that the backend allows the frontend origin through CORS.

## 🔄 Development Workflow

A typical local workflow is:

1. Start MongoDB.
2. Start the Express backend.
3. Start the Vite frontend.
4. Develop UI/features in `url_shortener_frontend/src`.
5. Run `npm run lint`.
6. Run `npm run build` before committing or deploying.

## 🗺️ Roadmap

Potential frontend improvements include:

- URL analytics and click insights
- Improved URL management/dashboard views
- Copy/share interactions for generated links
- More detailed loading, empty, and error states
- Accessibility refinements
- Expanded automated frontend tests
- Production deployment configuration and environment-specific API settings

## 🤝 Contributing

1. Create a focused branch for your change.
2. Keep frontend and backend responsibilities separated.
3. Follow the existing TypeScript and component patterns.
4. Run linting and a production build before opening a pull request.
5. Keep commits focused and descriptive.

## 📄 License

See the repository root for project-level licensing information.

---

Built with **React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, and Tailwind CSS**.
