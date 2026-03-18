'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth, startOfWeek, endOfWeek } from 'date-fns'
import { toast } from 'sonner'

interface CalEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string | null
  location: string | null
  color: string
  assigned_to: string | null
}

const COLORS = ['#E11D48', '#F97316', '#10B981', '#8B5CF6', '#FB7185', '#06B6D4', '#F59E0B']

export default function CalendarPage() {
  const family = useAppStore((s) => s.family)
  const [events, setEvents] = useState<CalEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newColor, setNewColor] = useState('#6C63FF')
  const [newAssignee, setNewAssignee] = useState('')

  useEffect(() => {
    if (!family) { setLoading(false); return }
    fetchEvents()
  }, [family, currentMonth])

  async function fetchEvents() {
    const start = startOfMonth(currentMonth).toISOString()
    const end = endOfMonth(currentMonth).toISOString()
    const res = await fetch(`/api/events?start=${start}&end=${end}`)
    const data = await res.json()
    setEvents(data || [])
    setLoading(false)
  }

  async function createEvent() {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        start_time: newStart,
        end_time: newEnd || null,
        location: newLocation || null,
        color: newColor,
        assigned_to: newAssignee || null,
      }),
    })
    if (res.ok) {
      toast.success('Event created!')
      setShowCreate(false)
      setNewTitle('')
      setNewDesc('')
      setNewStart('')
      setNewEnd('')
      setNewLocation('')
      fetchEvents()
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const dayEvents = (day: Date) => events.filter((e) => isSameDay(new Date(e.start_time), day))

  const selectedDayEvents = selectedDate ? dayEvents(selectedDate) : []

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} /></div>
                <div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Location</Label><Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} /></div>
              {family && family.members.length > 0 && (
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={newAssignee} onValueChange={setNewAssignee}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      {family.members.map((m) => (
                        <SelectItem key={m.profile_id} value={m.profile_id}>{m.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">{COLORS.map((c) => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${newColor === c ? 'border-foreground' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}</div>
              </div>
              <Button onClick={createEvent} disabled={!newTitle || !newStart}>Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {days.map((day) => {
              const de = dayEvents(day)
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`bg-card p-2 min-h-[80px] text-left hover:bg-accent/50 transition-colors ${
                    !isSameMonth(day, currentMonth) ? 'opacity-40' : ''
                  } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                >
                  <span className={`text-sm ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {de.slice(0, 2).map((e) => (
                      <div key={e.id} className="text-xs truncate px-1 py-0.5 rounded" style={{ backgroundColor: e.color + '20', color: e.color }}>
                        {e.title}
                      </div>
                    ))}
                    {de.length > 2 && <span className="text-xs text-muted-foreground">+{de.length - 2} more</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader><CardTitle>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground">No events on this day.</p>
            ) : (
              selectedDayEvents.map((e) => (
                <div key={e.id} className="flex gap-3 p-3 rounded-lg border">
                  <div className="w-1 rounded-full" style={{ backgroundColor: e.color }} />
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {format(new Date(e.start_time), 'h:mm a')}
                      {e.end_time && ` — ${format(new Date(e.end_time), 'h:mm a')}`}
                    </p>
                    {e.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</p>}
                    {e.description && <p className="text-sm mt-1">{e.description}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
