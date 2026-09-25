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
