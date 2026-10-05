# Forma AI — Backend Implementation Plan

> Backend ownership: Node.js + Express + MongoDB/Mongoose + LangChain/OpenAI  
> Repository: `Sargunkaur1209/forma-ai`

## 1. Backend Goal

Forma AI takes a user's natural-language insurance claim story and turns it into structured form data.

The backend should:

1. Accept a claim story from the React client.
2. Load the insurance form schema/questions.
3. Use LangChain + OpenAI to extract values from the story.
4. Return structured, schema-aligned data.
5. Identify fields that are still missing or uncertain.
6. Persist claim/session data in MongoDB.
7. Validate all AI output before returning it to the client.
8. Provide predictable errors and health/status endpoints.

The repository README defines Node.js, Express, Mongoose, MongoDB, LangChain, and OpenAI as the backend stack. The frontend exposes `VITE_API_URL` for the API base URL.

## 2. Recommended Backend Structure

```text
server/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── claim.controller.js
│   │   ├── schema.controller.js
│   │   └── health.controller.js
│   ├── models/
│   │   ├── Claim.js
│   │   └── FormSchema.js
│   ├── routes/
│   │   ├── claim.routes.js
│   │   ├── schema.routes.js
│   │   └── health.routes.js
│   ├── services/
│   │   ├── extraction.service.js
│   │   ├── claim.service.js
│   │   └── schema.service.js
│   ├── ai/
│   │   ├── model.js
│   │   ├── prompts.js
│   │   └── outputSchema.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── utils/
│   │   └── logger.js
│   └── app.js
├── scripts/
│   └── seedSchema.js
├── tests/
│   ├── extraction.test.js
│   ├── claim.test.js
│   └── health.test.js
├── .env.example
├── package.json
└── README.md
```

Keep controllers thin. Business logic belongs in services; AI-specific logic belongs in `ai/` and `services/extraction.service.js`.

## 3. API Contract

Base URL:

```text
http://localhost:5000/api
```

