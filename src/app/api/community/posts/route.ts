import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  console.log('[community/posts GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '0')
  const limit = 20

  let query = supabase
    .from('mb_community_posts')
    .select('*, mb_profiles!mb_community_posts_author_id_fkey(display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (category && category !== 'all') query = query.eq('category', category)

  const { data } = await query
  console.log('[community/posts GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[community/posts POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_community_posts')
    .insert({ ...body, author_id: user!.id })
    .select()
    .single()

  if (dbError) {
    console.error('[community/posts POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }

  // Award points
  const { data: gam } = await supabase.from('mb_gamification').select('points').eq('profile_id', user!.id).single()
  if (gam) {
    await supabase.from('mb_gamification').update({ points: gam.points + 15 }).eq('profile_id', user!.id)
    await supabase.from('mb_gamification_log').insert({ profile_id: user!.id, action: 'community_post', points_earned: 15 })
  }

  console.log('[community/posts POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}
