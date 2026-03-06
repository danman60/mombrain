'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'

const tones = [
  { value: 'supportive', label: 'Supportive', desc: 'Warm and encouraging' },
  { value: 'direct', label: 'Direct', desc: 'Straight to the point' },
  { value: 'fun', label: 'Fun', desc: 'Light-hearted and playful' },
]

const units = [
  { value: 'imperial', label: 'Imperial', desc: 'lbs, oz, °F' },
  { value: 'metric', label: 'Metric', desc: 'kg, g, °C' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [tone, setTone] = useState('supportive')
  const [unit, setUnit] = useState('imperial')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update profile
    await supabase
      .from('mb_profiles')
      .update({
        display_name: name,
        tone_preference: tone,
        measurement_unit: unit,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    // Create family if name provided
    if (familyName) {
      const { data: family } = await supabase
        .from('mb_families')
        .insert({ name: familyName, created_by: user.id })
        .select()
        .single()

      if (family) {
        await supabase
          .from('mb_family_members')
          .insert({ family_id: family.id, profile_id: user.id, role: 'admin' })
      }
    }

    toast.success('Welcome to MomBrain!')
    router.push('/dashboard')
    router.refresh()
  }

  const steps = [
    // Step 0: Name
    <div key="name" className="space-y-4">
      <h2 className="text-xl font-semibold">What should we call you?</h2>
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" placeholder="e.g., Sarah" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
    </div>,
    // Step 1: Family
    <div key="family" className="space-y-4">
      <h2 className="text-xl font-semibold">Name your family</h2>
      <p className="text-muted-foreground text-sm">You can invite members later with a code.</p>
      <div className="space-y-2">
        <Label htmlFor="family">Family name</Label>
        <Input id="family" placeholder="e.g., The Johnsons" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
      </div>
    </div>,
    // Step 2: Tone
    <div key="tone" className="space-y-4">
      <h2 className="text-xl font-semibold">How should your AI assistant talk?</h2>
      <div className="grid gap-3">
        {tones.map((t) => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              tone === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-medium">{t.label}</p>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>,
    // Step 3: Units
    <div key="units" className="space-y-4">
      <h2 className="text-xl font-semibold">Measurement preference</h2>
      <div className="grid gap-3">
        {units.map((u) => (
          <button
            key={u.value}
            onClick={() => setUnit(u.value)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              unit === u.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-medium">{u.label}</p>
            <p className="text-sm text-muted-foreground">{u.desc}</p>
          </button>
        ))}
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Brain className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle>Set up your MomBrain</CardTitle>
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {steps[step]}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !name}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                <Check className="h-4 w-4 mr-1" /> Finish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
