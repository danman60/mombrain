'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ArrowUp, Send } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  body: string
  category: string
  upvotes: number
  created_at: string
  mb_profiles: { display_name: string; avatar_url: string | null }
}

interface Comment {
  id: string
  body: string
  created_at: string
  mb_profiles: { display_name: string; avatar_url: string | null }
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [postsRes, commentsRes] = await Promise.all([
        fetch('/api/community/posts'),
        fetch(`/api/community/posts/${id}/comments`),
      ])
      const posts = await postsRes.json()
      const foundPost = (posts || []).find((p: Post) => p.id === id)
      setPost(foundPost || null)
      setComments(await commentsRes.json() || [])
      setLoading(false)
    }
    load()
  }, [id])

  async function addComment() {
    if (!newComment.trim()) return
    const res = await fetch(`/api/community/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newComment }),
    })
    if (res.ok) {
      toast.success('Comment added!')
      setNewComment('')
      const commentsRes = await fetch(`/api/community/posts/${id}/comments`)
      setComments(await commentsRes.json() || [])
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /></div>
  if (!post) return <div className="text-center py-12">Post not found</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/community" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to community
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge>{post.category}</Badge>
            <span className="text-sm text-muted-foreground">{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
          </div>
          <h1 className="text-xl font-bold mb-3">{post.title}</h1>
          <p className="whitespace-pre-wrap mb-4">{post.body}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.mb_profiles?.avatar_url || ''} />
                <AvatarFallback className="text-xs">{post.mb_profiles?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{post.mb_profiles?.display_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4" />
              <span className="text-sm font-medium">{post.upvotes}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comments ({comments.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{c.mb_profiles?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{c.mb_profiles?.display_name}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-sm">{c.body}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2} className="flex-1" />
            <Button size="icon" onClick={addComment} disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
