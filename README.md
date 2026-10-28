# Forma AI

An insurance claim form that fills itself from a typed story â€” and only asks the questions that still matter.

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
| AI | LangChain, Google Gemini or Ollama |
| Tooling | ESLint, Prettier, Vitest |

---

## Project Structure

```
forma-ai/
â”œâ”€â”€ client/          # React frontend (Sargun)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/fields/   # Form field components
â”‚   â”‚   â”œâ”€â”€ hooks/               # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ store/               # Zustand state
â”‚   â”‚   â””â”€â”€ services/            # API call helpers
â”‚   â””â”€â”€ .env.example             # Frontend API URL
â”œâ”€â”€ server/          # Express backend (Chandrakant)
â”‚   â”œâ”€â”€ routes/       # API endpoints
â”‚   â”œâ”€â”€ models/       # Mongoose models
â”‚   â”œâ”€â”€ services/     # Validation and form helpers
â”‚   â””â”€â”€ .env.example  # Database, API, and AI configuration
â”œâ”€â”€ docs/            # Schema contract, API notes, screenshots, final report
â””â”€â”€ README.md
```

---

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- Ollama running locally for the default AI provider, or a Google AI API key

### Start the backend

In a terminal from the repository root:

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` if needed, then start the server:

```bash
npm run dev
```

The API listens on `http://localhost:5000`. To load the bundled form schemas into MongoDB, run `npm run seed` from `server/`.

### Start the client

In a second terminal from the repository root:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Vite prints the local client URL when it starts (typically `http://localhost:5173`).

---

## Environment Variables

Each app has a `.env.example`; copy it to `.env` and adjust values for your setup. Never commit `.env` files or API keys.

| File          | Variable(s)                 | Description                                        |
| ------------- | --------------------------- | -------------------------------------------------- |
| `client/.env` | `VITE_API_URL`              | Base URL of the Express API                        |
| `server/.env` | `MONGODB_URI`               | MongoDB connection string                          |
| `server/.env` | `LLM_PROVIDER`, `LLM_MODEL` | AI provider (`ollama` or `google`) and model name  |
| `server/.env` | `OLLAMA_BASE_URL`           | Ollama server URL; used with the `ollama` provider |
| `server/.env` | `GOOGLE_API_KEY`            | Required when using the `google` provider          |
| `server/.env` | `PORT`, `CLIENT_ORIGIN`     | Optional API port and allowed frontend origin      |
| `server/.env` | `ADMIN_API_KEY`             | Optional key for protected admin routes            |

---

## Useful Scripts

Run each command from its app folder:

| App    | Command         | What it does                                |
| ------ | --------------- | ------------------------------------------- |
| Client | `npm run dev`   | Starts Vite with hot module replacement     |
| Client | `npm run build` | Builds the production client into `dist/`   |
| Client | `npm run lint`  | Runs ESLint across `src/`                   |
| Client | `npm test`      | Runs the client test suite                  |
| Server | `npm run dev`   | Starts the API with automatic restarts      |
| Server | `npm start`     | Starts the API                              |
| Server | `npm run seed`  | Loads the bundled form schemas into MongoDB |
| Server | `npm test`      | Runs the backend test suite                 |

---

## Branching & Commit Conventions

- `main` is the stable branch. Direct pushes are not allowed â€” everything goes through a PR reviewed by the other person.
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

25-day build â€” Monday 21 Sep 2026 â†’ Thursday 15 Oct 2026.

| Day   | Focus                                                                 |
| ----- | --------------------------------------------------------------------- |
| 1     | Repo setup, client scaffold (Vite, React, Tailwind, ESLint, Prettier) |
| 2     | JSON schema design, form renderer, Zustand store                      |
| 3â€“5   | Field components (text, date, select, radio, checkbox)                |
| 6â€“8   | LangChain extraction endpoint, schema seeding                         |
| 9â€“12  | Connecting frontend to backend, prefill flow                          |
| 13â€“17 | Smart question filtering, validation, progress UI                     |
| 18â€“21 | Polish, accessibility, error handling                                 |
| 22â€“24 | Testing, bug fixing, demo prep                                        |
| 25    | Final report, demo day                                                |

---

_Built for the 25-day project sprint, Sepâ€“Oct 2026._
