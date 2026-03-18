import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function POST(request: Request) {
  console.log('[family/join POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { invite_code } = await request.json()
  const { data: family } = await supabase
    .from('mb_families')
    .select('id')
    .eq('invite_code', invite_code)
    .single()

  if (!family) {
    console.error('[family/join POST] invalid invite code')
    return jsonResponse({ error: 'Invalid invite code' }, 404)
  }

  const { error: joinError } = await supabase
    .from('mb_family_members')
    .insert({ family_id: family.id, profile_id: user!.id, role: 'member' })

  if (joinError) {
    if (joinError.code === '23505') {
      console.log('[family/join POST] already a member')
      return jsonResponse({ error: 'Already a member' }, 409)
    }
    console.error('[family/join POST] error:', joinError.message)
    return jsonResponse({ error: joinError.message }, 500)
  }

  console.log('[family/join POST] success, family_id:', family.id)
  return jsonResponse({ family_id: family.id })
}
