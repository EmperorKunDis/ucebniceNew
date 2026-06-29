# AI Readiness

Ucebnice nepřidává vlastní trénovací pipeline, model registry ani MLOps stack. Produkční cíl je auditovatelná AI asistence pro existující AI Tutor a Gemini project review.

## Review metadata

Project review ukládá:

- model name,
- prompt version,
- latency,
- token count, pokud provider hodnotu vrátí,
- failure reason,
- safety status,
- manual review flag.

Fallback při výpadku provideru nesmí schválit projekt, přidělit XP ani přidělit gems. Odevzdání zůstane uložené a čeká na ruční kontrolu.

## Prompt versioning

Prompt verze je explicitní konstanta v integrační vrstvě. Každá změna hodnoticího promptu musí zvýšit verzi a mít krátký changelog v PR popisu.

## Smoke evals

Minimální scénáře:

- Chybí `GEMINI_API_KEY`: review vrátí `approved: false`, `manualReviewRequired: true`, `score: 0`.
- Gemini vrátí 5xx: review vrátí ruční fallback a `failureReason`.
- Gemini vrátí nevalidní JSON: review vrátí ruční fallback a `failureReason`.
- Gemini schválí projekt: XP a gems se přidělí jen při `approved: true`.
- AI Tutor bez `OPENAI_API_KEY`: endpoint vrátí 503 a nevytvoří úspěšnou odpověď.

Tyto scénáře jsou smoke testy, ne náhrada ruční pedagogické kontroly kvality odpovědí.
