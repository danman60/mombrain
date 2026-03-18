import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log('[comments GET] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  const { data } = await supabase
    .from('mb_community_comments')
    .select('*, mb_profiles!mb_community_comments_author_id_fkey(display_name, avatar_url)')
    .eq('post_id', id)
    .order('created_at')

  console.log('[comments GET] success, count:', data?.length)
  return jsonResponse(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log('[comments POST] called')
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params
  const { body: commentBody } = await request.json()

  const { data, error: dbError } = await supabase
    .from('mb_community_comments')
    .insert({ post_id: id, author_id: user!.id, body: commentBody })
    .select()
    .single()

  if (dbError) {
    console.error('[comments POST] error:', dbError.message)
    return jsonResponse({ error: dbError.message }, 500)
  }
  console.log('[comments POST] success, id:', data?.id)
  return jsonResponse(data, 201)
}
