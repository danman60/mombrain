import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET() {
  console.log('[family GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family found' }, 404)

  const { data } = await supabase
    .from('mb_families')
    .select('*')
    .eq('id', familyId)
    .single()

  console.log('[family GET] success, id:', data?.id)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[family POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { name } = await request.json()
  const { data: family, error: dbError } = await supabase
    .from('mb_families')
    .insert({ name, created_by: user!.id })
    .select()
    .single()

  if (dbError) {
    console.error('[family POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }

  await supabase
    .from('mb_family_members')
    .insert({ family_id: family.id, profile_id: user!.id, role: 'admin' })

  console.log('[family POST] success, id:', family.id)
  return jsonResponse(family, 201)
}
