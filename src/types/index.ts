// Types matching Supabase mb_ tables EXACTLY
// Generated from DB schema query 2026-03-18

// ── Profiles ──
export interface MbProfile {
  id: string // uuid, PK, from auth.users
  display_name: string
  avatar_url: string | null
  timezone: string | null // default 'America/New_York'
  measurement_unit: string | null // default 'imperial'
  tone_preference: string | null // default 'supportive'
  is_premium: boolean | null // default false
  onboarding_completed: boolean | null // default false
  dark_mode: boolean | null // default false
  created_at: string | null
  updated_at: string | null
}

export type MbProfileInsert = Omit<MbProfile, 'created_at' | 'updated_at'>
export type MbProfileUpdate = Partial<Omit<MbProfile, 'id'>>

// ── Families ──
export interface MbFamily {
  id: string
  name: string
  created_by: string | null
  invite_code: string | null // auto-generated: substr(md5(random()), 1, 8)
  created_at: string | null
}

export type MbFamilyInsert = Pick<MbFamily, 'name' | 'created_by'>

// ── Family Members ──
export interface MbFamilyMember {
  id: string
  family_id: string
  profile_id: string
  role: string // default 'member'
  joined_at: string | null
}

export type MbFamilyMemberInsert = Pick<MbFamilyMember, 'family_id' | 'profile_id'> & { role?: string }

// ── Children ──
export interface MbChild {
  id: string
  family_id: string
  name: string
  date_of_birth: string | null // date
  avatar_url: string | null
  notes: string | null
  dietary_preferences: Record<string, unknown> | null // jsonb, default {}
  medical_history: Record<string, unknown> | null // jsonb, default {}
  blood_type: string | null
  pediatrician_name: string | null
  pediatrician_phone: string | null
  created_at: string | null
  updated_at: string | null
}

export type MbChildInsert = Omit<MbChild, 'id' | 'created_at' | 'updated_at'>
export type MbChildUpdate = Partial<Omit<MbChild, 'id' | 'family_id'>>

// ── Meals ──
export interface MbMeal {
  id: string
  family_id: string
  title: string
  description: string | null
  ingredients: unknown[] | null // jsonb, default []
  instructions: unknown[] | null // jsonb, default []
  prep_time: number | null
  servings: number | null
  tags: string[] | null // text[], default {}
  ai_generated: boolean | null // default false
  image_url: string | null
  is_favorite: boolean | null // default false
  created_at: string | null
  updated_at: string | null
}

export type MbMealInsert = Omit<MbMeal, 'id' | 'created_at' | 'updated_at'>
export type MbMealUpdate = Partial<Omit<MbMeal, 'id' | 'family_id'>>

// ── Meal Plans ──
export interface MbMealPlan {
  id: string
  family_id: string
  week_start_date: string // date
  plan_data: Record<string, unknown> | null // jsonb, default {}
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export type MbMealPlanInsert = Omit<MbMealPlan, 'id' | 'created_at' | 'updated_at'>

// ── Shopping Lists ──
export interface MbShoppingList {
  id: string
  family_id: string
  meal_plan_id: string | null
  title: string | null // default 'Shopping List'
  items: ShoppingItem[] | null // jsonb, default []
  created_at: string | null
  updated_at: string | null
}

export interface ShoppingItem {
  name: string
  qty: string
  category: string
  checked: boolean
}

export type MbShoppingListInsert = Omit<MbShoppingList, 'id' | 'created_at' | 'updated_at'>
export type MbShoppingListUpdate = Partial<Omit<MbShoppingList, 'id' | 'family_id'>>

// ── Events ──
export interface MbEvent {
  id: string
  family_id: string
  title: string
  description: string | null
  start_time: string // timestamptz
  end_time: string | null // timestamptz
  recurrence_rule: string | null
  location: string | null
  assigned_to: string | null
  color: string | null // default '#E11D48'
  reminders: unknown[] | null // jsonb, default []
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export type MbEventInsert = Omit<MbEvent, 'id' | 'created_at' | 'updated_at'>
export type MbEventUpdate = Partial<Omit<MbEvent, 'id' | 'family_id'>>

// ── Tasks ──
export interface MbTask {
  id: string
  family_id: string
  title: string
  description: string | null
  assigned_to: string | null
  due_date: string | null // timestamptz
  priority: string | null // default 'medium'
  status: string | null // default 'todo'
  recurring: string | null
  category: string | null
  sort_order: number | null // default 0
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export type MbTaskInsert = Omit<MbTask, 'id' | 'created_at' | 'updated_at'>
export type MbTaskUpdate = Partial<Omit<MbTask, 'id' | 'family_id'>>

// ── Health Logs ──
export interface MbHealthLog {
  id: string
  profile_id: string
  log_type: string
  log_data: Record<string, unknown> // jsonb, default {}
  logged_at: string | null
  created_at: string | null
}

export type MbHealthLogInsert = Omit<MbHealthLog, 'id' | 'logged_at' | 'created_at'>

// ── Community Posts ──
export interface MbCommunityPost {
  id: string
  author_id: string
  category: string
  title: string
  body: string
  image_url: string | null
  upvotes: number | null // default 0
  created_at: string | null
  updated_at: string | null
}

export type MbCommunityPostInsert = Omit<MbCommunityPost, 'id' | 'upvotes' | 'created_at' | 'updated_at'>

// ── Community Comments ──
export interface MbCommunityComment {
  id: string
  post_id: string
  author_id: string
  body: string
  created_at: string | null
}

export type MbCommunityCommentInsert = Omit<MbCommunityComment, 'id' | 'created_at'>

// ── Community Upvotes ──
export interface MbCommunityUpvote {
  id: string
  post_id: string
  profile_id: string
  created_at: string | null
}

// ── Gamification ──
export interface MbGamification {
  id: string
  profile_id: string
  points: number | null // default 0
  streak_days: number | null // default 0
  last_login_date: string | null // date
  badges: string[] | null // jsonb, default []
  level: number | null // default 1
}

// ── Gamification Log ──
export interface MbGamificationLog {
  id: string
  profile_id: string
  action: string
  points_earned: number // default 0
  earned_at: string | null
}

// ── AI Conversations ──
export interface MbAiConversation {
  id: string
  profile_id: string
  messages: unknown[] | null // jsonb, default []
  context_type: string | null
  created_at: string | null
  updated_at: string | null
}

// ── Notifications ──
export interface MbNotification {
  id: string
  profile_id: string
  title: string
  body: string | null
  type: string | null // default 'info'
  read: boolean | null // default false
  action_url: string | null
  created_at: string | null
}

export type MbNotificationInsert = Omit<MbNotification, 'id' | 'read' | 'created_at'>
