# Forma AI schema contract v1

The backend stores and validates schemas. The frontend renders them. The AI prompt is generated from them.
The schema is the source of truth for which fields exist, which values are valid, and when a field is visible.

## Form

| Property | Type | Notes |
|---|---|---|
| formId | string | e.g. `auto_claim_v1`. Unique together with `version` |
| title | string | Shown at the top of the form |
| version | number | Starts at 1. `GET /api/forms/:formId` returns the highest version |
| sections | array | Each has `id`, `title`, `fields` |

## Field

| Property | Required | Notes |
|---|---|---|
| key | yes | Name the AI must return. Letters, digits, `_` only. Starts with a letter. **Unique across the whole form.** No dots, so form values stay flat |
| type | yes | `text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox` |
| label | yes | Text shown to the user |
| required | no | Default `false` |
| options | select and radio only | `[{ "value": "deer", "label": "Deer" }]`. Values are snake_case strings |
| validation | no | `{ pattern, min, max, message }` |
| showIf | no | Visibility rule. No `showIf` means always visible |

## Value types (client, server and AI must agree)

| type | value |
|---|---|
| text, textarea | string |
| number | number |
| date | string `YYYY-MM-DD` |
| select, radio | one option `value` string |
| checkbox | boolean |

## Validation

- `pattern`: regex string, for text and textarea
- `min`, `max`: for number
- `message`: error text shown when the rule fails

## showIf

```json
{ "all": [ { "field": "incidentType", "op": "eq", "value": "animal_collision" } ] }
```

- Use exactly one of `all` (AND) or `any` (OR).
- The array holds conditions only: `{ field, op, value }`. Nested groups are not part of v1.
- `field` must be another field's `key` in the same form.
- Operators: `eq`, `neq`, `in` (value is an array), `gt`, `lt` (numbers only).
- An unanswered field (`undefined`, `null` or `""`) makes `eq`, `in`, `gt` and `lt` false, and `neq` true.
- Three levels come from chaining: B is shown by A, and C is shown by B.
- A hidden field's value must be dropped. The client unregisters it, and the server strips it on submit.