# src/data/ - AI Context

## 🎯 PURPOSE
Static data definitions for chapters, questions, module tests, and skill graphs. This is the content configuration layer.

## 📦 EXPORTS

| File | Export | Description |
|------|--------|-------------|
| `chapters.ts` | `chapters: Chapter[]` | 40 chapter definitions |
| `questions.ts` | `questions: Record<string, Question[]>` | Quiz questions per chapter |
| `module-tests.ts` | `moduleTests: ModuleTest[]` | Tests after every 10 chapters |
| `skills-graph.ts` | `skillsGraph: SkillNode[]` | D3 skill tree data |

## 🔗 DEPENDENCIES
- TypeScript interfaces only
- No runtime dependencies

## 🏗️ PATTERNS

### Chapter Definition
```typescript
interface Chapter {
  id: string           // '01', '02', etc.
  number: number       // 1, 2, etc.
  title: string        // Chapter title
  description: string  // Short description
  hours: string        // Lesson hours reference
  textFile: string     // Markdown filename
  lectureFile: string  // Lecture markdown
  videoFile?: string   // Video filename (optional)
  notebookLMUrl?: string // NotebookLM link
  colabNotebook?: string // Colab notebook filename
}
```

### Question Definition
```typescript
interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number // Index of correct option
  explanation?: string
}
```

### Module Test (Every 10 Chapters)
```typescript
interface ModuleTest {
  moduleNumber: number  // 1, 2, 3, 4
  title: string
  chapters: string[]    // Chapter IDs covered
  questions: Question[]
}
```

## ⚠️ GOTCHAS

1. **40 chapters total**: Organized into 4 modules of 10 chapters each
2. **Video files**: Not all chapters have videos (check `videoFile`)
3. **NotebookLM**: External Google service links
4. **Colab notebooks**: Stored in separate GitHub repo (see GITHUB_CONFIG in constants.ts)
5. **Questions are hardcoded**: Also exist in database (Question model) - keep in sync
6. **File paths**: Video files are in `data/videa/`, lectures in `public/prednasky/`

## 📁 STRUCTURE
```
data/
├── chapters.ts      # Chapter definitions (CRITICAL)
├── questions.ts     # Quiz questions per chapter
├── module-tests.ts  # Module test definitions
└── skills-graph.ts  # Skill visualization data
```

## 🔄 RELATED
- `prisma/schema.prisma` - Chapter and Question models (database mirror)
- `src/app/chapters/` - Pages using this data
- `public/prednasky/` - Markdown lecture files
- `data/videa/` - Video files (PVC in production)

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: chapters.ts -->
