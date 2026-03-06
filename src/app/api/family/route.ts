import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family found' }, 404)

  const { data } = await supabase
    .from('mb_families')
    .select('*')
    .eq('id', familyId)
    .single()

  return jsonResponse(data)
}

export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { name } = await request.json()
  const { data: family, error: dbError } = await supabase
    .from('mb_families')
    .insert({ name, created_by: user!.id })
    .select()
    .single()

  if (dbError) return jsonResponse({ error: dbError.message }, 500)

  await supabase
    .from('mb_family_members')
    .insert({ family_id: family.id, profile_id: user!.id, role: 'admin' })

  return jsonResponse(family, 201)
}
