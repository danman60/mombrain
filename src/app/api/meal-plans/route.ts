import { getAuthUser, jsonResponse, getUserFamilyId } from '@/lib/api-helpers'

export async function GET(request: Request) {
  console.log('[meal-plans GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start')

  let query = supabase
    .from('mb_meal_plans')
    .select('*')
    .eq('family_id', familyId)
    .order('week_start_date', { ascending: false })

  if (weekStart) query = query.eq('week_start_date', weekStart)

  const { data } = await query.limit(10)
  console.log('[meal-plans GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request) {
  console.log('[meal-plans POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const familyId = await getUserFamilyId(supabase, user!.id)
  if (!familyId) return jsonResponse({ error: 'No family' }, 404)

  const body = await request.json()
  const { data, error: dbError } = await supabase
    .from('mb_meal_plans')
    .insert({ ...body, family_id: familyId, created_by: user!.id })
    .select()
    .single()

  if (dbError) {
    console.error('[meal-plans POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[meal-plans POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}
