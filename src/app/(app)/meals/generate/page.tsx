'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function GenerateMealPlanPage() {
  const [familySize, setFamilySize] = useState('4')
  const [dietary, setDietary] = useState('')
  const [preferences, setPreferences] = useState('')
  const [budget, setBudget] = useState('moderate')
  const [timeConstraints, setTimeConstraints] = useState('')
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/meal-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_size: familySize,
          dietary_restrictions: dietary,
          preferences,
          budget,
          time_constraints: timeConstraints,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Meal plan created with ${data.meals_created} recipes!`)
        router.push('/meals')
      } else {
        toast.error(data.error || 'Failed to generate')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setGenerating(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/meals" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to meals
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate AI Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Family Size</Label>
            <Input type="number" value={familySize} onChange={(e) => setFamilySize(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <Textarea placeholder="e.g., gluten-free, nut allergy, vegetarian" value={dietary} onChange={(e) => setDietary(e.target.value)} />
            <p className="text-xs text-muted-foreground">Children&apos;s dietary preferences will be included automatically.</p>
          </div>
          <div className="space-y-2">
            <Label>Preferences</Label>
            <Textarea placeholder="e.g., Mediterranean food, quick meals, kid-friendly" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Budget</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget-friendly</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="no_limit">No limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time Constraints</Label>
            <Input placeholder="e.g., 30 min max on weekdays" value={timeConstraints} onChange={(e) => setTimeConstraints(e.target.value)} />
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating... (this may take a moment)</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate 7-Day Meal Plan</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
