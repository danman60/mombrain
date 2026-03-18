'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Moon, SmilePlus, Heart, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface HealthLog {
  id: string
  log_type: string
  log_data: Record<string, unknown>
  logged_at: string
}

const moods = ['😊', '🙂', '😐', '😔', '😢']

export default function HealthPage() {
  const [logs, setLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('sleep')
  const [showLog, setShowLog] = useState(false)

  // Sleep form
  const [sleepHours, setSleepHours] = useState('7')
  const [sleepQuality, setSleepQuality] = useState(3)
  const [sleepNotes, setSleepNotes] = useState('')

  // Mood form
  const [moodValue, setMoodValue] = useState(0)
  const [moodJournal, setMoodJournal] = useState('')

  // Cycle form
  const [cycleType, setCycleType] = useState('start')

  useEffect(() => { fetchLogs() }, [tab])

  async function fetchLogs() {
    const res = await fetch(`/api/health-logs?type=${tab}`)
    const data = await res.json()
    setLogs(data || [])
    setLoading(false)
  }

  async function logHealth() {
    let logData: Record<string, unknown> = {}
    if (tab === 'sleep') {
      logData = { hours: parseFloat(sleepHours), quality: sleepQuality, notes: sleepNotes }
    } else if (tab === 'mood') {
      logData = { mood: moodValue, journal: moodJournal }
    } else if (tab === 'cycle') {
      logData = { type: cycleType }
    }

    const res = await fetch('/api/health-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_type: tab, log_data: logData }),
    })

    if (res.ok) {
      toast.success('Health logged! +5 points')
      setShowLog(false)
      fetchLogs()
    }
  }

  const sleepChartData = logs
    .filter((l) => l.log_type === 'sleep')
    .slice(0, 7)
    .reverse()
    .map((l) => ({
      date: format(new Date(l.logged_at), 'EEE'),
      hours: (l.log_data as { hours: number }).hours || 0,
    }))

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health Tracking</h1>
        <Dialog open={showLog} onOpenChange={setShowLog}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Log</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log {tab.charAt(0).toUpperCase() + tab.slice(1)}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {tab === 'sleep' && (
                <>
                  <div className="space-y-2"><Label>Hours of sleep</Label><Input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Quality (1-5)</Label>
                    <div className="flex gap-2">{[1,2,3,4,5].map((q) => (
                      <button key={q} onClick={() => setSleepQuality(q)}
                        className={`w-10 h-10 rounded-full border-2 text-sm font-medium ${sleepQuality >= q ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                        {q}
                      </button>
                    ))}</div>
                  </div>
                  <div className="space-y-2"><Label>Notes</Label><Textarea value={sleepNotes} onChange={(e) => setSleepNotes(e.target.value)} /></div>
                </>
              )}
              {tab === 'mood' && (
                <>
                  <div className="space-y-2">
                    <Label>How are you feeling?</Label>
                    <div className="flex gap-3 justify-center">{moods.map((m, i) => (
                      <button key={i} onClick={() => setMoodValue(i)}
                        className={`text-3xl p-2 rounded-lg transition-transform ${moodValue === i ? 'scale-125 bg-primary/10' : 'hover:scale-110'}`}>
                        {m}
                      </button>
                    ))}</div>
                  </div>
                  <div className="space-y-2"><Label>Journal (optional)</Label><Textarea value={moodJournal} onChange={(e) => setMoodJournal(e.target.value)} /></div>
                </>
              )}
              {tab === 'cycle' && (
                <div className="space-y-2">
                  <Label>Log Type</Label>
                  <div className="flex gap-3">
                    {['start', 'end', 'note'].map((t) => (
                      <Button key={t} variant={cycleType === t ? 'default' : 'outline'} onClick={() => setCycleType(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={logHealth} className="w-full">Log {tab}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="sleep"><Moon className="h-4 w-4 mr-1" /> Sleep</TabsTrigger>
          <TabsTrigger value="mood"><SmilePlus className="h-4 w-4 mr-1" /> Mood</TabsTrigger>
          <TabsTrigger value="cycle"><Heart className="h-4 w-4 mr-1" /> Cycle</TabsTrigger>
        </TabsList>

        <TabsContent value="sleep">
          <Card>
            <CardHeader><CardTitle>Sleep This Week</CardTitle></CardHeader>
            <CardContent>
              {sleepChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sleepChartData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 12]} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#E11D48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No sleep data yet. Start logging!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood">
          <Card>
            <CardHeader><CardTitle>Mood History</CardTitle></CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No mood data yet.</p>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 14).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <span className="text-2xl">{moods[(log.log_data as { mood: number }).mood || 0]}</span>
                      <div className="flex-1">
                        {(log.log_data as { journal?: string }).journal && (
                          <p className="text-sm">{(log.log_data as { journal: string }).journal}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{format(new Date(log.logged_at), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycle">
          <Card>
            <CardHeader><CardTitle>Cycle Tracking</CardTitle></CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cycle data yet.</p>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg border">
                      <Badge variant={(log.log_data as { type: string }).type === 'start' ? 'default' : 'secondary'}>
                        {(log.log_data as { type: string }).type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{format(new Date(log.logged_at), 'MMM d, yyyy')}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
