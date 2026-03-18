import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET(request: Request) {
  console.log('[meals GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  let query = supabase
    .from('mb_meals')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('title', `%${search}%`)

  const { data } = await query
  console.log('[meals GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[meals POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_meals')
    .insert({ ...body, family_id: familyId })
    .select()
    .single()

  if (dbError) {
    console.error('[meals POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[meals POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}

export async function PATCH(request: Request) {
  console.log('[meals PATCH] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const { id, ...updates } = body

  const { data, error: dbError } = await supabase
    .from('mb_meals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('[meals PATCH] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[meals PATCH] success, id:', data?.id)
  return jsonResponse(data)
}

export async function DELETE(request: Request) {
  console.log('[meals DELETE] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await request.json()
  await supabase.from('mb_meals').delete().eq('id', id)
  console.log('[meals DELETE] success')
  return jsonResponse({ success: true })
}
