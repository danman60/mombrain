import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('mb_profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (dbError) return jsonResponse({ error: dbError.message }, 500)
  return jsonResponse(data)
}

export async function PATCH(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const body = await request.json()
  const allowed = ['display_name', 'avatar_url', 'timezone', 'measurement_unit', 'tone_preference', 'dark_mode', 'onboarding_completed']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error: dbError } = await supabase
    .from('mb_profiles')
    .update(updates)
    .eq('id', user!.id)
    .select()
    .single()

  if (dbError) return jsonResponse({ error: dbError.message }, 500)
  return jsonResponse(data)
}
