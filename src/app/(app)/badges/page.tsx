'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, Lock, Trophy, ChefHat, Calendar, Zap, Users, Star } from 'lucide-react'

interface Gamification {
  points: number
  streak_days: number
  level: number
  badges: string[]
  last_login_date: string | null
}

interface Activity {
  id: string
  action: string
  points_earned: number
  earned_at: string
}

const BADGE_DEFS = [
  { id: 'meal_prep_queen', name: 'Meal Prep Queen', desc: 'Plan 4 weeks of meals', icon: ChefHat, color: 'text-orange-500' },
  { id: 'schedule_ninja', name: 'Schedule Ninja', desc: 'Create 20 events', icon: Calendar, color: 'text-blue-500' },
  { id: 'streak_legend', name: 'Streak Legend', desc: '30-day login streak', icon: Flame, color: 'text-red-500' },
  { id: 'community_star', name: 'Community Star', desc: '10 upvoted posts', icon: Star, color: 'text-yellow-500' },
  { id: 'super_mom', name: 'Super Mom', desc: 'Complete 100 tasks', icon: Trophy, color: 'text-purple-500' },
]

export default function BadgesPage() {
  const [gamification, setGamification] = useState<Gamification | null>(null)
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/gamification')
      const data = await res.json()
      setGamification(data.gamification)
      setActivity(data.recent_activity || [])
      setLoading(false)

      // Check for new badges
      await fetch('/api/gamification/check-badges', { method: 'POST' })
    }
    load()
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const earnedBadges = (gamification?.badges as string[]) || []
  const level = gamification?.level || 1
  const pointsToNext = level * 100
  const progress = ((gamification?.points || 0) % 100) / 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Badges & Progress</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{gamification?.points || 0}</p>
            <p className="text-sm text-muted-foreground">Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{gamification?.streak_days || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">Level {level}</p>
            <p className="text-sm text-muted-foreground">{pointsToNext - ((gamification?.points || 0) % 100)} to next</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-sm text-muted-foreground">Level {level + 1}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BADGE_DEFS.map((badge) => {
              const earned = earnedBadges.includes(badge.id)
              return (
                <div key={badge.id} className={`p-4 rounded-xl border text-center ${earned ? 'bg-primary/5 border-primary/20' : 'opacity-50'}`}>
                  {earned ? (
                    <badge.icon className={`h-10 w-10 mx-auto mb-2 ${badge.color}`} />
                  ) : (
                    <Lock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet. Start earning points!</p>
          ) : (
            <div className="space-y-2">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{a.action.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-primary">+{a.points_earned}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
