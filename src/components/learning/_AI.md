# src/components/learning/ - AI Context

## 🎯 PURPOSE

Learning-related UI components for the Duolingo-style transformation. Contains skill tree visualization, lesson players, exercise components, and review sessions.

## 📦 EXPORTS

| Subfolder     | Components                                                | Purpose               |
| ------------- | --------------------------------------------------------- | --------------------- |
| `skill-tree/` | SkillTreeContainer, SkillNode, SkillPath, SkillCheckpoint | Visual learning path  |
| `exercise/`   | ExercisePlayer, MultipleChoice, FillInBlank, etc.         | Interactive exercises |
| `review/`     | ReviewSession, ReviewCard, ReviewComplete                 | Spaced repetition     |
| `lesson/`     | (TODO) LessonPlayer, LessonProgress                       | Micro-lesson playback |
| `chapter/`    | (existing) ChapterLayout, ChapterHeader                   | Chapter views         |

## 🔗 DEPENDENCIES

- `framer-motion` - Animations (skill tree, celebrations)
- `lucide-react` - Icons
- `@/lib/utils` - `cn()` class merging
- `next/navigation` - Router for navigation

## 🏗️ PATTERNS

### Skill Tree Snake Pattern

Nodes positioned in 5-column snake:

```
     [1]           (center)
   [2]             (left)
 [3]               (far-left)
       [4]         (right)
         [5]       (far-right)
     [6]           (center - repeat)
```

### Component Hierarchy

```
SkillTreeContainer
├── SVG layer (SkillPath connections)
├── SkillCheckpoint (module milestones)
└── SkillNode (chapter nodes)
    ├── Status indicator (locked/active/completed)
    ├── Stars display (0-3)
    └── Progress ring (active nodes)
```

### Data Flow

```
/api/learning-path → SkillTreeContainer → SkillNode clicks → /chapters/[id]
```

## ⚠️ GOTCHAS

1. **Dynamic import**: SkillTreeContainer uses `ssr: false` (framer-motion hydration)
2. **Position calculation**: Nodes positioned absolutely, container needs explicit height
3. **SVG paths**: Use `pointer-events-none` to allow node clicks through
4. **Auto-scroll**: Container scrolls to active node on mount

## 📁 STRUCTURE

```
learning/
├── _AI.md              # This file
├── skill-tree/
│   ├── index.ts        # Barrel exports
│   ├── SkillTreeContainer.tsx  # Main container with data fetching
│   ├── SkillNode.tsx   # Individual skill circle
│   ├── SkillPath.tsx   # SVG bezier connections
│   └── SkillCheckpoint.tsx     # Module milestone banners
├── lesson/             # TODO: Micro-lesson components
├── exercise/           # TODO: Exercise type components
├── review/             # TODO: Spaced repetition components
└── chapter/            # Existing chapter components
```

## 🔄 RELATED

- `/api/learning-path` - Data source for skill tree
- `/app/dashboard` - Page that renders SkillTreeContainer
- `src/lib/gamification.ts` - XP/level calculations
- `src/components/gamification/` - Hearts, streak, celebrations

---

<!-- META: For AI agents -->
<!-- TRAVERSE: yes -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: skill-tree/SkillTreeContainer.tsx -->
