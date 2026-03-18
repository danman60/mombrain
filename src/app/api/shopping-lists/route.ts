import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET() {
  console.log('[shopping-lists GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { data } = await supabase
    .from('mb_shopping_lists')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  console.log('[shopping-lists GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[shopping-lists POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_shopping_lists')
    .insert({ ...body, family_id: familyId })
    .select()
    .single()

  if (dbError) {
    console.error('[shopping-lists POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[shopping-lists POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}

export async function PATCH(request: Request) {
  console.log('[shopping-lists PATCH] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { id, ...updates } = body

  const { data, error: dbError } = await supabase
    .from('mb_shopping_lists')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('[shopping-lists PATCH] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[shopping-lists PATCH] success, id:', data?.id)
  return jsonResponse(data)
}
