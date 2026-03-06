import { getAuthUser, jsonResponse } from '@/lib/api-helpers'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase, error } = await getAuthUser()
  if (error) return error

  const { id } = await params

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('mb_community_upvotes')
    .select('id')
    .eq('post_id', id)
    .eq('profile_id', user!.id)
    .single()

  if (existing) {
    // Remove upvote
    await supabase.from('mb_community_upvotes').delete().eq('id', existing.id)
    const { error: rpcError } = await supabase.rpc('mb_decrement_upvotes' as never, { p_post_id: id } as never)
    if (rpcError) {
      const { data: post } = await supabase.from('mb_community_posts').select('upvotes').eq('id', id).single()
      if (post) await supabase.from('mb_community_posts').update({ upvotes: Math.max(0, post.upvotes - 1) }).eq('id', id)
    }
    return jsonResponse({ upvoted: false })
  }

  // Add upvote
  await supabase.from('mb_community_upvotes').insert({ post_id: id, profile_id: user!.id })
  const { data: post } = await supabase.from('mb_community_posts').select('upvotes').eq('id', id).single()
  if (post) await supabase.from('mb_community_posts').update({ upvotes: post.upvotes + 1 }).eq('id', id)

  return jsonResponse({ upvoted: true })
}
