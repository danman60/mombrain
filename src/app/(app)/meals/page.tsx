'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChefHat, Clock, Heart, Plus, Search, Sparkles, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Meal {
  id: string
  title: string
  description: string
  prep_time: number | null
  servings: number | null
  tags: string[]
  ai_generated: boolean
  is_favorite: boolean
  image_url: string | null
}

export default function MealsPage() {
  const family = useAppStore((s) => s.family)
  const [meals, setMeals] = useState<Meal[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrepTime, setNewPrepTime] = useState('')
  const [newServings, setNewServings] = useState('')

  useEffect(() => {
    if (!family) { setLoading(false); return }
    fetchMeals()
  }, [family])

  async function fetchMeals() {
    const res = await fetch(`/api/meals${search ? `?search=${search}` : ''}`)
    const data = await res.json()
    setMeals(data || [])
    setLoading(false)
  }

  async function createMeal() {
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        prep_time: newPrepTime ? parseInt(newPrepTime) : null,
        servings: newServings ? parseInt(newServings) : null,
      }),
    })
    if (res.ok) {
      toast.success('Meal created!')
      setShowCreate(false)
      setNewTitle('')
      setNewDesc('')
      fetchMeals()
    }
  }

  async function toggleFavorite(meal: Meal) {
    await fetch('/api/meals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: meal.id, is_favorite: !meal.is_favorite }),
    })
    setMeals(meals.map((m) => m.id === meal.id ? { ...m, is_favorite: !m.is_favorite } : m))
  }

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meals</h1>
        <div className="flex gap-2">
          <Link href="/meals/generate">
            <Button><Sparkles className="h-4 w-4 mr-2" /> AI Generate</Button>
          </Link>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Meal</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Meal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Prep Time (min)</Label><Input type="number" value={newPrepTime} onChange={(e) => setNewPrepTime(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Servings</Label><Input type="number" value={newServings} onChange={(e) => setNewServings(e.target.value)} /></div>
                </div>
                <Button onClick={createMeal} disabled={!newTitle}>Create Meal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search meals..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchMeals()} />
      </div>

      {!family ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Create a family first to start planning meals.</p></CardContent></Card>
      ) : meals.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No meals yet</p>
          <p className="text-muted-foreground mb-4">Add meals manually or let AI generate a meal plan for you.</p>
          <Link href="/meals/generate"><Button><Sparkles className="h-4 w-4 mr-2" /> Generate Meal Plan</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{meal.title}</h3>
                    <button onClick={(e) => { e.preventDefault(); toggleFavorite(meal) }}>
                      <Heart className={`h-5 w-5 ${meal.is_favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                  {meal.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{meal.description}</p>}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {meal.prep_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {meal.prep_time}min</span>}
                    {meal.servings && <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {meal.servings}</span>}
                    {meal.ai_generated && <Badge variant="secondary" className="text-xs">AI</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
