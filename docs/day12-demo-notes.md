# Day 12 Frontend Demo Notes

## Verified local fallback path

The client was tested with `VITE_API_URL=http://127.0.0.1:65534`, where no API
server was listening. The browser logged `Falling back to the local mock schema:
Failed to fetch`, then rendered the form from
`client/src/mocks/autoClaimSchema.json`.

1. Load the form fresh. `Type of incident` and `Vehicle VIN` are visible; the
   conditional animal fields are not.
2. Set `Type of incident` to **Hit an animal**. **Which animal?** appears.
3. Set **Which animal?** to **Deer**. **Describe the animal** stays hidden.
4. Set **Which animal?** to **Other**. **Describe the animal** appears.
5. Change **Type of incident** to **Collision with a vehicle**. Both
   **Which animal?** and **Describe the animal** disappear.

The conditionals come from each field's `showIf` in the loaded schema and are
evaluated by the shared frontend evaluator; the renderer does not special-case
these field names. The local mock's third-level branch is
`incidentType -> animalType -> animalOther`.

If the API is slow or down, the schema fetch falls back automatically and this
same three-level mock behavior remains available. Restart Vite after changing
`VITE_API_URL`; it is read when the client starts.

## Extraction note

Submitting the deer/I-95 story currently uses the fixed local mock in
`client/src/services/extractService.js`, not `POST /api/extract`. In the
verified run it selected **Hit an animal** and **Deer**, left **Vehicle VIN**
empty, and revealed **Which animal?** in the rendered form. This extraction
mock works regardless of `VITE_API_URL`; the unreachable-API fallback above
applies to schema fetching. Do not describe MagicInput as calling the live
extraction endpoint until the client service is wired to it.

For the server-backed schema audit and its distinct deer-alert branch, use
**Part 1** and **Part 2** of `docs/mid-review-script.md`. The browser run above
verifies the local mock fallback, not the live server schema.
