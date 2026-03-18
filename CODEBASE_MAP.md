# Codebase Map — MomBrain

## Core
- `src/app/layout.tsx` — Root layout (fonts, theme provider, toaster, DDD widget)
- `src/app/page.tsx` — Landing page (public)
- `src/app/error.tsx` — Global error boundary
- `src/app/not-found.tsx` — 404 page
- `src/app/loading.tsx` — Global loading skeleton
- `src/middleware.ts` — Auth middleware (protects app routes)

## Auth Pages
- `src/app/(auth)/login/page.tsx` — Email + Google OAuth login
- `src/app/(auth)/register/page.tsx` — Registration

## App Pages (protected)
- `src/app/(app)/layout.tsx` — App shell (sidebar + mobile nav, loads profile/family)
- `src/app/(app)/dashboard/page.tsx` — Dashboard (events, tasks, meals, gamification)
- `src/app/(app)/meals/page.tsx` — Meal list (CRUD, search, favorites)
- `src/app/(app)/meals/[id]/page.tsx` — Meal detail
- `src/app/(app)/meals/generate/page.tsx` — AI meal plan generation form
- `src/app/(app)/calendar/page.tsx` — Monthly calendar with events
- `src/app/(app)/tasks/page.tsx` — Kanban board (todo/in_progress/done)
- `src/app/(app)/ai/page.tsx` — AI chat (streaming SSE)
- `src/app/(app)/health/page.tsx` — Health tracking (sleep/mood/cycle tabs)
- `src/app/(app)/community/page.tsx` — Community posts with categories
- `src/app/(app)/community/post/[id]/page.tsx` — Post detail with comments
- `src/app/(app)/shopping/page.tsx` — Shopping lists with checkboxes
- `src/app/(app)/badges/page.tsx` — Badges, points, streaks, level
- `src/app/(app)/family/page.tsx` — Family management (create/join, members, children)
- `src/app/(app)/profile/page.tsx` — Profile settings (name, timezone, units, tone, avatar)
- `src/app/(app)/onboarding/page.tsx` — 4-step onboarding wizard

## API Routes (20)
- `src/app/api/auth/callback/route.ts` — OAuth callback handler
- `src/app/api/ai/chat/route.ts` — AI chat (streaming, context-aware)
- `src/app/api/meals/route.ts` — Meals CRUD
- `src/app/api/meal-plans/route.ts` — Meal plans CRUD
- `src/app/api/meal-plans/generate/route.ts` — AI meal plan generation
- `src/app/api/events/route.ts` — Calendar events CRUD
- `src/app/api/tasks/route.ts` — Tasks CRUD
- `src/app/api/tasks/complete/route.ts` — Task completion (awards points)
- `src/app/api/health-logs/route.ts` — Health logs CRUD
- `src/app/api/community/posts/route.ts` — Community posts CRUD
- `src/app/api/community/posts/[id]/comments/route.ts` — Comments CRUD
- `src/app/api/community/posts/[id]/upvote/route.ts` — Upvote toggle
- `src/app/api/shopping-lists/route.ts` — Shopping lists CRUD
- `src/app/api/shopping-lists/generate/route.ts` — Generate from meal plan
- `src/app/api/family/route.ts` — Family CRUD
- `src/app/api/family/join/route.ts` — Join family via invite code
- `src/app/api/family/members/route.ts` — Family members
- `src/app/api/children/route.ts` — Children CRUD
- `src/app/api/profile/route.ts` — Profile CRUD
- `src/app/api/notifications/route.ts` — Notifications CRUD
- `src/app/api/gamification/route.ts` — Gamification data
- `src/app/api/gamification/check-badges/route.ts` — Badge check

## Components
- `src/components/layout/app-sidebar.tsx` — Desktop sidebar (nav, theme toggle, user)
- `src/components/layout/mobile-nav.tsx` — Mobile bottom navigation
- `src/components/providers/theme-provider.tsx` — Dark mode provider
- `src/components/ui/` — shadcn/ui components (20+)

## Lib
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — SSR Supabase client
- `src/lib/supabase/admin.ts` — Service role client (lazy Proxy)
- `src/lib/api-helpers.ts` — Auth helpers for API routes
- `src/lib/utils.ts` — cn() utility

## State
- `src/stores/useAppStore.ts` — Zustand store (profile, family, sidebar, notifications)

## Types
- `src/types/index.ts` — All entity types matching Supabase schema exactly

## Config
- `next.config.ts` — Image domains for Supabase storage
- `tsconfig.json` — Strict TypeScript
- `components.json` — shadcn/ui config
- `.env.local` — Environment variables (not in git)
