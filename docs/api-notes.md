# Forma AI — API notes

Base URL (local): `http://localhost:5000`

All responses are JSON. All routes are under `/api` except `/health`.

## GET /health

Returns server and database status.

```json
{ "status": "ok", "db": "connected" }
```

## GET /api/forms/:formId

Returns the highest version of a form schema.

**Params**
- `formId` — letters, digits, `_` or `-`, 1–64 chars.

**Responses**
- `200` — the form: `{ formId, title, version, sections }`
- `400` — `{ "error": "Invalid formId" }`
- `404` — `{ "error": "Form \"<id>\" not found" }`

## POST /api/forms

Creates a new version of a form schema. The server assigns the version
number automatically (latest + 1 for that `formId`), so a client can
never overwrite an existing version.

**Body**
```json
{ "formId": "auto_claim_v1", "title": "Auto insurance claim", "sections": [...] }
```

**Responses**
- `201` — the created form: `{ formId, title, version, sections }`
- `400` — `{ "error": "Invalid or missing formId" }` or `{ "error": "Missing title" }`
- `400` — `{ "error": "Invalid schema", "details": ["..."] }` — cross-field validation
  failures from `validateFormSchema.js` (duplicate keys, missing options, bad
  `showIf` references, dependency loops, etc.)

**No auth yet.** This route is open during local development. It will need an
admin key before deployment (see Day 21, security).

## showIf evaluation

Two independent, contract-matching implementations exist:
- Client: `client/src/utils/evaluateShowIf.js`
- Server: `server/services/evaluateShowIf.js`

Both follow `docs/schema-contract.md`:
- `all` = AND, `any` = OR.
- Operators: `eq`, `neq`, `in`, `gt`, `lt`.
- An **unanswered** field (`undefined`, `null`, or `""`) makes `eq`, `in`, `gt`
  and `lt` evaluate to `false`, and `neq` evaluate to `true`.
- `gt`/`lt` compare numerically; non-numeric values are never greater/less than
  anything.

The server also exports `getVisibleFieldKeys(fields, values)`, which returns
the set of field keys currently visible given a flat field list and the
current answers. This will be used at submit time (`POST /api/submissions`,
Day 18) to strip the values of hidden fields before saving.

## Routes still to come

| Route | Purpose | Target day |
|---|---|---|
| `POST /api/extract` | Story → structured answers | Day 10 |
| `POST /api/submissions` | Final submit, re-validated | Day 18 |
| `POST /api/drafts`, `PUT /api/drafts/:id`, `GET /api/drafts/:id` | Save/resume | Day 19 |

## LLM setup (local development)

Default provider is **Ollama** (local, free, no rate limit). To set up:

1. Install Ollama: https://ollama.com/download
2. Pull the model: `ollama pull llama3.1:8b`
3. Ollama runs automatically in the background after install.
4. `server/.env` should have `LLM_PROVIDER=ollama`, `LLM_MODEL=llama3.1:8b`, `OLLAMA_BASE_URL=http://localhost:11434` (already the defaults in `.env.example`).

To use Gemini instead (cloud, needs a free API key, subject to rate limits):

1. Get a key: https://aistudio.google.com/app/apikey
2. In `server/.env`, set `LLM_PROVIDER=google` and `GOOGLE_API_KEY=<your key>`.

## Prompt tuning results (Day 11)

Ran 10 test stories (see `server/ai/runTestStories.js`, `npm run test:stories`) against the extraction pipeline.

| Model | Score | Notes |
|---|---|---|
| `gemini-3.5-flash-lite` (initial prompt) | 4/10 | Missed `damageArea`/`animalType` often; occasionally hallucinated a VIN (always correctly rejected by schema validation) |
| `llama3.1:8b` via Ollama (initial prompt) | 7/10 | No hallucinated VINs; confused `animal_collision` with `collision` |
| `llama3.1:8b` (+ explicit incidentType disambiguation rule) | 8/10 | `animal_collision` vs `collision` fixed |
| `llama3.1:8b` (+ animalType linking rule) | 9/10 | The deer-on-I-95 story (from the project plan) now extracts perfectly |

**Known remaining limitation:** `otherPartyAtFault` (a checkbox field) is sometimes missed when fault is stated indirectly (e.g. "it was clearly their fault" rather than "the other driver was at fault"). Not fixed, since further prompt tuning showed diminishing returns; documented here per the Day 11 "tune the prompt" task.

**Design conclusion:** regardless of extraction accuracy, the schema validator (`validateFormSchema.js`) and per-field check in `extractClaim.js` reliably reject invalid AI output (e.g. a hallucinated VIN), so imperfect extraction never corrupts saved data — it surfaces as a `rejected` or `missing` field for the user to fill in during review (Day 17).
