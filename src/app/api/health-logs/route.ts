import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  console.log('[health-logs GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const logType = searchParams.get('type')

  let query = supabase
    .from('mb_health_logs')
    .select('*')
    .eq('profile_id', user!.id)
    .order('logged_at', { ascending: false })

  if (logType) query = query.eq('log_type', logType)

  const { data } = await query.limit(100)
  console.log('[health-logs GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[health-logs POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_health_logs')
    .insert({ ...body, profile_id: user!.id })
    .select()
    .single()

  if (dbError) {
    console.error('[health-logs POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }

  // Award gamification points
  const { data: gam } = await supabase
    .from('mb_gamification')
    .select('points')
    .eq('profile_id', user!.id)
    .single()

  if (gam) {
    await supabase.from('mb_gamification').update({ points: gam.points + 5 }).eq('profile_id', user!.id)
    await supabase.from('mb_gamification_log').insert({ profile_id: user!.id, action: 'health_logged', points_earned: 5 })
  }

  console.log('[health-logs POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}
