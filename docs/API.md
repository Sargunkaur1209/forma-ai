# Forma AI — API Documentation

## Overview

The Forma AI backend provides APIs for converting natural-language insurance claim stories into structured form data.

### Base URL

Development:

```text
http://localhost:5000/api
```

The frontend should configure the API URL through:

```env
VITE_API_URL=http://localhost:5000
```

---

# API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/schema` | Get the active insurance form schema |
| POST | `/api/claims/extract` | Extract claim information from a user story |
| POST | `/api/claims` | Create and save a claim |
| GET | `/api/claims/:id` | Get a saved claim |
| PATCH | `/api/claims/:id` | Update a claim |

---

# 1. Health Check

## `GET /api/health`

Checks whether the backend server is running.

### Request

```http
GET /api/health
```

### Response

```json
{
  "success": true,
  "status": "ok"
}
```

### Status Codes

| Code | Meaning |
|---|---|
| `200` | Server is running |
| `500` | Internal server error |

---

# 2. Get Form Schema

## `GET /api/schema`

Returns the active insurance claim form schema.

The frontend should use this schema to understand which fields are available and which fields are required.

### Request

```http
GET /api/schema
```

### Response

```json
{
  "success": true,
  "schema": {
    "schemaId": "auto_claim",
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
        "label": "Description",
        "type": "textarea",
        "required": true,
        "extractable": true
      }
    ]
  }
}
```

---

# 3. Extract Claim Information

## `POST /api/claims/extract`

Converts a natural-language claim story into structured claim information.

This endpoint uses the AI extraction service.

### Request

```http
POST /api/claims/extract
Content-Type: application/json
```

### Body

```json
{
  "story": "Yesterday my car was damaged when another vehicle hit me at a red light. The accident happened in Ranchi around 5 PM."
}
```

### Successful Response

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

---

## Extraction Rules

The AI must follow these rules:

1. Never invent information.
2. Never guess missing values.
3. Return `null` when information is unavailable.
4. Only extract fields defined by the form schema.
5. Validate dates and times.
6. Return structured JSON.
7. Flag conflicting information.
8. Keep confidence values between `0` and `1`.

For example, if the user says:

```text
My car was damaged yesterday.
```

The API should **not** invent an exact date if the backend cannot reliably resolve it.

---

# 4. Missing Fields

The extraction endpoint returns fields that still require user input.

Example:

```json
{
  "missingFields": [
    "incidentDate",
    "vehicleRegistrationNumber"
  ]
}
```

The frontend can use this list to determine which questions need to be displayed.

### Important

The backend should calculate missing fields from the schema.

Do not hard-code missing-field logic in the frontend.

---

# 5. Create Claim

## `POST /api/claims`

Creates a new claim record.

### Request

```http
POST /api/claims
Content-Type: application/json
```

### Body

```json
{
  "story": "Another vehicle hit my car at a traffic signal.",
  "extractedData": {
    "incidentType": "vehicle_accident",
    "location": "Ranchi",
    "description": "Another vehicle hit the claimant's car at a traffic signal."
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "claim_123",
    "status": "draft",
    "createdAt": "2026-10-05T12:00:00.000Z"
  }
}
```

---

# 6. Get Claim

## `GET /api/claims/:id`

Returns a previously saved claim.

### Request

```http
GET /api/claims/claim_123
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "claim_123",
    "status": "draft",
    "story": "Another vehicle hit my car at a traffic signal.",
    "extractedData": {
      "incidentType": "vehicle_accident",
      "location": "Ranchi"
    },
    "missingFields": [
      "incidentDate"
    ]
  }
}
```

---

# 7. Update Claim

## `PATCH /api/claims/:id`

Updates information in an existing claim.

### Request

```http
PATCH /api/claims/claim_123
Content-Type: application/json
```

### Body

```json
{
  "extractedData": {
    "incidentDate": "2026-10-04",
    "location": "Ranchi"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "claim_123",
    "status": "completed",
    "missingFields": []
  }
}
```

---

# Error Handling

All API errors should use the same structure.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STORY",
    "message": "A claim story is required."
  }
}
```

## Error Codes

| Code | Description |
|---|---|
| `INVALID_REQUEST` | Invalid request body |
| `INVALID_STORY` | Story is missing or invalid |
| `SCHEMA_NOT_FOUND` | Form schema could not be found |
| `AI_EXTRACTION_FAILED` | AI extraction failed |
| `AI_INVALID_OUTPUT` | AI returned invalid structured data |
| `CLAIM_NOT_FOUND` | Claim does not exist |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_SERVER_ERROR` | Unexpected backend error |

---

# HTTP Status Codes

| Status | Usage |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `400` | Invalid request |
| `404` | Resource not found |
| `422` | Validation failure |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
| `503` | External service unavailable |

---

# Frontend Integration

The frontend should use the configured API URL.

Example:

```js
const API_URL = import.meta.env.VITE_API_URL;
```

Then:

```js
const response = await fetch(`${API_URL}/api/claims/extract`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    story
  })
});

const result = await response.json();
```

The frontend should check:

```js
if (!result.success) {
  // Display API error
}
```

---

# AI Data Flow

```text
User Story
    |
    v
POST /api/claims/extract
    |
    v
Express Controller
    |
    v
Extraction Service
    |
    +---- Load Form Schema
    |
    +---- Build AI Prompt
    |
    +---- LangChain / OpenAI
    |
    +---- Validate AI Output
    |
    +---- Calculate Missing Fields
    |
    v
Structured Claim Data
    |
    v
Frontend
```

---

# API Design Principles

## Schema First

The backend schema is the source of truth.

The AI should populate the schema instead of creating its own fields.

## No Hallucinated Data

If information is not present:

```json
{
  "value": null
}
```

The AI must not guess.

## Backend Validation

All AI-generated data must be validated before being returned to the frontend.

## Consistent Errors

Every endpoint should use the same error structure.

## Versioned Schemas

Claims should store the schema version used during extraction.

Example:

```json
{
  "schemaId": "auto_claim",
  "schemaVersion": 1
}
```

This allows future schema changes without breaking old claims.

---

# Development

Start the backend:

```bash
cd server
npm install
npm run dev
```

Expected server:

```text
http://localhost:5000
```

Test health:

```bash
curl http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "status": "ok"
}
```

---

# API Development Checklist

- [ ] Implement health endpoint
- [ ] Implement schema endpoint
- [ ] Implement claim extraction endpoint
- [ ] Validate request bodies
- [ ] Validate AI output
- [ ] Implement missing-field calculation
- [ ] Implement claim creation
- [ ] Implement claim retrieval
- [ ] Implement claim update
- [ ] Add MongoDB persistence
- [ ] Add API tests
- [ ] Add rate limiting
- [ ] Add production error handling
- [ ] Connect frontend to API

---

# Pull Request

Recommended PR title:

```text
docs: add backend API documentation
```

Recommended PR description:

```text
## Summary

Adds API documentation for the Forma AI backend.

## What's included

- Health check API
- Form schema API
- Claim extraction API
- Claim creation API
- Claim retrieval API
- Claim update API
- Request and response examples
- Error response format
- HTTP status codes
- Frontend integration example
- AI extraction data flow

## Purpose

Provides a shared API contract between the frontend and backend teams.

## Testing

Documentation-only change. No application behavior is changed.
```
