# MomBrain

AI-powered family productivity app for moms. Meal planning, scheduling, task management, health tracking, community, and gamification.

## Stack
- **Framework:** Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (CC&SS project, `mb_` prefix tables)
- **AI:** DeepSeek via OpenAI SDK compatibility (baseURL: api.deepseek.com)
- **State:** Zustand (client-side), Supabase (server-side)
- **Auth:** Supabase Auth (email + Google OAuth)
- **Deployment:** Vercel — https://mombrain.vercel.app

## Supabase Project
- **MCP:** `supabase-CCandSS`
- **URL:** https://netbsyvxrhrqxyzqflmd.supabase.co
- **Tables:** 17 tables, all prefixed `mb_` to avoid conflicts with other apps on same project
- **RLS:** Enabled on all tables

## Key Patterns
- **API routes** (not server actions) — all at `src/app/api/`
- **Auth middleware** at `src/middleware.ts` — protects all routes except `/`, `/login`, `/register`
- **Family isolation** — most data scoped by `family_id`, looked up via `mb_family_members`
- **Supabase clients:** `src/lib/supabase/client.ts` (browser), `server.ts` (SSR), `admin.ts` (service role)
- **Helper:** `src/lib/api-helpers.ts` — `getAuthUser()`, `getUserFamilyId()`, `jsonResponse()`

## Entities (17 tables)
| Table | Key Fields | Scope |
|-------|-----------|-------|
| mb_profiles | display_name, timezone, tone_preference, onboarding_completed | per user |
| mb_families | name, invite_code (auto-generated) | per family |
| mb_family_members | family_id, profile_id, role | per family |
| mb_children | name, date_of_birth, dietary_preferences, medical_history | per family |
| mb_meals | title, ingredients, instructions, prep_time, ai_generated | per family |
| mb_meal_plans | week_start_date, plan_data (jsonb) | per family |
| mb_shopping_lists | title, items (jsonb array) | per family |
| mb_events | title, start_time, end_time, location, color | per family |
| mb_tasks | title, priority, status, assigned_to, category | per family |
| mb_health_logs | log_type (sleep/mood/cycle), log_data (jsonb) | per user |
| mb_community_posts | title, body, category, upvotes | global (auth required) |
| mb_community_comments | post_id, body | global |
| mb_community_upvotes | post_id, profile_id | global |
| mb_gamification | points, streak_days, badges, level | per user |
| mb_gamification_log | action, points_earned | per user |
| mb_ai_conversations | messages (jsonb), context_type | per user |
| mb_notifications | title, body, type, read, action_url | per user |

## Test Account
- Email: test@mombrain.app
- Password: TestPassword123!

## Development
```bash
npm run dev    # Start dev server on :3000
npm run build  # Production build (run in subagent)
```
