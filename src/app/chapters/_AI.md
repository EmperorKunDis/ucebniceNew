# src/app/chapters/ - AI Context

## PURPOSE

Permanent compatibility redirects from the retired chapter frontend to the canonical v2 learning UI.

## ROUTES

| Legacy route            | Permanent destination |
| ----------------------- | --------------------- |
| `/chapters`             | `/dashboard`          |
| `/chapters/[chapterId]` | `/learn/[chapterId]`  |

The dynamic redirect preserves and URL-encodes the public chapter slug. It does not query the database or validate whether the slug exists; canonical v2 routes own validation.

## RULES

1. Do not add UI, progress reads or content rendering under this segment.
2. Do not link to these URLs inside the application. They exist only for old bookmarks and external links.
3. Redirects use `permanentRedirect`, which produces HTTP 308 and preserves the request method.
4. Chapter content, resources, exercises and projects live under `/learn/*`.

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: page.tsx, [chapterId]/page.tsx -->
