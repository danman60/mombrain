import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

const BADGE_DEFINITIONS = [
  { id: 'meal_prep_queen', name: 'Meal Prep Queen', desc: '4 weeks of meal plans', check: 'meal_plans', threshold: 4 },
  { id: 'schedule_ninja', name: 'Schedule Ninja', desc: '20 events created', check: 'events', threshold: 20 },
  { id: 'streak_legend', name: 'Streak Legend', desc: '30-day login streak', check: 'streak', threshold: 30 },
  { id: 'community_star', name: 'Community Star', desc: '10 upvoted posts', check: 'community', threshold: 10 },
  { id: 'super_mom', name: 'Super Mom', desc: '100 tasks completed', check: 'tasks', threshold: 100 },
]

export async function POST() {
  console.log('[check-badges POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)

  const { data: gam } = await supabase
    .from('mb_gamification')
    .select('*')
    .eq('profile_id', user!.id)
    .single()

  if (!gam) {
    console.error('[check-badges POST] no gamification record')
    return jsonResponse({ error: 'No gamification record' }, 404)
  }

  const currentBadges: string[] = (gam.badges as string[]) || []
  const newBadges: string[] = []

  for (const badge of BADGE_DEFINITIONS) {
    if (currentBadges.includes(badge.id)) continue

    let count = 0
    if (badge.check === 'meal_plans' && familyId) {
      const { count: c } = await supabase.from('mb_meal_plans').select('*', { count: 'exact', head: true }).eq('family_id', familyId)
      count = c || 0
    } else if (badge.check === 'events' && familyId) {
      const { count: c } = await supabase.from('mb_events').select('*', { count: 'exact', head: true }).eq('family_id', familyId)
      count = c || 0
    } else if (badge.check === 'streak') {
      count = gam.streak_days
    } else if (badge.check === 'community') {
      const { count: c } = await supabase.from('mb_community_posts').select('*', { count: 'exact', head: true }).eq('author_id', user!.id)
      count = c || 0
    } else if (badge.check === 'tasks' && familyId) {
      const { count: c } = await supabase.from('mb_tasks').select('*', { count: 'exact', head: true }).eq('family_id', familyId).eq('status', 'done')
      count = c || 0
    }

    if (count >= badge.threshold) {
      newBadges.push(badge.id)
    }
  }

  if (newBadges.length > 0) {
    const allBadges = [...currentBadges, ...newBadges]
    await supabase.from('mb_gamification').update({ badges: allBadges }).eq('profile_id', user!.id)
  }

  console.log('[check-badges POST] success, new badges:', newBadges.length)
  return jsonResponse({
    new_badges: newBadges.map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)),
    all_badges: [...currentBadges, ...newBadges],
  })
}
