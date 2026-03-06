'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Clock, Heart, Users } from 'lucide-react'
import Link from 'next/link'

interface Meal {
  id: string
  title: string
  description: string
  ingredients: Array<{ name: string; quantity: string }>
  instructions: string[]
  prep_time: number | null
  servings: number | null
  tags: string[]
  ai_generated: boolean
  is_favorite: boolean
}

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/meals')
      const meals = await res.json()
      const found = (meals || []).find((m: Meal) => m.id === id)
      setMeal(found || null)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>
  if (!meal) return <div className="text-center py-12"><p>Meal not found</p><Link href="/meals"><Button variant="link">Back to meals</Button></Link></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/meals" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to meals
      </Link>

      <div>
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">{meal.title}</h1>
          <Heart className={`h-6 w-6 ${meal.is_favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </div>
        {meal.description && <p className="text-muted-foreground mt-2">{meal.description}</p>}
        <div className="flex gap-4 mt-3">
          {meal.prep_time && <span className="flex items-center gap-1 text-sm"><Clock className="h-4 w-4" /> {meal.prep_time} min</span>}
          {meal.servings && <span className="flex items-center gap-1 text-sm"><Users className="h-4 w-4" /> {meal.servings} servings</span>}
          {meal.ai_generated && <Badge variant="secondary">AI Generated</Badge>}
        </div>
        {meal.tags?.length > 0 && (
          <div className="flex gap-2 mt-3">{meal.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
        <CardContent>
          {(meal.ingredients || []).length === 0 ? (
            <p className="text-muted-foreground">No ingredients listed</p>
          ) : (
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{ing.quantity && `${ing.quantity} `}{ing.name}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
        <CardContent>
          {(meal.instructions || []).length === 0 ? (
            <p className="text-muted-foreground">No instructions listed</p>
          ) : (
            <ol className="space-y-3">
              {meal.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
