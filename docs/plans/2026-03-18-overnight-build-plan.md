# MomBrain Overnight Autonomous Build Plan

**Created:** 2026-03-18
**Goal:** Take MomBrain from code-complete MVP to fully deployed, polished, production-ready app — measured against the Bootstrap skill spec
**Method:** RALPH autonomous loop or sequential session execution

---

## Current State Audit

### What EXISTS (code-complete):
- **17 Supabase tables** (mb_ prefix) on CC&SS project, all with RLS enabled
- **Auth:** Login, register, Google OAuth, onboarding wizard (4-step)
- **Dashboard:** Greeting, upcoming events, tasks, meals summary, gamification stats, quick actions
- **Meals:** CRUD, search, favorites, AI generation (7-day plans via DeepSeek), meal detail pages
- **Calendar:** Monthly view with colored events, day detail, create event dialog
- **Tasks:** Kanban board (todo/in_progress/done), priority badges, assignee, category, completion points
- **AI Chat:** Streaming SSE with DeepSeek, context-aware (events, tasks, children), quick actions
- **Health:** Sleep (bar chart), mood (emoji journal), cycle tracking, tabbed UI
- **Community:** Posts with categories (tip/recipe/question/win), upvotes, comments, post detail
- **Shopping Lists:** CRUD, checkbox items, manual add
- **Family:** Create/join via invite code, members list, children CRUD with allergies
- **Badges:** 5 badge definitions, points/streak/level display, progress bar, recent activity
- **Profile:** Avatar upload to Supabase storage, name, timezone, units, AI tone preference
- **Sidebar + Mobile Nav:** 11 nav items, dark mode toggle, logout
- **20 API routes** with auth middleware + family isolation
- **Zustand store** for profile, family, sidebar state

### Bootstrap Spec Gap Analysis (CRITICAL FINDINGS)

Comparing against the Bootstrap skill's requirements, these are the gaps:

#### GAP 1: Design System — NOT FINALIZED (Bootstrap Phase 3 + Anti-Pattern #26)
- **Font:** Uses `Inter` — Bootstrap spec explicitly says "NEVER use Inter, Roboto, Arial"
- **No ui-ux-pro-max design pass** — No persisted design system, no distinctive aesthetic
- **No Magic UI components** — No animated backgrounds, scroll effects, hero animations
- **No custom color palette** — Using default shadcn/ui theme colors
- **Landing page is generic** — No gradient meshes, noise textures, layered transparencies
- **FIX:** Run ui-ux-pro-max for design system, apply to all pages, swap fonts

#### GAP 2: Supabase Admin Client — MISSING (Bootstrap Step 9)
- Only 2 Supabase client files exist (client.ts, server.ts)
- **Missing `admin.ts`** — No service role client with lazy Proxy pattern
- **Missing `middleware.ts` helper** — Middleware has Supabase client inline instead of separate file
- **FIX:** Create `src/lib/supabase/admin.ts` (lazy Proxy) and `src/lib/supabase/middleware.ts`

#### GAP 3: Verbose Logging — NONE (Bootstrap Step 15b, MANDATORY)
- API routes have minimal/no logging
- Middleware has no logging
- "Every server action, middleware handler, and auth callback must log"
- **FIX:** Add console.log to all 20 API routes + middleware

#### GAP 4: Error Boundaries — MISSING (Bootstrap Step 12)
- No `error.tsx` — runtime errors white-screen the app
- No `not-found.tsx` — 404 is default Next.js page
- No `loading.tsx` — no global loading state
- **FIX:** Create all three

#### GAP 5: TypeScript Types File — MISSING (Bootstrap Step 17)
- No `src/types/index.ts` with types matching DB schema exactly
- Types are defined inline in each page component (prone to schema drift)
- **FIX:** Create centralized types file matching Supabase schema exactly

#### GAP 6: Migration File — MISSING (Bootstrap Step 16)
- No `supabase/migrations/` directory
- Tables created directly via MCP, no reproducible migration
- **FIX:** Generate `supabase/migrations/001_initial_schema.sql` from current DB state

