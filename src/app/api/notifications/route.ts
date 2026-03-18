import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  console.log('[notifications GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  let query = supabase
    .from('mb_notifications')
    .select('*')
    .eq('profile_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) query = query.eq('read', false)

  const { data } = await query
  console.log('[notifications GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function PATCH(request: Request) {
  console.log('[notifications PATCH] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id, read } = await request.json()

  if (id === 'all') {
    await supabase.from('mb_notifications').update({ read: true }).eq('profile_id', user!.id).eq('read', false)
  } else {
    await supabase.from('mb_notifications').update({ read }).eq('id', id)
  }

  console.log('[notifications PATCH] success, id:', id)
  return jsonResponse({ success: true })
}
