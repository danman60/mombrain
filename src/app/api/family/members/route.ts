import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { data } = await supabase
    .from('mb_family_members')
    .select('id, profile_id, role, mb_profiles(display_name, avatar_url)')
    .eq('family_id', familyId)

  return jsonResponse(data)
}
