import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET() {
  console.log('[children GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { data } = await supabase
    .from('mb_children')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at')

  console.log('[children GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[children POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_children')
    .insert({ ...body, family_id: familyId })
    .select()
    .single()

  if (dbError) {
    console.error('[children POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[children POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}

export async function PATCH(request: Request) {
  console.log('[children PATCH] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { id, ...updates } = body

  const { data, error: dbError } = await supabase
    .from('mb_children')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('[children PATCH] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[children PATCH] success, id:', data?.id)
  return jsonResponse(data)
}

export async function DELETE(request: Request) {
  console.log('[children DELETE] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await request.json()
  const { error: dbError } = await supabase
    .from('mb_children')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('[children DELETE] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[children DELETE] success')
  return jsonResponse({ success: true })
}
