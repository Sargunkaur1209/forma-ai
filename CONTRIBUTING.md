# Contributing to Forma AI

Thanks for helping improve Forma AI! This project is built by a small team, so clear and focused contributions make collaboration easier.

## Getting started

1. Clone the repository and create a feature or fix branch from `main`.
2. For frontend work, go to `client/`, install dependencies with `npm install`, and start the development server with `npm run dev`.
3. Check `README.md` and the relevant files in `docs/` before changing project behavior or API contracts.

## Branches and commits

Keep `main` stable and submit changes through a pull request rather than pushing directly to it. Use these branch prefixes:

- `feat/` for a new feature
- `fix/` for a bug fix
- `docs/` for documentation changes

Write commit messages in the Conventional Commits format, using a short imperative description. For example:

```text
docs: explain local development setup
```

## Before opening a pull request

- Run the relevant checks from the `client/` directory. Available scripts include `npm run lint`, `npm run format:check`, and `npm run build`.
- Update related documentation when behavior, setup, or API contracts change.
- Keep the pull request focused, and describe what changed and how you verified it.
- Never commit `.env` files, credentials, or other secrets. Use the appropriate `.env.example` file for documenting required environment variables.