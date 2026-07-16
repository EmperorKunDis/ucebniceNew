# src/components/layout/ - AI Context

## PURPOSE

Canonical visual shells for the v2 application. Every route belongs to exactly one shell:

- authenticated learning app: `MainLayout`;
- public and auth routes: `PublicShell` / `PublicPageLayout`;
- administration: `AdminShell` after the server-side admin guard.

## EXPORTS

| Component           | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `MainLayout`        | Sidebar, Topbar and mobile bottom navigation for signed-in UI  |
| `PublicShell`       | Lightweight responsive public navigation and partner footer    |
| `PublicPageLayout`  | Public shell plus a constrained, padded main-content container |
| `AdminShell`        | Token-aligned desktop and mobile admin navigation              |
| `Footer` (internal) | Partner logos; rendered only by `PublicShell`                  |
| `Sidebar`           | Desktop and drawer navigation for the learning app             |
| `Topbar`            | Hearts, XP, gems, notifications and avatar HUD                 |
| `MobileNav`         | Fixed bottom navigation for the learning app                   |

## PATTERNS

```tsx
// Public page
<PublicPageLayout maxWidth="7xl">{children}</PublicPageLayout>

// Auth section layout
<PublicShell showNavigation={false}>{children}</PublicShell>

// Authenticated route group
<MainLayout>{children}</MainLayout>
```

`PublicPageLayout` accepts `maxWidth`, `showNav`, `showFooter`, `className` and
`contentClassName`. Public navigation links to the canonical `/dashboard` and
`/learn/*` learning experience; never add a new `/chapters` link.

## GOTCHAS

1. The root `src/app/layout.tsx` owns providers only. Do not put navigation or the partner footer there.
2. Partner logos belong exclusively to `PublicShell`; app and admin screens must not render them.
3. Admin authorization remains server-side in `src/app/admin/layout.tsx`; `AdminShell` is presentation only.
4. `MainLayout` is height-constrained and scrolls its own main region.
5. Public and admin mobile menus must retain their labels, `aria-expanded`, `aria-controls` and Escape/route-close behavior.

## STRUCTURE

```text
layout/
├── MainLayout.tsx
├── PublicShell.tsx
├── PublicPageLayout.tsx
├── AdminShell.tsx
├── Sidebar.tsx
├── Topbar.tsx
├── MobileNav.tsx
├── footer.tsx
└── index.ts
```

The retired `Navigation`, `PageLayout` and `UnifiedPageLayout` components must not be reintroduced.

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: 2 -->
<!-- CRITICAL: MainLayout.tsx, PublicShell.tsx, AdminShell.tsx -->
