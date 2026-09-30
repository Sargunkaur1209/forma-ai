# Day 12 — mid-project review script

Two checks, per the plan: the schema audit (3-level branching served correctly)
and the dynamic rendering check (a Yes answer reveals the next question, from
backend rules alone).

## Before the review

- [ ] `main` is pulled and up to date on both machines
- [ ] MongoDB is running and seeded: `cd server && npm run seed`
- [ ] Backend running: `cd server && npm run dev` (port 5000)
- [ ] Frontend running: `cd client && npm run dev` (port 5173)
- [ ] Ollama running (for the extraction demo, optional): `ollama list`

## Part 1 — schema audit (Chandrakant)

Run:
```powershell
cd server
npm run audit:schema
```

**Expected output:** 7/7 checks pass, including:
- Form exists at version 3
- Schema passes structural validation
- Branching reaches at least 3 levels
- A field has multiple sub-branches (`incidentType -> [animalType, otherPartyAtFault]`)

**Talking point:** the schema, not the frontend, is the source of truth for how
deep the branching goes. `incidentType` splits into two independent paths —
the deer/animal path (`animalType` → `deerAlertActive`) and the collision path
(`otherPartyAtFault` → `otherPartyInsured`) — both reaching depth 3.

## Part 2 — dynamic rendering check (Sargun)

In the running client:
1. Open the auto-claim form.
2. Answer "Type of incident" = **Hit an animal**.
3. **Expected:** "Which animal?" appears.
4. Answer "Which animal?" = **Deer**.
5. **Expected:** the deer-alert question (level 3) appears.
6. Change "Type of incident" back to something else.
7. **Expected:** both dependent questions disappear.

**Talking point:** this visibility logic comes entirely from the `showIf` rules
served by `GET /api/forms/auto_claim_v1`, not from any hard-coded frontend
logic — evaluated by `evaluateShowIf.js`, the same function tested against
21 cases (`server/tests/evaluateShowIf.test.js`) and matching the server's own
evaluator exactly (see `docs/schema-contract.md`).

## Part 3 — extraction demo (optional, if time allows)

POST the deer story to `/api/extract` and show the pre-filled result:

```powershell
$body = @{ formId = 'auto_claim_v1'; story = 'I hit a deer on I-95 yesterday in my Honda and the windshield shattered.' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/extract -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 5
```

**Talking point:** the prompt was tuned against 10 test stories (Day 11), going
from 4/10 to 9/10 accuracy after three targeted fixes. This story specifically
now extracts every field correctly. Details in `docs/api-notes.md`.

## Known items to mention if asked

- Extraction is not perfect on every story (9/10, one checkbox edge case
  remains). The schema validator catches and rejects any invalid AI output
  before it reaches saved data — this is by design, not a gap.
- Two LLM providers are supported (`server/ai/model.js`): Ollama (local, free,
  default) and Gemini (cloud, needs API key). Free-tier Gemini hit rate limits
  during development, which is why Ollama became the default.

## After the review

- [ ] Commit fixes from feedback on each person's branch
- [ ] Tag `v0.1` once fixes are merged (as the plan specifies for Day 12)
