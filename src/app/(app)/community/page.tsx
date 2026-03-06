'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUp, MessageCircle, Plus } from 'lucide-react'
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

const categories = ['all', 'tip', 'recipe', 'question', 'win']
const categoryColors: Record<string, string> = {
  tip: 'bg-blue-100 text-blue-700',
  recipe: 'bg-green-100 text-green-700',
  question: 'bg-amber-100 text-amber-700',
  win: 'bg-purple-100 text-purple-700',
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newCategory, setNewCategory] = useState('tip')

  useEffect(() => { fetchPosts() }, [category])

  async function fetchPosts() {
    const res = await fetch(`/api/community/posts?category=${category}`)
    const data = await res.json()
    setPosts(data || [])
    setLoading(false)
  }

  async function createPost() {
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, body: newBody, category: newCategory }),
    })
    if (res.ok) {
      toast.success('Post created! +15 points')
      setShowCreate(false)
      setNewTitle('')
      setNewBody('')
      fetchPosts()
    }
  }

  async function upvotePost(postId: string) {
    await fetch(`/api/community/posts/${postId}/upvote`, { method: 'POST' })
    setPosts(posts.map((p) => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
  }

  if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> New Post</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Body</Label><Textarea rows={4} value={newBody} onChange={(e) => setNewBody(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="recipe">Recipe</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createPost} disabled={!newTitle || !newBody}>Post</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger key={c} value={c} className="capitalize">{c === 'all' ? 'All' : c}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No posts yet. Be the first!</CardContent></Card>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/community/post/${post.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={(e) => { e.preventDefault(); upvotePost(post.id) }}>
                        <ArrowUp className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </button>
                      <span className="text-sm font-medium">{post.upvotes}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={categoryColors[post.category]}>{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(post.created_at), 'MMM d')}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.mb_profiles?.avatar_url || ''} />
                          <AvatarFallback className="text-[10px]">{post.mb_profiles?.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{post.mb_profiles?.display_name}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
