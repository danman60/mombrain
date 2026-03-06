import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET(request: Request) {
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
  return jsonResponse(data)
}

export async function POST(request: Request) {
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

  if (dbError) return jsonResponse({ error: dbError.message }, 500)
  return jsonResponse(data, 201)
}

export async function PATCH(request: Request) {
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

  if (dbError) return jsonResponse({ error: dbError.message }, 500)
  return jsonResponse(data)
}

export async function DELETE(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await request.json()
  await supabase.from('mb_tasks').delete().eq('id', id)
  return jsonResponse({ success: true })
}