#### GAP 7: Seed Script + Test Account — MISSING (Bootstrap Phase 7 Step 7)
- No test account, no seed data, no `src/lib/seed.ts`
- Tables are empty (except mb_profiles/mb_gamification from auth trigger)
- **FIX:** Create seed script with test account + realistic sample data

#### GAP 8: DDD Feedback Widget — MISSING (Bootstrap Step 20)
- Not added to root layout
- **FIX:** Add `<script src="https://ddd-one-tawny.vercel.app/feedback-widget.js" data-project="MomBrain">` to layout

#### GAP 9: Project Documentation — INCOMPLETE (Bootstrap Step 19)
- No project-specific `CLAUDE.md` (only parent ~/projects/CLAUDE.md)
- No `CODEBASE_MAP.md`
- **FIX:** Create both

#### GAP 10: Security — BUG_CIPHER Violations (Bootstrap Anti-Patterns)
- **No input validation on API routes** — trusting client input directly
- **No rate limiting** — especially dangerous on AI chat endpoint
- **`timestamp` vs `timestamptz` not verified** — Bootstrap says ALL timestamps MUST be `timestamptz`
- **FIX:** Verify timestamptz, add basic validation to API routes

#### GAP 11: Testing — ZERO COVERAGE (Bootstrap Phase 8)
- No Playwright tests
- No test suite
- No test plan
- **FIX:** Run `/write-tests` to generate test suite, then `/test-webapp` to execute

#### GAP 12: GitNexus — NOT INDEXED (Bootstrap Phase 8 Step 5)
- Project not indexed in GitNexus knowledge graph
- **FIX:** Run `npx gitnexus analyze` after deployment

#### GAP 13: `next.config.ts` — EMPTY (Bootstrap Step 7)
- No image domain configuration for Supabase storage
- **FIX:** Add `images.remotePatterns` for `*.supabase.co`

---

## Execution Plan (Ordered Phases)

### Phase 1: Foundation (30 min)
**Goal:** Get the app building and running locally

```
Step 1.1: Create .env.local
  - NEXT_PUBLIC_SUPABASE_URL (from CC&SS MCP: get_project_url)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (from CC&SS MCP: get_publishable_keys)
  - SUPABASE_SERVICE_ROLE_KEY (for admin client — from MCP or vault)
  - DEEPSEEK_API_KEY (from existing project envs or vault)
  - NEXT_PUBLIC_APP_URL=http://localhost:3000

Step 1.2: npm install

Step 1.3: git config user.email "danieljohnabrahamson@gmail.com"

Step 1.4: npx tsc --noEmit → fix all TypeScript errors

Step 1.5: npm run build (in subagent) → fix all build errors

Step 1.6: Verify locally with npm run dev (Playwright CLI snapshot)
```

**Checkpoint commit:** `bootstrap: foundation — env, install, build pass`

### Phase 2: Bootstrap Structural Gaps (45 min)
**Goal:** Fill all structural gaps identified by Bootstrap spec comparison

```
Step 2.1: Create src/lib/supabase/admin.ts (lazy Proxy pattern)
  - Service role client that bypasses RLS
  - Uses Proxy to avoid build-time crashes

Step 2.2: Extract src/lib/supabase/middleware.ts
  - Move Supabase middleware logic from src/middleware.ts to separate file
  - Add onboarding_completed check + redirect to /onboarding

Step 2.3: Create src/types/index.ts
  - Query mb_ table schemas via execute_sql
  - Generate types matching EVERY column name, type, and nullability exactly
  - Include Insert types (omit auto-generated fields) and Update types (Partial)

Step 2.4: Create supabase/migrations/001_initial_schema.sql
  - Dump current schema from DB using execute_sql
  - Verify ALL timestamps are timestamptz (fix if not)
  - Include RLS policies, triggers, enums, indexes

Step 2.5: Create src/app/error.tsx
  - "Something went wrong" with retry button
  - Styled with design system

Step 2.6: Create src/app/not-found.tsx
  - Styled 404 page with navigation back

Step 2.7: Create src/app/loading.tsx
  - Global loading skeleton

Step 2.8: Update next.config.ts
  - Add images.remotePatterns for *.supabase.co

Step 2.9: Add verbose logging to ALL 20 API routes
  - Function name + input params on entry
  - Supabase query results or errors
  - Success with returned ID/count
  Pattern: console.log('[routeName] called with:', ...) / console.error('[routeName] error:', ...)

Step 2.10: Add verbose logging to middleware
  - Auth state (user present/absent)
  - Redirect decisions
  - Onboarding check results

Step 2.11: Add DDD Feedback Widget to root layout
  - <script src="https://ddd-one-tawny.vercel.app/feedback-widget.js" data-project="MomBrain">

Step 2.12: Create project CLAUDE.md
  - Supabase project (CC&SS), deployment URL, key patterns
  - Test account credentials (after seed)
  - Entity list with table names

Step 2.13: Create CODEBASE_MAP.md
  - Map of every file and its purpose
```

