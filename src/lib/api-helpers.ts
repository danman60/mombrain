import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { user, supabase, error: null }
}

export async function getUserFamilyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('mb_family_members')
    .select('family_id')
    .eq('profile_id', userId)
    .single()
  return data?.family_id || null
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}
