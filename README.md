# Forma AI

An insurance claim form that fills itself from a typed story — and only asks the questions that still matter.

---

## Team

| Name | Role |
|------|------|
| Sargun Kaur | Frontend (React, Tailwind, React Hook Form, Zustand) |
| Chandrakant | Backend & AI (Node.js, Express, MongoDB, LangChain) |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Hook Form, Zustand |
| Backend | Node.js, Express, Mongoose, MongoDB |
| AI | LangChain, OpenAI |
| Tooling | ESLint, Prettier, Vitest |

---

## Project Structure

```
forma-ai/
├── client/          # React frontend (Sargun)
│   ├── src/
│   │   ├── components/fields/   # Form field components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state
│   │   └── services/            # API call helpers
│   └── .env.example
├── server/          # Express backend (Chandrakant)
│   └── .gitkeep
├── docs/            # Schema contract, API notes, screenshots, final report
│   └── .gitkeep
└── README.md
```

---

## Getting Started

### Client

```bash
cd client
npm install
npm run dev
```

### Server

> Coming soon — Chandrakant is setting this up on Day 1.

---

## Environment Variables

Each folder has a `.env.example` listing the variables it needs. Copy it to `.env` and fill in real values — never commit `.env`.

| File | Variable | Description |
|------|----------|-------------|
| `client/.env.example` | `VITE_API_URL` | Base URL of the Express API |

---

## Scripts

Run these from inside the relevant folder (`cd client` first):

| Script | Command | What it does |
|--------|---------|--------------|
| Dev server | `npm run dev` | Starts Vite dev server with HMR |
| Production build | `npm run build` | Bundles for production into `dist/` |
| Lint | `npm run lint` | ESLint check across `src/` |
| Format | `npm run format` | Prettier write (fixes in place) |
| Format check | `npm run format:check` | Prettier check (CI-safe, no writes) |

---

## Branching & Commit Conventions

- `main` is the stable branch. Direct pushes are not allowed — everything goes through a PR reviewed by the other person.
- Feature branches follow the pattern: `feat/<name>-<short-description>` (e.g. `feat/sargun-renderer`, `feat/chandrakant-extraction`).
- Fix branches: `fix/<name>-<short-description>`

**Commit message format** (Conventional Commits):

```
<type>: <short imperative description>
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`

Examples:
```
feat: scaffold client with Vite and React
fix: correct field mapping for claim date
chore: configure ESLint and Prettier
docs: add API contract for /extract endpoint
test: add unit tests for date extraction service
```

---

## Roadmap

25-day build — Monday 21 Sep 2026 → Thursday 15 Oct 2026.

| Day | Focus |
|-----|-------|
| 1 | Repo setup, client scaffold (Vite, React, Tailwind, ESLint, Prettier) |
| 2 | JSON schema design, form renderer, Zustand store |
| 3–5 | Field components (text, date, select, radio, checkbox) |
| 6–8 | LangChain extraction endpoint, schema seeding |
| 9–12 | Connecting frontend to backend, prefill flow |
| 13–17 | Smart question filtering, validation, progress UI |
| 18–21 | Polish, accessibility, error handling |
| 22–24 | Testing, bug fixing, demo prep |
| 25 | Final report, demo day |

---

*Built for the 25-day project sprint, Sep–Oct 2026.*