**Checkpoint commit:** `bootstrap: structural gaps — types, admin client, error pages, logging, docs`

### Phase 3: Backend Verification & Seed (30 min)
**Goal:** Ensure DB is correct, create test data

```
Step 3.1: Query all mb_ table schemas via execute_sql
  - Verify columns match src/types/index.ts exactly
  - Verify all timestamps are timestamptz
  - Fix any mismatches

Step 3.2: Verify RLS policies on ALL 17 tables
  - mb_profiles: users can read/update own profile
  - mb_families: members can read their family
  - mb_family_members: members can read, admin can insert/delete
  - mb_children: family members can CRUD
  - mb_meals: family members can CRUD
  - mb_meal_plans: family members can CRUD
  - mb_events: family members can CRUD
  - mb_tasks: family members can CRUD
  - mb_health_logs: user can CRUD own logs
  - mb_community_posts: authenticated can read all, CRUD own
  - mb_community_comments: authenticated can read all, CRUD own
  - mb_community_upvotes: authenticated can CRUD own
  - mb_gamification: user can read own
  - mb_gamification_log: user can read own
  - mb_ai_conversations: user can CRUD own
  - mb_notifications: user can read/update own
  - mb_shopping_lists: family members can CRUD
  If missing: CREATE POLICIES via apply_migration

Step 3.3: Verify triggers
  - on auth.users insert → create mb_profiles row (confirmed: 17 rows)
  - on auth.users insert → create mb_gamification row (confirmed: 17 rows)
  - on mb_families insert → generate invite_code
  If missing: CREATE TRIGGERS

Step 3.4: Verify/create avatars storage bucket with public access

Step 3.5: Create src/lib/seed.ts
  - Create test user: test@mombrain.app / TestPassword123!
  - Create a family "The Test Family" with invite code
  - Add 2 children (Emma 5yo, Liam 3yo) with dietary preferences
  - Add 5 sample meals (mix of AI-generated and manual)
  - Add 3 events for this week
  - Add 5 tasks across kanban columns
  - Add 3 health logs (1 sleep, 1 mood, 1 cycle)
  - Add 2 community posts with comments
  - Add 1 shopping list with 8 items
  - All data must be REALISTIC, not "Test Item 1"

Step 3.6: Run seed script: npx tsx src/lib/seed.ts
```

**Checkpoint commit:** `bootstrap: backend verified, test account seeded`

### Phase 4: Design Pass (60 min)
**Goal:** Elevate from "functional MVP" to "polished, distinctive product"

This is the biggest gap. The Bootstrap spec requires a full design pass.