### Health

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "status": "ok"
}
```

### Get Form Schema

```http
GET /api/schema
```

Response:

```json
{
  "success": true,
  "schema": {
    "id": "auto_claim_v1",
    "version": 1,
    "fields": []
  }
}
```

The schema should be the source of truth for the fields the AI is allowed to extract.

### Extract Claim Information

```http
POST /api/claims/extract
Content-Type: application/json
```

Request:

```json
{
  "story": "Yesterday my car was damaged when another vehicle hit me at a red light. The accident happened in Ranchi around 5 PM."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "claim": {
      "incidentType": "vehicle_accident",
      "incidentDate": null,
      "incidentTime": "17:00",
      "location": "Ranchi",
      "description": "Another vehicle hit the claimant's car at a red light."
    },
    "missingFields": [
      "incidentDate",
      "otherPartyDetails"
    ],
    "confidence": {
      "incidentType": 0.98,
      "incidentTime": 0.91,
      "location": 0.88
    }
  }
}
```

**Important:** Never let the model invent missing information. If the story does not contain a value, return `null` and treat the field as missing.

## 4. Recommended Form Schema

Store the form definition separately from claim data.

```json
{
  "id": "auto_claim_v1",
  "version": 1,
  "name": "Auto Insurance Claim",
  "fields": [
    {
      "key": "incidentDate",
      "label": "Date of incident",
      "type": "date",
      "required": true,
      "extractable": true
    },
    {
      "key": "incidentTime",
      "label": "Time of incident",
      "type": "time",
      "required": false,
      "extractable": true
    },
    {
      "key": "location",
      "label": "Location",
      "type": "text",
      "required": true,
      "extractable": true
    },
    {
      "key": "description",
      "label": "What happened?",
      "type": "textarea",
      "required": true,
      "extractable": true
    }
  ]
}
```

This makes the AI dynamic instead of hard-coding every field into the prompt.

## 5. MongoDB Models

### Claim

Suggested shape:

```js
{
  sessionId: String,
  story: String,
  extractedData: {
    type: Map,
    of: Schema.Types.Mixed
  },
  missingFields: [String],
  confidence: {
    type: Map,
    of: Number
  },
  status: {
    type: String,
    enum: ["draft", "extracted", "completed"],
    default: "draft"
  },
  schemaVersion: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### FormSchema

Suggested shape:

```js
{
  schemaId: String,
  version: Number,
  name: String,
  fields: [
    {
      key: String,
      label: String,
      type: String,
      required: Boolean,
      extractable: Boolean,
      options: [String]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

Create a unique index on `schemaId + version` so the same schema version cannot be seeded twice.

## 6. AI Extraction Flow

```text
React Client
     |
     | POST /api/claims/extract
     v
Express Route
     |
     v
Controller
     |
     v
Extraction Service
     |
     +---- Load active FormSchema
     +---- Build structured prompt
     +---- Call LangChain/OpenAI
     +---- Validate model output
     +---- Calculate missing fields
     |
     v
MongoDB
     |
     v
JSON Response
     |
     v
React Form
```

The model should not decide the application's schema. The application provides the schema, and the model fills values into that schema.

## 7. Prompt Design

Use a structured prompt rather than a generic extraction instruction.

Recommended rules:

```text
You are an insurance claim information extraction system.

Your task is to extract ONLY information explicitly supported by
 the user's story.

Rules:
1. Never invent or guess a value.
2. Use null when a value is not present.
3. Follow the supplied form schema exactly.
4. Return valid structured JSON.
5. Preserve dates and times in the requested format.
6. If the story contains conflicting information, flag the field.
7. Do not answer questions that are not part of the schema.
8. Do not make legal, medical, or insurance coverage decisions.
```

Then provide the form schema and user story as separate inputs.

## 8. Structured AI Output

Use structured output / JSON schema validation whenever supported by the selected LangChain/OpenAI integration.

Recommended internal representation:

```json
{
  "fields": {
    "incidentDate": {
      "value": null,
      "confidence": 0
    },
    "incidentTime": {
      "value": "17:00",
      "confidence": 0.91
    }
  },
  "conflicts": [],
  "unsupportedClaims": []
}
```

The server must validate this output before returning it to the frontend. Never trust raw LLM JSON.

## 9. Missing Question Logic

After extraction:

```text
schema fields + extracted values
            |
            v
required fields without values
            |
            v
missingFields
```

Example:

```json
{
  "missingFields": [
    "incidentDate",
    "vehicleRegistrationNumber"
  ]
}
```

The frontend can then ask only for these fields. The backend should not return every form question again.

## 10. Validation

Validate the request:

- `story` exists
- `story` is a string
- `story` is not empty
- `story` has a reasonable maximum length

Validate AI output:

- field keys exist in schema
- field types match schema
- dates are valid
- select values exist in allowed options
- confidence is between 0 and 1
- unknown fields are rejected

## 11. Error Response Standard

All API errors should use one format:

```json
{
  "success": false,
  "error": {
    "code": "AI_EXTRACTION_FAILED",
    "message": "Unable to extract claim information."
  }
}
```

Suggested error codes:

```text
INVALID_REQUEST
INVALID_STORY
SCHEMA_NOT_FOUND
AI_EXTRACTION_FAILED
AI_INVALID_OUTPUT
DATABASE_ERROR
INTERNAL_SERVER_ERROR
```

Do not expose OpenAI API keys, stack traces, prompts, or internal database errors to the client.

## 12. Environment Variables

Create `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/forma-ai

OPENAI_API_KEY=
OPENAI_MODEL=

CLIENT_URL=http://localhost:5173
```

Never commit `.env`; commit only `.env.example`.

## 13. CORS

The frontend is a Vite development server and the backend is planned for port `5000`.

Allow the configured frontend origin:

```js
cors({
  origin: process.env.CLIENT_URL,
  credentials: true
})
```

Do not use `origin: "*"` in production.

## 14. Routes

Recommended route registration:

```js
app.use("/api/health", healthRoutes);
app.use("/api/schema", schemaRoutes);
app.use("/api/claims", claimRoutes);
```

Final endpoints:

```text
GET  /api/health
GET  /api/schema
POST /api/claims/extract
POST /api/claims
GET  /api/claims/:id
PATCH /api/claims/:id
```

For the first milestone, implement only:

```text
GET  /api/health
GET  /api/schema
POST /api/claims/extract
```

Then add persistence endpoints after extraction works end-to-end.

## 15. Security Requirements

Because this handles insurance claim information:

- Never log the full user story in production logs.
- Never log API keys.
- Never return internal errors directly to users.
- Validate request body size.
- Validate all AI-generated fields.
- Use environment variables for secrets.
- Add rate limiting to AI endpoints.
- Add request IDs for debugging.
- Use HTTPS in production.
- Avoid storing unnecessary personal information.
- Add authentication before exposing private claim records.
- Treat all LLM output as untrusted input.

## 16. Testing Plan

### Unit tests

Test:

```text
schema validation
missing field calculation
AI response normalization
date normalization
confidence validation
error mapping
```

### API tests

Test:

```text
GET /api/health
GET /api/schema
POST /api/claims/extract
```

Cases:

1. Valid story.
2. Empty story.
3. Missing story.
4. Very long story.
5. Story with no extractable information.
6. Story with partial information.
7. Story containing conflicting information.
8. Invalid AI response.
9. MongoDB unavailable.
10. OpenAI unavailable.

## 17. Backend Implementation Order

### Phase 1 — Server setup

- [ ] Initialize `server/package.json`
- [ ] Install Express
- [ ] Install Mongoose
- [ ] Install dotenv
- [ ] Install cors
- [ ] Add environment configuration
- [ ] Create Express app
- [ ] Add `/api/health`
- [ ] Connect MongoDB

### Phase 2 — Schema

- [ ] Create `FormSchema` model
- [ ] Create schema seed script
- [ ] Add `GET /api/schema`
- [ ] Add schema validation

### Phase 3 — AI extraction

- [ ] Configure LangChain/OpenAI
- [ ] Create extraction prompt
- [ ] Create structured output schema
- [ ] Implement extraction service
- [ ] Validate AI output
- [ ] Calculate missing fields
- [ ] Add `POST /api/claims/extract`

### Phase 4 — Persistence

- [ ] Create `Claim` model
- [ ] Save extraction sessions
- [ ] Add claim retrieval
- [ ] Add claim update
- [ ] Store schema version with every claim

### Phase 5 — Frontend integration

- [ ] Confirm `VITE_API_URL`
- [ ] Connect extraction request
- [ ] Return prefilled values
- [ ] Return missing fields
- [ ] Handle loading state
- [ ] Handle API errors

### Phase 6 — Quality

- [ ] Unit tests
- [ ] API tests
- [ ] Error handling
- [ ] Rate limiting
- [ ] Logging
- [ ] Security review
- [ ] Production environment configuration

## 18. Definition of Done — Backend MVP

The backend MVP is complete when:

- [ ] `npm install` works inside `server/`
- [ ] MongoDB connection works
- [ ] `GET /api/health` returns `200`
- [ ] `GET /api/schema` returns the active form schema
- [ ] `POST /api/claims/extract` accepts a natural-language story
- [ ] LangChain/OpenAI extracts structured fields
- [ ] AI output is validated
- [ ] Missing fields are calculated
- [ ] The server never invents missing values
- [ ] Extraction results can be saved to MongoDB
- [ ] Errors use the standard response format
- [ ] Secrets are stored only in environment variables
- [ ] Core extraction logic has tests
- [ ] Frontend can consume the API using `VITE_API_URL`

## 19. Suggested First Commit

Start with a small, reviewable backend commit:

```text
feat: scaffold express backend and schema endpoint
```

Include:

```text
server/
├── src/
│   ├── app.js
│   ├── config/db.js
│   ├── controllers/health.controller.js
│   ├── controllers/schema.controller.js
│   ├── routes/health.routes.js
│   ├── routes/schema.routes.js
│   └── models/FormSchema.js
├── scripts/seedSchema.js
├── .env.example
├── package.json
└── README.md
```

Then the next commit can be:

```text
feat: add claim story extraction with langchain
```

This keeps the PR easy for the frontend teammate to review.

## 20. Backend Ownership Summary

```text
             ┌──────────────────────────┐
             │       React Client       │
             └────────────┬─────────────┘
                          │
                   claim story
                          │
                          ▼
             ┌──────────────────────────┐
             │       Express API        │
             └────────────┬─────────────┘
                          │
                          ▼
             ┌──────────────────────────┐
             │   Extraction Service     │
             │                          │
             │ LangChain + OpenAI       │
             └────────────┬─────────────┘
                          │
                 structured data
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌──────────────┐       ┌──────────────┐
       │ Form Schema  │       │   MongoDB    │
       │   + rules    │       │    Claims    │
       └──────────────┘       └──────────────┘
```

> **The LLM extracts information; the backend owns the schema, validation, persistence, and business rules.**
