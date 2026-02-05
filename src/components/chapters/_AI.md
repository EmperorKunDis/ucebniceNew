# src/components/chapters/ - AI Context

## 🎯 PURPOSE
Components for rendering chapter content: video players, content display, quiz questions, project submission, and navigation between chapters.

## 📦 EXPORTS

| Component | Description |
|-----------|-------------|
| `ChapterCard` | Card for chapter list display |
| `ChapterContent` | Main chapter content renderer |
| `ChapterLayout` | Layout wrapper for chapter pages |
| `ChapterHeader` | Chapter title and metadata |
| `ChapterNavigation` | Previous/next chapter links |
| `VideoPlayer` | Video player with controls |
| `QuestionCard` | Quiz question with options |
| `ProjectSubmission` | Project URL submission form |
| `NotebookLinks` | Colab/NotebookLM links |

## 🔗 DEPENDENCIES
- `@/data/chapters` - Chapter data
- `@/data/questions` - Question data
- `@/lib/api-client` - API calls
- `@/components/ui/*` - UI primitives
- `framer-motion` - Animations
- `lucide-react` - Icons

## 🏗️ PATTERNS

### ChapterCard Pattern
```typescript
interface ChapterCardProps {
  chapter: Chapter
  progress?: ChapterProgress
  isLocked?: boolean
}

export function ChapterCard({ chapter, progress, isLocked }: ChapterCardProps) {
  const stars = countStars(progress)
  // Render card with stars indicator
}
```

### VideoPlayer Pattern
```typescript
export function VideoPlayer({ videoFile }: { videoFile: string }) {
  // Streams from /api/video/[filename]
  return (
    <video controls>
      <source src={`/api/video/${videoFile}`} type="video/mp4" />
    </video>
  )
}
```

### QuestionCard Pattern
```typescript
interface QuestionCardProps {
  question: Question
  onAnswer: (correct: boolean) => void
  answered?: boolean
}
```

### 3-Star Progress Display
```typescript
function StarDisplay({ progress }: { progress: ChapterCompletion }) {
  return (
    <div className="flex gap-1">
      <Star filled={progress.completedChapter} />    {/* Star 1 */}
      <Star filled={progress.answeredQuestions} />    {/* Star 2 */}
      <Star filled={progress.submittedProject} />     {/* Star 3 */}
    </div>
  )
}
```

## ⚠️ GOTCHAS

1. **Video streaming**: Videos are served via API route, not direct file access
2. **Question state**: Track answered questions to prevent double XP
3. **Project URL validation**: Must be valid URL format
4. **Progress sync**: Client state should sync with server after mutations
5. **Colab links**: External links, open in new tab

## 📁 STRUCTURE
```
chapters/
├── ChapterCard.tsx        # List item card
├── ChapterCard.stories.tsx # Storybook
├── ChapterContent.tsx     # Content renderer
├── ChapterLayout.tsx      # Page layout
├── ChapterHeader.tsx      # Header section
├── ChapterNavigation.tsx  # Nav links
├── VideoPlayer.tsx        # Video component
├── QuestionCard.tsx       # Quiz question
├── ProjectSubmission.tsx  # Project form
└── NotebookLinks.tsx      # External links
```

## 🔄 RELATED
- `src/data/chapters.ts` - Chapter definitions
- `src/data/questions.ts` - Question data
- `src/app/chapters/` - Chapter pages
- `src/app/api/progress/` - Progress API
- `src/app/api/questions/` - Question API
- `src/app/api/projects/` - Project API

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: ChapterContent.tsx, QuestionCard.tsx -->