```
Step 4.1: Run ui-ux-pro-max design system generation
  - Product type: family productivity app for moms
  - Vibe: warm, approachable, modern, not clinical
  - Must produce: color palette (hex values), typography (Google Fonts), effects

Step 4.2: Swap fonts
  - Replace Inter with distinctive heading + body fonts from design system
  - Update root layout with next/font/google imports
  - Update tailwind config with font families

Step 4.3: Apply color palette
  - Update CSS variables in globals.css
  - Update tailwind.config.ts with custom colors
  - Update all hardcoded colors (priority badges, community badges, chart colors, calendar event colors)

Step 4.4: Research MCP components
  - shadcn MCP: search for relevant components
  - Magic UI MCP: search for hero, backgrounds, animations, cards
  - Install any additional components needed

Step 4.5: Redesign landing page
  - Distinctive hero with animated background (Magic UI)
  - Better typography hierarchy
  - Social proof section (testimonials or stats)
  - "How it works" 3-step section
  - Feature cards with hover effects and staggered animation
  - CTA sections with gradient backgrounds
  - Footer with links

Step 4.6: Polish all app pages
  - cursor-pointer on ALL clickable elements
  - Hover states with transition-colors duration-200
  - Loading skeletons on all async pages (verify consistency)
  - Smooth page transitions
  - Empty states with proper CTAs
  - Toast notifications on all mutations
  - Dark mode: verify all custom colors work
  - Accessibility: aria-labels, focus rings, 4.5:1 contrast

Step 4.7: Mobile responsiveness
  - Test at 375px, 768px, 1024px, 1440px
  - Fix overflow, truncation, layout issues
  - Verify bottom nav covers all needed items

Step 4.8: Add metadata to pages
  - Per-page titles via metadata export
  - OG tags for social sharing

Step 4.9: PWA manifest + favicon
  - Brain icon favicon (SVG)
  - manifest.json for "Add to Home Screen"
```

**Checkpoint commit:** `bootstrap: design pass — custom palette, fonts, polished UI`

### Phase 5: Missing Features (30 min)
**Goal:** Fill remaining functionality gaps

```
Step 5.1: Verify meal detail page (/meals/[id])
  - Full recipe view, ingredients, instructions
  - Back to /meals

Step 5.2: Verify community post detail (/community/post/[id])
  - Full post, comments, comment form
  - Back to /community

Step 5.3: Add notifications page
  - Read /api/notifications route
  - List UI with mark-as-read
  - Add to sidebar/nav

Step 5.4: Add notification bell to sidebar + mobile nav
  - Unread count badge
  - Link to notifications

Step 5.5: Add password reset flow
  - /forgot-password page
  - Supabase resetPasswordForEmail()
  - Add "Forgot password?" link to login page

Step 5.6: Add onboarding redirect in middleware
  - If user.onboarding_completed === false → /onboarding
  - Skip if already on /onboarding

Step 5.7: Basic input validation on API routes
  - Title/name required fields checked server-side
  - Type coercion for numbers
  - Sanitize AI chat messages

Step 5.8: Add confirmation dialogs for destructive actions
  - Delete child, remove from family
```

**Checkpoint commit:** `bootstrap: missing features — notifications, password reset, validation`

### Phase 6: Deploy (20 min)
**Goal:** Ship to Vercel production

```
Step 6.1: Build in subagent (clean build after all changes)

Step 6.2: Security grep
  grep -rn "sk-\|password.*=.*['\"]" --include="*.ts" --include="*.tsx" src/ | grep -v "test\|spec\|mock\|\.env\|placeholder" | head -10

Step 6.3: BUG_CIPHER sweep
  - Non-deterministic queries (findFirst without orderBy)
  - String literal status values
  - Mutations without revalidation
  - Timestamps without timestamptz

Step 6.4: Create GitHub repo
  gh repo create mombrain --public --source=. --push
  OR if exists: git push origin main

Step 6.5: Deploy to Vercel
  - npx vercel link --yes
  - Set env vars (from MCP + vault):
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    DEEPSEEK_API_KEY
    NEXT_PUBLIC_APP_URL
  - npx vercel --prod --yes

Step 6.6: Configure Supabase auth
  - Add production URL to allowed redirect URLs
  - Update Google OAuth callback URL

Step 6.7: Verify production (Playwright CLI)
  - Landing page loads with design system
  - Login works with test account
  - Dashboard shows seeded data

Step 6.8: Record deployed URL in CLAUDE.md
```

**Checkpoint commit:** `bootstrap: deployed to Vercel`

### Phase 7: Testing (30 min)
**Goal:** Generate and run comprehensive test suite

```
Step 7.1: Run /write-tests skill
  - Generates tests/agent/ directory with full test flows
  - Auth flows, CRUD lifecycle, error states, cleanup

Step 7.2: Run /test-webapp skill
  - Launches Opus session in separate tmux window
  - Executes all flows against production URL
  - Oracle triple-verification (predicted → UI → DB)
  - Screenshots after every CRUD operation

Step 7.3: While tests run, index with GitNexus
  npx gitnexus analyze

Step 7.4: Review test results
  - If failures: fix bugs, commit, redeploy, retest
  - Iterate until all flows pass

Step 7.5: Final commit with test suite
```

