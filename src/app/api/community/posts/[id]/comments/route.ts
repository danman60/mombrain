import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  const { data } = await supabase
    .from('mb_community_comments')
    .select('*, mb_profiles!mb_community_comments_author_id_fkey(display_name, avatar_url)')
    .eq('post_id', id)
    .order('created_at')

  return jsonResponse(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params
  const { body: commentBody } = await request.json()

  const { data, error: dbError } = await supabase
    .from('mb_community_comments')
    .insert({ post_id: id, author_id: user!.id, body: commentBody })
    .select()
    .single()

  if (dbError) return jsonResponse({ error: dbError.message }, 500)
  return jsonResponse(data, 201)
}
