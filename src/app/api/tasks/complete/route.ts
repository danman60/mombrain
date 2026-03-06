import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { task_id } = await request.json()

  // Update task status
  const { error: taskError } = await supabase
    .from('mb_tasks')
    .update({ status: 'done' })
    .eq('id', task_id)

  if (taskError) return jsonResponse({ error: taskError.message }, 500)

  // Award points
  const points = 10
  const { error: rpcError } = await supabase.rpc('mb_award_points' as never, {
    p_profile_id: user!.id,
    p_action: 'task_complete',
    p_points: points,
  } as never)
  if (rpcError) {
    // Fallback: manual update if RPC doesn't exist
    await supabase
      .from('mb_gamification')
      .update({ points: supabase.rpc('mb_add_points' as never) as unknown as number })
      .eq('profile_id', user!.id)
  }

  // Log gamification
  await supabase
    .from('mb_gamification_log')
    .insert({ profile_id: user!.id, action: 'task_complete', points_earned: points })

  // Update gamification points directly
  const { data: gam } = await supabase
    .from('mb_gamification')
    .select('points')
    .eq('profile_id', user!.id)
    .single()

  if (gam) {
    await supabase
      .from('mb_gamification')
      .update({ points: gam.points + points })
      .eq('profile_id', user!.id)
  }

  return jsonResponse({ success: true, points_earned: points })
}
