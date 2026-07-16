# `src/components/chapters/` - AI Context

## Purpose

Shared media and project widgets used by the canonical `/learn/*` flow. The
legacy chapter shell, local question card, module-test modal and chapter hooks
were removed during the v2-only cutover.

## Active components

| Component           | Use                                                                |
| ------------------- | ------------------------------------------------------------------ |
| `VideoPlayer`       | Streams a chapter video through `/api/video/[filename]`.           |
| `ProjectSubmission` | Sends a chapter slug and project URL to the canonical project API. |
| `ChapterCard`       | Reusable chapter presentation for Storybook/secondary views.       |

Lesson content, external links and exercises are rendered by
`src/components/learning/` and routes under `src/app/(main)/learn/`.

## Rules

- Do not recreate a `/chapters` UI; `/chapters/*` permanently redirects to
  `/dashboard` or `/learn/*`.
- Do not evaluate answers in these components. The server owns answer keys and
  returns only the public exercise DTO.
- `ChapterProgress` is the only chapter-level read model. Legacy progress
  tables are Release A rollback projections only.
- Keep partner branding out of the authenticated application shell.

## Related

- `src/app/(main)/learn/_AI.md`
- `src/components/learning/exercise/_AI.md`
- `src/lib/learning-service.ts`
- `src/app/api/projects/submit/route.ts`

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: VideoPlayer.tsx, ProjectSubmission.tsx -->
