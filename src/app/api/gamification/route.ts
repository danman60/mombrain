import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET() {
  console.log('[gamification GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { data } = await supabase
    .from('mb_gamification')
    .select('*')
    .eq('profile_id', user!.id)
    .single()

  const { data: log } = await supabase
    .from('mb_gamification_log')
    .select('*')
    .eq('profile_id', user!.id)
    .order('earned_at', { ascending: false })
    .limit(20)

  console.log('[gamification GET] success, points:', data?.points, 'log count:', log?.length)
  return jsonResponse({ gamification: data, recent_activity: log })
}
