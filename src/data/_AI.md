# src/data/ - AI Context

## 🎯 PURPOSE

Versioned import manifests plus static skill-tree data. The database is the runtime content source; this directory and `public/prednasky/` are deterministic inputs for canonical imports.

## 📦 EXPORTS

| File              | Export                     | Description            |
| ----------------- | -------------------------- | ---------------------- |
| `chapters.ts`     | `chapters: Chapter[]`      | 40 chapter definitions |
| `skills-graph.ts` | `skillsGraph: SkillNode[]` | D3 skill tree data     |

## 🔗 DEPENDENCIES

- TypeScript interfaces only
- No runtime dependencies

## 🏗️ PATTERNS

### Chapter Definition

```typescript
interface Chapter {
  id: string // '01', '02', etc.
  number: number // 1, 2, etc.
  title: string // Chapter title
  description: string // Short description
  hours: string // Lesson hours reference
  textFile: string // Markdown filename
  lectureFile: string // Lecture markdown
  videoFile?: string // Video filename (optional)
  notebookLMUrl?: string // NotebookLM link
  colabNotebook?: string // Colab notebook filename
}
```

## ⚠️ GOTCHAS

1. **40 chapters total**: Organized into 4 modules of 10 chapters each
2. **Video files**: Not all chapters have videos (check `videoFile`)
3. **NotebookLM**: External Google service links
4. **Colab notebooks**: Stored in separate GitHub repo (see GITHUB_CONFIG in constants.ts)
5. **Canonical assessments**: The 400 v2 exercises come from `public/prednasky/Otazky_Kapitoly_1-40.md`; answer keys are never bundled into client data.
6. **File paths**: Runtime video files are served from `VIDEO_FILES_DIR` (default `/data/videa`), lectures in `public/prednasky/`
7. **Import invariants**: There must be 40 chapter manifest entries, one full published Markdown lesson and 10 exercises per chapter, plus 38 videos, 38 NotebookLM links, and 40 Colab links (chapters 09 and 10 intentionally have no video/NotebookLM).
8. **Stable IDs**: Canonical imports use `lesson:<chapterId>` and `exercise:<chapterId>:<questionNumber>` source keys and must upsert rather than delete/recreate records.

## 📁 STRUCTURE

```
data/
├── chapters.ts      # Chapter definitions (CRITICAL)
└── skills-graph.ts  # Skill visualization data
```

## 🔄 RELATED

- `src/lib/course-content.ts` - Canonical parser and invariant validation
- `scripts/import-v2-content.ts` - Database upsert boundary
- `prisma/schema.prisma` - Runtime Chapter/MicroLesson/Exercise models
- `src/app/chapters/` - Pages using this data
- `public/prednasky/` - Markdown lecture files
- `VIDEO_FILES_DIR` - Runtime video files mounted by Docker Compose in production

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: chapters.ts -->
