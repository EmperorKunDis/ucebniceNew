# src/components/shared/ - AI Context

## 🎯 PURPOSE

Shared utility components used across the application - error handling, loading states, empty states, etc.

## 📦 EXPORTS

| Component       | Purpose                                       |
| --------------- | --------------------------------------------- |
| `ErrorBoundary` | React error boundary with retry and analytics |

## 🔗 DEPENDENCIES

- `lucide-react` - Icons

## 🏗️ PATTERNS

### Error Boundary Usage

```typescript
// Wrap any component tree
<ErrorBoundary>
  <SomeComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <SomeComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, info) => logToService(error)}>
  <SomeComponent />
</ErrorBoundary>
```

### Error Tracking

```typescript
// Automatically sends to /api/analytics/event
componentDidCatch(error, errorInfo) {
  fetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({
      type: 'ERROR',
      data: { message, stack, componentStack },
    }),
  })
}
```

### Recovery Options

```typescript
// "Zkusit znovu" - resets error boundary state
// "Obnovit stránku" - full page reload
```

## ⚠️ GOTCHAS

1. **Class component**: Error boundaries must be class components (React limitation)
2. **Analytics silent**: Analytics fetch errors are caught and ignored
3. **No SSR**: Only runs on client (typeof window check)

## 📁 STRUCTURE

```
shared/
├── _AI.md              # This file
├── ErrorBoundary.tsx   # Error boundary component
├── LoadingSpinner.tsx  # (TODO)
├── EmptyState.tsx      # (TODO)
└── index.ts            # (TODO)
```

## 🔄 RELATED

- `src/components/layout/MainLayout.tsx` - Uses ErrorBoundary
- `/api/analytics/event` - Receives error events

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 1 -->
<!-- CRITICAL: ErrorBoundary.tsx -->
