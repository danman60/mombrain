'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar, CheckSquare, ChefHat, Flame, MessageCircle,
  Plus, Trophy, Clock
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface DashboardEvent {
  id: string
  title: string
  start_time: string
  color: string
}

interface DashboardTask {
  id: string
  title: string
  priority: string
  due_date: string | null
  status: string
}

interface DashboardGamification {
  points: number
  streak_days: number
  level: number
  badges: string[]
}

export default function DashboardPage() {
  const profile = useAppStore((s) => s.profile)
  const family = useAppStore((s) => s.family)
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [gamification, setGamification] = useState<DashboardGamification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !family) {
        setLoading(false)
        return
      }

      const now = new Date().toISOString()
      const [eventsRes, tasksRes, gamRes] = await Promise.all([
        supabase
          .from('mb_events')
          .select('id, title, start_time, color')
          .eq('family_id', family.id)
          .gte('start_time', now)
          .order('start_time')
          .limit(3),
        supabase
          .from('mb_tasks')
          .select('id, title, priority, due_date, status')
          .eq('family_id', family.id)
          .neq('status', 'done')
          .order('priority')
          .limit(5),
        supabase
          .from('mb_gamification')
          .select('*')
          .eq('profile_id', user.id)
          .single(),
      ])

      setEvents(eventsRes.data || [])
      setTasks(tasksRes.data || [])
      setGamification(gamRes.data)
      setLoading(false)
    }

    if (family) loadDashboard()
    else {
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [family])

  const priorityColor = (p: string) =>
    p === 'high' ? 'destructive' : p === 'medium' ? 'default' : 'secondary'

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting()}, {profile?.display_name || 'Mom'}
        </h1>
        <p className="text-muted-foreground">Here&apos;s your family overview for today.</p>
      </div>

      {!family && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6 text-center">
            <p className="text-lg font-medium mb-2">Create your family to get started</p>
            <p className="text-muted-foreground mb-4">Set up your family to start planning meals, managing tasks, and more.</p>
            <Link href="/family">
              <Button><Plus className="h-4 w-4 mr-2" /> Create Family</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="flex items-start gap-2">
                  <div className="w-1 h-8 rounded-full mt-0.5" style={{ backgroundColor: e.color }} />
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {format(new Date(e.start_time), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="w-full mt-2">View All</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4 text-primary" /> Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">All caught up!</p>
            ) : (
              tasks.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate">{t.title}</p>
                  <Badge variant={priorityColor(t.priority) as 'default' | 'secondary' | 'destructive'}>{t.priority}</Badge>
                </div>
              ))
            )}
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="w-full mt-2">View All</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ChefHat className="h-4 w-4 text-primary" /> Today&apos;s Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">No meal plan for today</p>
            <Link href="/meals/generate">
              <Button variant="outline" size="sm" className="w-full">Generate Meal Plan</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Gamification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" /> Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Points</span>
                <span className="font-bold text-primary">{gamification?.points || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Streak</span>
                <span className="flex items-center gap-1 font-bold">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {gamification?.streak_days || 0} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <span className="font-bold">{gamification?.level || 1}</span>
              </div>
            </div>
            <Link href="/badges">
              <Button variant="ghost" size="sm" className="w-full mt-3">View Badges</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/tasks"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button></Link>
        <Link href="/calendar"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Add Event</Button></Link>
        <Link href="/ai"><Button size="sm" variant="outline"><MessageCircle className="h-4 w-4 mr-1" /> Ask AI</Button></Link>
        <Link href="/health"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Log Health</Button></Link>
      </div>
    </div>
  )
}
