'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Plus, Trash2, Users, Baby, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function FamilyPage() {
  const family = useAppStore((s) => s.family)
  const setFamily = useAppStore((s) => s.setFamily)
  const [familyName, setFamilyName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [childName, setChildName] = useState('')
  const [childDob, setChildDob] = useState('')
  const [childAllergies, setChildAllergies] = useState('')
  const [childNotes, setChildNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showChildDialog, setShowChildDialog] = useState(false)

  async function createFamily() {
    setLoading(true)
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: familyName }),
    })
    if (res.ok) {
      toast.success('Family created!')
      setShowCreateDialog(false)
      window.location.reload()
    } else {
      toast.error('Failed to create family')
    }
    setLoading(false)
  }

  async function joinFamily() {
    setLoading(true)
    const res = await fetch('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: joinCode }),
    })
    if (res.ok) {
      toast.success('Joined family!')
      setShowJoinDialog(false)
      window.location.reload()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to join')
    }
    setLoading(false)
  }

  async function addChild() {
    setLoading(true)
    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: childName,
        date_of_birth: childDob || null,
        notes: childNotes || null,
        dietary_preferences: childAllergies ? { allergies: childAllergies.split(',').map(s => s.trim()) } : {},
      }),
    })
    if (res.ok) {
      toast.success('Child added!')
      setShowChildDialog(false)
      setChildName('')
      setChildDob('')
      setChildAllergies('')
      setChildNotes('')
      window.location.reload()
    }
    setLoading(false)
  }

  async function removeChild(id: string) {
    await fetch('/api/children', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (family) {
      setFamily({ ...family, children: family.children.filter((c) => c.id !== id) })
    }
    toast.success('Child removed')
  }

  if (!family) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Family</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">No family yet</p>
            <p className="text-muted-foreground">Create a new family or join an existing one.</p>
            <div className="flex gap-3 justify-center">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Create Family</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Family</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Family Name</Label>
                      <Input placeholder="The Johnsons" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
                    </div>
                    <Button onClick={createFamily} disabled={loading || !familyName}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild><Button variant="outline">Join Family</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Join a Family</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Invite Code</Label>
                      <Input placeholder="abc12345" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                    </div>
                    <Button onClick={joinFamily} disabled={loading || !joinCode}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Join
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{family.name}</h1>

      {/* Invite Code */}
      <Card>
        <CardHeader><CardTitle>Invite Code</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="bg-muted px-4 py-2 rounded-lg text-lg font-mono">{family.invite_code}</code>
            <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(family.invite_code); toast.success('Copied!') }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Share this code to invite family members.</p>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader><CardTitle>Members ({family.members.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {family.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={m.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.display_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium flex-1">{m.display_name}</span>
              <Badge variant="secondary">{m.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Children */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Children ({family.children.length})</CardTitle>
          <Dialog open={showChildDialog} onOpenChange={setShowChildDialog}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Child</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Child</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={childName} onChange={(e) => setChildName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={childDob} onChange={(e) => setChildDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Allergies (comma-separated)</Label>
                  <Input placeholder="peanuts, dairy" value={childAllergies} onChange={(e) => setChildAllergies(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={childNotes} onChange={(e) => setChildNotes(e.target.value)} />
                </div>
                <Button onClick={addChild} disabled={loading || !childName}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add Child
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {family.children.length === 0 ? (
            <p className="text-muted-foreground text-sm">No children added yet.</p>
          ) : (
            family.children.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Baby className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  {c.date_of_birth && <p className="text-sm text-muted-foreground">Born: {c.date_of_birth}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeChild(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
