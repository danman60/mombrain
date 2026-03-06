'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle, Circle, Clock, GripVertical, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  assigned_to: string | null
  due_date: string | null
  priority: string
  status: string
  category: string | null
  mb_profiles?: { display_name: string; avatar_url: string | null }
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const columns = [
  { key: 'todo', label: 'To Do', icon: Circle },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'done', label: 'Done', icon: CheckCircle },
]

export default function TasksPage() {
  const family = useAppStore((s) => s.family)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newAssignee, setNewAssignee] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    if (!family) { setLoading(false); return }
    fetchTasks()
  }, [family])

  async function fetchTasks() {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data || [])
    setLoading(false)
  }

  async function createTask() {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        priority: newPriority,
        assigned_to: newAssignee || null,
        due_date: newDueDate || null,
        category: newCategory || null,
      }),
    })
    if (res.ok) {
      toast.success('Task created!')
      setShowCreate(false)
      setNewTitle('')
      setNewPriority('medium')
      setNewAssignee('')
      setNewDueDate('')
      fetchTasks()
    }
  }

  async function moveTask(taskId: string, newStatus: string) {
    if (newStatus === 'done') {
      await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      })
      toast.success('+10 points!')
    } else {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      })
    }
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  if (loading) return <div className="grid md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {family && (
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
              <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chores">Chores</SelectItem>
                    <SelectItem value="errands">Errands</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createTask} disabled={!newTitle}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!family ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Create a family first to manage tasks.</p></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key)
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <col.icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">{col.label}</h2>
                  <Badge variant="secondary" className="ml-auto">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/30">
                  {colTasks.map((task) => (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <p className="font-medium text-sm mb-2">{task.title}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          {task.mb_profiles && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {task.mb_profiles.display_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground mt-2">{format(new Date(task.due_date), 'MMM d')}</p>
                        )}
                        {col.key !== 'done' && (
                          <div className="flex gap-1 mt-2">
                            {col.key === 'todo' && (
                              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => moveTask(task.id, 'in_progress')}>
                                Start
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => moveTask(task.id, 'done')}>
                              Complete
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
