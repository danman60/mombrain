import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET(request: Request) {
  console.log('[tasks GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('mb_tasks')
    .select('*, mb_profiles!mb_tasks_assigned_to_fkey(display_name, avatar_url)')
    .eq('family_id', familyId)
    .order('sort_order')

  if (status) query = query.eq('status', status)

  const { data } = await query
  console.log('[tasks GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[tasks POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_tasks')
    .insert({ ...body, family_id: familyId, created_by: user!.id })
    .select()
    .single()

  if (dbError) {
    console.error('[tasks POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[tasks POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}

export async function PATCH(request: Request) {
  console.log('[tasks PATCH] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { id, ...updates } = body

  const { data, error: dbError } = await supabase
    .from('mb_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('[tasks PATCH] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[tasks PATCH] success, id:', data?.id)
  return jsonResponse(data)
}

export async function DELETE(request: Request) {
  console.log('[tasks DELETE] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await request.json()
  await supabase.from('mb_tasks').delete().eq('id', id)
  console.log('[tasks DELETE] success')
  return jsonResponse({ success: true })
}
