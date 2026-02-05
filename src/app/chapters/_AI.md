# src/app/chapters/ - AI Context

## 🎯 PURPOSE
Chapter listing and detail pages. The core learning experience - users progress through 40 chapters, each with video, content, questions, and optional project submission.

## 📦 EXPORTS
No direct exports. Contains chapter pages.

## 🔗 DEPENDENCIES
- `@/data/chapters` - Chapter definitions
- `@/data/questions` - Quiz questions
- `@/components/chapters/*` - Chapter components
- `@/lib/prisma` - Progress tracking

## 🏗️ PATTERNS

### Chapter List Page
```typescript
// /chapters - Lists all chapters with progress
export default async function ChaptersPage() {
  const session = await getServerSession(authOptions)
  const chapters = await getChaptersWithProgress(session?.user?.id)
  // Render chapter grid
}
```

### Dynamic Chapter Page
```typescript
// /chapters/[chapterId]
export default async function ChapterPage({ 
  params 
}: { 
  params: { chapterId: string } 
}) {
  const chapter = chapters.find(c => c.id === params.chapterId)
  const progress = await getChapterProgress(userId, params.chapterId)
  // Render chapter content
}
```

### 3-Star Completion System
Each chapter can earn up to 3 stars:
1. ⭐ **Star 1**: Complete chapter (watch video/read content)
2. ⭐ **Star 2**: Answer all questions correctly
3. ⭐ **Star 3**: Submit a project

## ⚠️ GOTCHAS

1. **Public access**: Chapter list is public, but progress requires auth
2. **Video streaming**: Videos served from `/api/video/[filename]`
3. **Colab links**: Open in new tab to external Google Colab
4. **Module tests**: Appear after chapters 10, 20, 30, 40
5. **Progress persistence**: Saved in ChapterCompletion table

## 📁 STRUCTURE
```
chapters/
├── layout.tsx           # Chapter section layout
├── page.tsx             # Chapter listing (/chapters)
└── [chapterId]/
    └── page.tsx         # Individual chapter (/chapters/01)
```

## 🔄 RELATED
- `src/data/chapters.ts` - Chapter definitions (CRITICAL)
- `src/data/questions.ts` - Quiz questions
- `src/components/chapters/` - Chapter UI components
- `src/app/api/progress/` - Progress API
- `src/app/api/questions/` - Question API
- `public/prednasky/` - Markdown lecture files
- `data/videa/` - Video files

---
<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: [chapterId]/page.tsx -->