### Phase 8: Final Report
**Goal:** Document what was built and what's next

```
Step 8.1: Update CURRENT_WORK.md with final status
Step 8.2: Update bootstrap plan with completed checkboxes
Step 8.3: Present report to user:
  - Deployed URL
  - Test account credentials
  - File count, pages, components, API routes
  - Test report summary
  - Design system (colors, fonts, style)
  - Known gaps / nice-to-haves for v2
  - Recommended next steps
```

---

## RALPH Configuration

If running via RALPH, use this as `@fix_plan.md`:

```
[ ] Phase 1: Foundation — env, install, build, fix errors
[ ] Phase 2: Bootstrap structural gaps — types, admin client, error pages, logging, docs
[ ] Phase 3: Backend verification & seed — RLS, triggers, test account, sample data
[ ] Phase 4: Design pass — ui-ux-pro-max, fonts, colors, landing page, polish
[ ] Phase 5: Missing features — notifications, password reset, validation, confirmations
[ ] Phase 6: Deploy — build, security grep, GitHub, Vercel, auth config, verify
[ ] Phase 7: Testing — write-tests, test-webapp, GitNexus index, fix failures
[ ] Phase 8: Final report — docs, status, present results
```

---

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=https://netbsyvxrhrqxyzqflmd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from CC&SS MCP: get_publishable_keys>
SUPABASE_SERVICE_ROLE_KEY=<from CC&SS MCP or vault>
DEEPSEEK_API_KEY=<from existing project envs or vault>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Test Account (after seed)
```
Email: test@mombrain.app
Password: TestPassword123!
```

## Key Decisions
1. **Supabase project:** CC&SS (shared, mb_ prefix tables already exist)
2. **AI provider:** DeepSeek (already switched from OpenAI)
3. **Deployment:** Vercel (standard for Next.js projects)
4. **Auth:** Supabase Auth with email + Google OAuth
5. **API pattern:** Route handlers (not server actions — existing pattern, keep it)
6. **Design system:** TBD — will be generated by ui-ux-pro-max in Phase 4

## Bootstrap Spec Compliance Checklist

```
[x] Next.js 15 + TypeScript + Tailwind + shadcn/ui
[x] Supabase Auth with middleware protection
[x] Core CRUD for all entities (20 API routes)
[x] AI integration (DeepSeek streaming chat)
[x] Mobile responsive layout
[x] Dark mode
[ ] Distinctive design system (NOT Inter/default — Phase 4)
[ ] Supabase admin client with lazy Proxy (Phase 2)
[ ] Supabase middleware helper file (Phase 2)
[ ] Centralized TypeScript types matching DB exactly (Phase 2)
[ ] Migration file (Phase 2)
[ ] Error boundaries (error.tsx, not-found.tsx, loading.tsx) (Phase 2)
[ ] Verbose logging on all routes + middleware (Phase 2)
[ ] DDD Feedback Widget (Phase 2)
[ ] Project CLAUDE.md + CODEBASE_MAP.md (Phase 2)
[ ] RLS policies verified on all 17 tables (Phase 3)
[ ] Triggers verified (profile, gamification, invite code) (Phase 3)
[ ] Test account + realistic seed data (Phase 3)
[ ] ui-ux-pro-max design pass (Phase 4)
[ ] Landing page with animations/effects (Phase 4)
[ ] Password reset flow (Phase 5)
[ ] Onboarding redirect in middleware (Phase 5)
[ ] Notifications UI (Phase 5)
[ ] Input validation on API routes (Phase 5)
[ ] Deployed to Vercel with real env vars (Phase 6)
[ ] BUG_CIPHER sweep clean (Phase 6)
[ ] Agent-powered test suite (Phase 7)
[ ] Production test pass (Phase 7)
[ ] GitNexus indexed (Phase 7)
[ ] next.config.ts with image domains (Phase 2)
```
