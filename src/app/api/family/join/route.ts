import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { invite_code } = await request.json()
  const { data: family } = await supabase
    .from('mb_families')
    .select('id')
    .eq('invite_code', invite_code)
    .single()

  if (!family) return jsonResponse({ error: 'Invalid invite code' }, 404)

  const { error: joinError } = await supabase
    .from('mb_family_members')
    .insert({ family_id: family.id, profile_id: user!.id, role: 'member' })

  if (joinError) {
    if (joinError.code === '23505') return jsonResponse({ error: 'Already a member' }, 409)
    return jsonResponse({ error: joinError.message }, 500)
  }

  return jsonResponse({ family_id: family.id })
}
